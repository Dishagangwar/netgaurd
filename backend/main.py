import os
import glob
import json
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
# import time  

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
model = None

# load latest model 
try:
    model_files= glob.glob(os.path.join(BASE_DIR, "xgboost_netguard_v2_*.pkl"))
    if len(model_files) > 0:
        latest_model = max(model_files, key=os.path.getctime)
        model = joblib.load(latest_model)
        print("INFO: loaded model ->", latest_model)
    else:
        print("warning: no v2 model found")
except Exception as e:
    print("model load error:", e)


# historical telemetry, powers the "past" window of the timeline
HISTORY = None
EVENTS_P90 = 2.0
LOGVOL_P90 = 67.0

try:
    HISTORY = pd.read_csv(os.path.join(BASE_DIR, "..", "data", "master_train.csv"))
    EVENTS_P90 = float(HISTORY["num_events"].quantile(0.90)) or 1.0
    LOGVOL_P90 = float(HISTORY["total_log_volume"].quantile(0.90)) or 1.0
    print("INFO: loaded history ->", len(HISTORY), "records /", HISTORY["location"].nunique(), "nodes")
except Exception as e:
    print("history load error:", e)


class NetworkData(BaseModel):
    location: int
    severity_type: int
    num_events: int
    num_resources : int
    total_log_volume: int

class CopilotRequest(BaseModel):
    role: str
    fault_severity: int
    location: str

class RemediationRequest(BaseModel):
    """Everything the copilot needs to reason about one flagged node."""
    location: int
    severity: int = 0
    severity_label: str = "Unknown"
    past_risk: float = 0.0
    present_risk: float = 0.0
    future_risk: float = 0.0
    past_summary: str = ""
    severity_type: int = 0
    num_events: int = 0
    num_resources: int = 0
    total_log_volume: int = 0


SEVERITY_LABELS = {0: "Normal", 1: "Warning", 2: "Critical"}

GEMINI_CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-pro-latest",
]

# one shared rule for all three windows, so a red bar means the same thing
# wherever it appears on the chart: risk >= 50% is a fault, below it is clear
FAULT_THRESHOLD = 50.0


def _clamp(value, low=0.0, high=100.0):
    return max(low, min(high, value))


def _parse_model_json(raw: str):
    """
    Gemini is asked for pure JSON but will sometimes wrap it in a markdown
    fence or add a sentence around it. Strip the fence, and if that still is
    not valid JSON, fall back to the outermost {...} block.
    """
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("```")[1] if "```" in text[3:] else text[3:]
        if text.lstrip().startswith("json"):
            text = text.lstrip()[4:]
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise


def _generate_with_gemini_fallback(prompt: str):
    """
    Iterate through available Gemini candidate models to prevent 429 quota limits.
    """
    last_err = None
    for model_name in GEMINI_CANDIDATE_MODELS:
        try:
            ai_model = genai.GenerativeModel(model_name)
            resp = ai_model.generate_content(prompt)
            if resp and resp.text:
                return _parse_model_json(resp.text), model_name
        except Exception as e:
            print(f"INFO: Model {model_name} rate-limited or unavailable: {e}. Trying fallback...")
            last_err = e
            continue
    raise last_err or Exception("All Gemini models failed.")


def _present_window(data: NetworkData):
    """Current fault state, straight from the XGBoost classifier."""
    df = pd.DataFrame([data.dict()])
    severity = int(model.predict(df)[0])
    probs = model.predict_proba(df).tolist()[0]

    # risk = probability the node sits in ANY fault class (1 or 2)
    risk = round(sum(probs[1:]) * 100, 2)
    confidence = round(max(probs) * 100, 2)

    return {
        "phase": "present",
        "title": "Present",
        "subtitle": "Live prediction",
        "has_data": True,
        "fault": risk >= FAULT_THRESHOLD,
        "risk": risk,
        "severity": severity,
        "severity_label": SEVERITY_LABELS.get(severity, "Unknown"),
        "confidence": confidence,
        "detail": (
            f"XGBoost classifies node {data.location} as "
            f"{SEVERITY_LABELS.get(severity, 'Unknown')} (class {severity}) "
            f"with {confidence}% confidence. Combined probability of a fault "
            f"state is {risk}%."
        ),
        "source": "XGBoost classifier on the five supplied features",
    }


def _past_window(location: int):
    """Recorded fault history for this node in the training telemetry."""
    if HISTORY is None:
        return {
            "phase": "past", "title": "Past", "subtitle": "Recorded history",
            "has_data": False, "fault": False, "risk": 0.0,
            "detail": "Historical telemetry could not be loaded on the server.",
            "source": "unavailable",
        }

    rows = HISTORY[HISTORY["location"] == location]
    observations = int(len(rows))

    if observations == 0:
        return {
            "phase": "past", "title": "Past", "subtitle": "Recorded history",
            "has_data": False, "fault": False, "risk": 0.0, "observations": 0,
            "detail": (
                f"No historical records exist for node {location}. That is not "
                f"a clean bill of health - the node is simply unseen in the "
                f"training telemetry."
            ),
            "source": "master_train.csv",
        }

    incidents = int((rows["fault_severity"] > 0).sum())
    worst = int(rows["fault_severity"].max())
    rate = round(incidents / observations * 100, 2)

    detail = (
        f"{incidents} of {observations} recorded observations at node "
        f"{location} were faults ({rate}%). Worst recorded severity: "
        f"{SEVERITY_LABELS.get(worst, 'Unknown')} (class {worst})."
    )
    if observations < 5:
        detail += " Small sample, read this figure loosely."

    return {
        "phase": "past",
        "title": "Past",
        "subtitle": "Recorded history",
        "has_data": True,
        "fault": rate >= FAULT_THRESHOLD,
        "risk": rate,
        "severity": worst,
        "severity_label": SEVERITY_LABELS.get(worst, "Unknown"),
        "observations": observations,
        "incidents": incidents,
        "low_sample": observations < 5,
        "detail": detail,
        "source": "master_train.csv incident history",
    }


def _future_window(data: NetworkData, present: dict, past: dict):
    """
    Forward risk projection. This is a transparent weighted heuristic, NOT a
    trained forecaster - the dataset has no time axis to train one on. It
    blends the live prediction, the node's incident history, and how hard the
    node is being loaded relative to the fleet's 90th percentile.
    """
    events_load = data.num_events / EVENTS_P90 if EVENTS_P90 else 0.0
    log_load = data.total_log_volume / LOGVOL_P90 if LOGVOL_P90 else 0.0
    load_pressure = _clamp((events_load + log_load) / 2 * 100)

    present_risk = present["risk"]

    if past["has_data"]:
        projected = (
            0.50 * present_risk + 0.30 * past["risk"] + 0.20 * load_pressure
        )
        basis = (
            f"50% live prediction ({present_risk}%), 30% incident history "
            f"({past['risk']}%), 20% current load pressure "
            f"({round(load_pressure, 2)}%)."
        )
    else:
        # no history for this node - renormalise over the two usable signals
        projected = (0.50 * present_risk + 0.20 * load_pressure) / 0.70
        basis = (
            f"71% live prediction ({present_risk}%), 29% current load pressure "
            f"({round(load_pressure, 2)}%). No incident history for this node, "
            f"so that signal was dropped and the rest reweighted."
        )

    projected = round(_clamp(projected), 2)

    return {
        "phase": "future",
        "title": "Future",
        "subtitle": "Projected risk",
        "has_data": True,
        "fault": projected >= FAULT_THRESHOLD,
        "risk": projected,
        "load_pressure": round(load_pressure, 2),
        "detail": (
            f"Projected fault risk for node {data.location} is {projected}%. "
            f"Weighting: {basis}"
        ),
        "source": "weighted heuristic projection, not a trained forecaster",
    }


@app.get("/")
def health_check():
    return {"status": "active", "version":"v2", "service": "NetGuard API running"}

@app.post("/predict")
def predict_severity(data: NetworkData):
    if model is None:
        return {"error":"model not loaded"}
        
    df = pd.DataFrame([data.dict()])
    
    prediction= model.predict(df)
    prob = model.predict_proba(df).tolist()
    
    return {
        "fault_severity": int(prediction[0]),
        "confidence": round(max(prob[0]) * 100, 2)
    }


@app.post("/predict/timeline")
def predict_timeline(data: NetworkData):
    """
    Past / Present / Future fault view for a single node, shaped for the
    three-bar chart on the prediction page.
    """
    if model is None:
        return {"error": "model not loaded"}

    present = _present_window(data)
    past = _past_window(data.location)
    future = _future_window(data, present, past)

    windows = [past, present, future]
    faults = [w for w in windows if w["fault"]]

    if not faults:
        verdict = f"Node {data.location} reads clear across all three windows."
    else:
        phases = ", ".join(w["phase"] for w in faults)
        verdict = (
            f"Fault indicated in the {phases} "
            f"window{'s' if len(faults) > 1 else ''} for node {data.location}."
        )

    return {
        "target_node": data.location,
        "threshold": FAULT_THRESHOLD,
        "verdict": verdict,
        "fault_count": len(faults),
        "windows": windows,
        "inputs": data.dict(),
    }


@app.post("/copilot/remediation")
def copilot_remediation(req: RemediationRequest):
    """
    Hands a flagged node to Gemini and asks for a root cause read, the commands
    that mend it now, and the changes that stop it recurring.
    """
    prompt = f"""
You are NetGuard AI, the incident copilot for a telecom network operations
centre. You are speaking to an L1 network engineer who has to fix this now.

A fault has been flagged on node {req.location}.

MACHINE LEARNING VERDICT
- Classified severity: {req.severity_label} (class {req.severity})
- Present fault risk (XGBoost): {req.present_risk}%
- Historical fault risk for this node: {req.past_risk}%
- Projected future risk: {req.future_risk}%
- History detail: {req.past_summary or "no recorded history for this node"}

RAW TELEMETRY FOR THIS NODE
- Alarm severity type: {req.severity_type}
- Event burst count: {req.num_events}
- Resource types involved: {req.num_resources}
- Log volume emitted: {req.total_log_volume} MB

Write the incident response. Be concrete and specific to these numbers, never
generic. Reference the actual figures above in your reasoning. Bash commands
must be realistic Linux/network operations commands an L1 engineer would run on
a telecom node, and must include node {req.location} where a target is needed.

Respond in pure JSON, exactly this shape and nothing else:
{{
  "root_cause": "3 to 4 sentences naming the most likely root cause and the evidence in the telemetry that points to it",
  "impact": "one sentence on what breaks for subscribers or services if this is left alone",
  "immediate_actions": [
    {{"step": "short imperative title", "detail": "one sentence on what this does and what to look for", "command": "a single runnable bash command"}}
  ],
  "prevention": [
    "a specific change that stops this recurring, one sentence each"
  ],
  "verification": "one sentence on how the engineer confirms the node is healthy again"
}}

Give 3 or 4 immediate_actions, ordered so the safest diagnostic runs first and
anything disruptive runs last. Give 3 prevention items.
"""

    try:
        data, used_model = _generate_with_gemini_fallback(prompt)
        # normalise, so the UI never has to defend against a missing key
        return {
            "root_cause": data.get("root_cause", ""),
            "impact": data.get("impact", ""),
            "immediate_actions": data.get("immediate_actions", []) or [],
            "prevention": data.get("prevention", []) or [],
            "verification": data.get("verification", ""),
            "model": used_model,
        }

    except Exception as e:
        print("remediation error:", type(e).__name__, e)
        return {"error": "generation_failed", "trace": str(e)}


@app.post("/copilot")
def copilot_action(request: CopilotRequest):
    
    prompt = f"""
    You are NetGuard AI, an enterprise telecom network assistant.
    A network fault has been detected.
    - Fault Severity: {request.fault_severity} (0=Normal, 1=Warning, 2=Critical)
    - Location: Node {request.location}
    - CURRENT USER ROLE: {request.role}

    STRICT INSTRUCTIONS BASED ON ROLE:
    If CURRENT USER ROLE is 'L1 Engineer': Focus ONLY on technical hardware/software troubleshooting (e.g., Reboot optical switch, check fiber links, run port diagnostics). 
    If CURRENT USER ROLE is 'NOC Manager': Focus ONLY on Business Impact, Financial Loss, SLA violation risks, and high-level management approvals. DO NOT mention hardware technicalities.

    IMPORTANT: You MUST respond in pure JSON format exactly like this:
    {{
        "analysis": "Brief 2-line explanation tailored strictly to the user role",
        "actions": [
            {{"label": "Action 1 Name", "command": "cmd_1"}},
            {{"label": "Action 2 Name", "command": "cmd_2"}}
        ]
    }}
    """
    
    try:
        data, _ = _generate_with_gemini_fallback(prompt)
        return data
    
    except Exception as e:
        print("err:", e)
        return {"error": "generation_failed", "trace": str(e)}