<div align="center">

# 🛡️ NetGuard AI
### Enterprise Telecom Fault Prediction & Autonomous Incident Copilot

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-EB6420?style=for-the-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <b>Transforming reactive telecom troubleshooting into proactive, multi-horizon fault prevention and role-tailored incident resolution.</b>
</p>

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Machine Learning Pipeline](#-machine-learning--telemetry-pipeline) • [Role-Aware Copilot](#-role-aware-genai-copilot) • [Quick Start](#-quick-start-guide) • [API Documentation](#-api-reference)

---

</div>

## 📌 Overview

Telecom networks produce massive volumes of telemetry, alarm bursts, and log streams across thousands of mesh nodes. When an anomaly occurs, network operations teams are often overwhelmed by alarm storms, resulting in extended **Mean Time to Resolution (MTTR)**, severe **SLA violation penalties**, and customer service disruption.

**NetGuard AI** is an end-to-end intelligent network reliability system that couples **gradient-boosted machine learning** with a **3-Horizon Temporal Risk Synthesizer** and **Role-Aware Generative AI Remediation** powered by Google Gemini.

```
                  ┌───────────────────────────────────────────────────────────┐
                  │                 Real-time Network Telemetry               │
                  │   (Node ID, Severity Type, Event Bursts, Resources, Logs) │
                  └─────────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
                        ┌───────────────────────────────────────────┐
                        │          NetGuard AI Core Engine          │
                        ├─────────────────────┬─────────────────────┤
                        │   XGBoost Model     │  Historical Lookup  │
                        │ (Live ML Inference) │ (P90 Fleet Baseline)│
                        └──────────┬──────────┴──────────┬──────────┘
                                   │                     │
                                   ▼                     ▼
                        ┌───────────────────────────────────────────┐
                        │    3-Horizon Temporal Risk Synthesizer    │
                        │    [ PAST ]  ───  [ PRESENT ]  ───  [ FUTURE ]   │
                        └─────────────────────┬─────────────────────┘
                                              │ (If Fault Detected)
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │      Gemini Generative Copilot Agent      │
                        ├─────────────────────┬─────────────────────┤
                        │ L1 Network Engineer │ NOC Operations Lead │
                        │  - Bash Runbooks    │  - SLA Breach Risk  │
                        │  - Port Diagnostics │  - Financial Impact │
                        │  - Hardware Fixes   │  - Executive Direct.│
                        └───────────────────────────────────────────┘
```

---

## ✨ Key Features

- **⚡ Precision Fault Classification**: Trained on 7,381+ real-world telecom records across 929 nodes, predicting fault severity (*Normal*, *Warning*, *Critical*) with confidence scoring.
- **⚖️ Balanced Sample Weighting**: Mitigates real-world telecom class imbalance to maximize fault detection recall and eliminate blind spots.
- **🕒 3-Horizon Temporal Timeline**:
  - **Past (Historical Horizon)**: Real-time lookup of historical incident rates and worst recorded fault severities for target nodes.
  - **Present (Live Horizon)**: Real-time XGBoost multi-class probabilistic fault assessment.
  - **Future (Predictive Horizon)**: Weighted forward risk projection combining live telemetry, historical fragility, and current log/event load pressure relative to fleet P90 thresholds.
- **🤖 Role-Aware Generative Incident Copilot**:
  - **L1 Network Engineer Mode**: Technical root-cause deduction, automated copy-pasteable Linux/telecom diagnostic and remediation bash commands, prevention tasks, and verification steps.
  - **NOC Manager Mode**: High-level incident briefs, customer blast radius calculations, financial & SLA penalty risk estimations, and executive escalation directives.
- **🛡️ Resilience & High Availability**: Automatic Gemini multi-model fallback cascade (`gemini-2.5-flash` → `gemini-flash-latest` → `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-pro-latest`) preventing API rate limiting downtime.
- **🎨 Glassmorphic Cyberpunk Dashboard**: Built with React 19, Tailwind CSS, Lucide icons, dynamic SVG risk charts, 3D tilt interaction cards, and an interactive particle physics background.

---

## 🏗️ System Architecture

```
netgaurd/
├── backend/
│   ├── main.py                     # FastAPI REST API & Gemini Copilot orchestration
│   ├── train_model.py              # XGBoost training pipeline with balanced sample weights
│   ├── evaluate_model.py           # Model validation, metrics, & confusion matrix generation
│   ├── process_all_data.py         # ETL pipeline merging telemetry, logs & event types
│   ├── requirements.txt            # Backend dependencies
│   ├── xgboost_netguard_v2_*.pkl   # Serialized trained model artifacts
│   └── confusion_matrix_plot.png   # Model evaluation confusion matrix
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AiCopilotPanel.jsx      # Role-based GenAI remediation panel
│   │   │   ├── FaultTimelineChart.jsx  # Past / Present / Future interactive bar visualization
│   │   │   ├── ParticleField.jsx       # Interactive canvas background animation
│   │   │   └── TiltCard.jsx            # 3D interactive glassmorphism card
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Product overview & interactive feature walkthrough
│   │   │   └── PredictPage.jsx         # Live telemetry input console & AI copilot
│   │   ├── hooks/                      # Custom React hooks (animations, typewriters)
│   │   ├── App.jsx                     # Route switching & view management
│   │   ├── index.css                   # Tailwind directives & custom CSS variables
│   │   └── main.jsx                    # React entry point
│   ├── package.json                    # Frontend dependencies (React 19, Vite, Tailwind)
│   ├── tailwind.config.js              # Theme configuration & animations
│   └── vite.config.js                  # Vite bundler configuration
└── data/                               # Master telemetry and raw network event datasets
    ├── train.csv                       # Training node mappings
    ├── severity_type.csv               # Severity alarm metadata
    ├── event_type.csv                  # Event classification data
    ├── resource_type.csv               # Hardware resource classification data
    ├── log_feature.csv                 # Raw log volume distributions
    └── master_train.csv                # Processed & merged telemetry training dataset
```

---

## 📊 Machine Learning & Telemetry Pipeline

### 1. Telemetry Ingestion Features

The model consumes 5 core telemetry metrics captured at network node checkpoints:

| Signal | Feature Name | Range / Type | Description |
| :--- | :--- | :--- | :--- |
| 📍 **Node Identifier** | `location` | Integer (`1 – 1126`) | Specific network node in the telecom mesh |
| 🚨 **Alarm Severity** | `severity_type` | Categorical (`0 – 2`) | Alarm class reported by upstream monitoring systems |
| ⚡ **Event Burst** | `num_events` | Integer (`1 – 9`) | Number of distinct event types triggered in the window |
| 🎛️ **Resource Count** | `num_resources` | Integer (`1 – 5`) | Volume of distinct physical/virtual resources involved |
| 📦 **Log Volume** | `total_log_volume` | Integer (`1 – 1650 MB`) | Cumulative volume of system log output generated |

### 2. Multi-Horizon Calculation Mechanics

$$\text{Load Pressure} = \text{clamp}\left( \frac{\frac{\text{num\_events}}{\text{Events}_{P90}} + \frac{\text{total\_log\_volume}}{\text{LogVol}_{P90}}}{2} \times 100 \right)$$

$$\text{Future Risk} = 0.50 \times \text{Risk}_{\text{Present}} + 0.30 \times \text{Risk}_{\text{Past}} + 0.20 \times \text{Load Pressure}$$

> **Fault Decision Boundary**: Any window where computed risk $\ge 50\%$ triggers an active **FAULT** status and summons the AI Copilot.

---

## 🤖 Role-Aware GenAI Copilot

NetGuard AI bridges the communication gap between on-call engineers and business leadership during network incidents:

```
                                  🚨 FAULT FLAGGED (Risk >= 50%)
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
             [ L1 Network Engineer ]                           [ NOC Operations Manager ]
  ┌───────────────────────────────────────────┐     ┌───────────────────────────────────────────┐
  │ • Root-Cause: Technical log analysis      │     │ • Executive Brief: High-level impact      │
  │ • Impact: Service degradation & drops     │     │ • Financial Risk: SLA breach exposure     │
  │ • Immediate Actions: Copyable bash cmds   │     │ • Operational Directives: Team escalation │
  │ • Prevention: Kernel/Hardware config      │     │ • Policy Mitigation: Vendor SLA reviews   │
  │ • Verification: Port ping & buffer checks │     │ • Executive Sign-Off: Clearance criteria  │
  └───────────────────────────────────────────┘     └───────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** & **npm**
- **Google Gemini API Key** ([Get a free key here](https://aistudio.google.com/app/apikey))

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/netguard-ai.git
cd netguard-ai
```

---

### Step 2: Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate

   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your environment variables:
   Create a `.env` file in `backend/`:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

5. *(Optional)* Rebuild dataset & retrain model:
   ```bash
   # Merge raw data files into master_train.csv
   python process_all_data.py

   # Train the XGBoost model with balanced weights
   python train_model.py

   # Run evaluation & generate confusion matrix
   python evaluate_model.py
   ```

6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will be live at `http://localhost:8000` (Interactive API docs at `http://localhost:8000/docs`).*

---

### Step 3: Frontend Setup

1. Open a new terminal tab and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to `http://localhost:5173`.*

---

## 🔌 API Reference

### 1. Health Check
```http
GET /
```
**Response:**
```json
{
  "status": "active",
  "version": "v2",
  "service": "NetGuard API running"
}
```

---

### 2. Predict Fault Severity (Raw Inference)
```http
POST /predict
Content-Type: application/json
```
**Request Body:**
```json
{
  "location": 704,
  "severity_type": 1,
  "num_events": 3,
  "num_resources": 2,
  "total_log_volume": 120
}
```
**Response:**
```json
{
  "fault_severity": 1,
  "confidence": 88.45
}
```

---

### 3. Multi-Horizon Risk Timeline
```http
POST /predict/timeline
Content-Type: application/json
```
**Request Body:**
```json
{
  "location": 704,
  "severity_type": 1,
  "num_events": 2,
  "num_resources": 1,
  "total_log_volume": 51
}
```
**Response:**
```json
{
  "target_node": 704,
  "threshold": 50.0,
  "verdict": "Fault indicated in the present and future windows for node 704.",
  "fault_count": 2,
  "windows": [
    {
      "phase": "past",
      "title": "Past",
      "risk": 42.15,
      "fault": false,
      "observations": 12,
      "incidents": 5
    },
    {
      "phase": "present",
      "title": "Present",
      "risk": 84.50,
      "severity": 1,
      "severity_label": "Warning",
      "confidence": 84.50,
      "fault": true
    },
    {
      "phase": "future",
      "title": "Future",
      "risk": 68.32,
      "load_pressure": 65.4,
      "fault": true
    }
  ]
}
```

---

### 4. Role-Aware Copilot Remediation
```http
POST /copilot/remediation
Content-Type: application/json
```
**Request Body:**
```json
{
  "location": 704,
  "role": "L1 Engineer",
  "severity": 1,
  "severity_label": "Warning",
  "past_risk": 42.15,
  "present_risk": 84.50,
  "future_risk": 68.32,
  "past_summary": "5 of 12 recorded observations were faults (42.15%)",
  "severity_type": 1,
  "num_events": 2,
  "num_resources": 1,
  "total_log_volume": 51
}
```
**Response (L1 Engineer Mode):**
```json
{
  "role": "L1 Engineer",
  "root_cause": "Elevated log volume (51 MB) paired with Severity 1 alarm indicates a buffer saturation on line card interface at node 704.",
  "impact": "Packet drops on optical switch ports and subscriber latency spikes.",
  "immediate_actions": [
    {
      "step": "Check Interface Drops",
      "detail": "Inspect port interface error counters and CRC errors on node 704.",
      "command": "ssh admin@node-704 'show interfaces counters errors'"
    },
    {
      "step": "Flush Buffer Queue",
      "detail": "Clear congested packet queues to restore normal throughput.",
      "command": "ssh admin@node-704 'clear packet-buffer queue all'"
    }
  ],
  "prevention": [
    "Increase packet buffer threshold allocation on line card firmware.",
    "Implement rate-limiting filters on upstream telemetry log collectors."
  ],
  "verification": "Confirm packet drop rate returns to 0% using 'show interface summary'.",
  "model": "gemini-2.5-flash"
}
```

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, JavaScript (ESNext) |
| **Styling & UI** | Tailwind CSS, Lucide React Icons, Glassmorphism, Responsive CSS Grid |
| **Animation & Interactivity** | GSAP (GreenSock), Custom Canvas 2D Particle Engine, CSS 3D Transforms |
| **Backend API** | FastAPI, Uvicorn, Pydantic, Python-dotenv |
| **Machine Learning** | XGBoost (`XGBClassifier`), Scikit-Learn, Pandas, NumPy, Joblib |
| **Large Language Models** | Google Gemini Generative AI SDK (`google-generativeai`) |
| **Evaluation & Visualization** | Matplotlib, Seaborn, Confusion Matrix Heatmaps |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

---

## 📄 License

This project is open-source and distributed under the **MIT License**. See `LICENSE` for more details.

---

<div align="center">
  <sub>Built with ❤️ for resilient, next-generation telecom networks.</sub>
</div>
