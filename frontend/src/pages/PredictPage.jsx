import { useState } from 'react'
import axios from 'axios'
import {
  ArrowLeft,
  Cpu,
  Layers,
  Loader2,
  Network,
  RotateCcw,
  ScrollText,
  ServerCog,
  ShieldCheck,
  Siren,
  Zap,
} from 'lucide-react'
import FaultTimelineChart from '../components/FaultTimelineChart'
import AiCopilotPanel from '../components/AiCopilotPanel'

const API = 'http://127.0.0.1:8000'

// ranges taken from the training telemetry, so the form cannot push the model
// far outside the distribution it was actually fitted on
const DEFAULTS = {
  location: 704,
  severity_type: 1,
  num_events: 2,
  num_resources: 1,
  total_log_volume: 51,
}

const SEVERITY_OPTIONS = [
  { value: 0, label: 'Type 0', hint: 'Baseline alarm class' },
  { value: 1, label: 'Type 1', hint: 'Elevated alarm class' },
  { value: 2, label: 'Type 2', hint: 'Highest alarm class' },
]

const Slider = ({ Icon, label, hint, min, max, value, onChange, unit }) => (
  <div>
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label className="flex items-center gap-2 text-sm font-bold text-zinc-300">
        <Icon className="h-4 w-4 text-zinc-500" />
        {label}
      </label>
      <span className="font-mono text-lg font-bold text-primary">
        {value}
        {unit ? <span className="ml-1 text-xs text-zinc-500">{unit}</span> : null}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-primary"
    />
    <div className="mt-1.5 flex justify-between text-[10px] text-zinc-600">
      <span>{min}</span>
      <span className="text-zinc-500">{hint}</span>
      <span>{max}</span>
    </div>
  </div>
)

const PredictPage = ({ onNavigate }) => {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // GenAI copilot, only ever engaged when the model actually flags a fault
  const [copilot, setCopilot] = useState(null)
  const [copilotLoading, setCopilotLoading] = useState(false)
  const [copilotError, setCopilotError] = useState(null)

  // bumped per prediction, used as a React key so the chart and the copilot
  // remount and replay their intro animations on every run
  const [runId, setRunId] = useState(0)

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  /**
   * Hand the flagged node to Gemini for a root cause read, the commands that
   * mend it now, and the changes that stop it recurring.
   */
  const askCopilot = async (timeline) => {
    const byPhase = Object.fromEntries(timeline.windows.map((w) => [w.phase, w]))

    setCopilotLoading(true)
    setCopilotError(null)
    setCopilot(null)

    try {
      const res = await axios.post(`${API}/copilot/remediation`, {
        location: timeline.target_node,
        severity: byPhase.present?.severity ?? 0,
        severity_label: byPhase.present?.severity_label ?? 'Unknown',
        past_risk: byPhase.past?.risk ?? 0,
        present_risk: byPhase.present?.risk ?? 0,
        future_risk: byPhase.future?.risk ?? 0,
        past_summary: byPhase.past?.detail ?? '',
        severity_type: Number(timeline.inputs.severity_type),
        num_events: Number(timeline.inputs.num_events),
        num_resources: Number(timeline.inputs.num_resources),
        total_log_volume: Number(timeline.inputs.total_log_volume),
      })

      if (res.data?.error) {
        setCopilotError(res.data.trace || res.data.error)
      } else {
        setCopilot(res.data)
      }
    } catch (e) {
      console.error('copilot failed:', e)
      setCopilotError('Could not reach the copilot endpoint on the NetGuard API.')
    }

    setCopilotLoading(false)
  }

  const runPrediction = async () => {
    setLoading(true)
    setError(null)
    setCopilot(null)
    setCopilotError(null)

    const node = Number(form.location)
    if (!Number.isInteger(node) || node < 1) {
      setError('Target Node ID must be a whole number of 1 or more.')
      setLoading(false)
      return
    }

    try {
      const payload = {
        location: node,
        severity_type: Number(form.severity_type),
        num_events: Number(form.num_events),
        num_resources: Number(form.num_resources),
        total_log_volume: Number(form.total_log_volume),
      }
      const res = await axios.post(`${API}/predict/timeline`, payload)

      if (res.data?.error) {
        setError(`Backend returned an error: ${res.data.error}`)
      } else {
        setResult(res.data)
        setRunId((n) => n + 1)
        setTimeout(
          () => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }),
          80,
        )
        // progressive disclosure: the copilot only wakes up on a real fault
        if (res.data.fault_count > 0) askCopilot(res.data)
      }
    } catch (e) {
      console.error('prediction failed:', e)
      setError(
        'Could not reach the NetGuard API at 127.0.0.1:8000. Start the backend with: uvicorn main:app --reload',
      )
    }

    setLoading(false)
  }

  const reset = () => {
    setForm(DEFAULTS)
    setResult(null)
    setError(null)
    setCopilot(null)
    setCopilotError(null)
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-dark/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2 font-mono font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            NETGUARD <span className="text-primary">AI</span>
          </div>
          <span className="hidden text-xs text-zinc-600 sm:block">
            XGBoost + Gemini
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Fault prediction
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Analyse a network node</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">
            Set the five telemetry signals below and run the engine. You get one
            chart back covering the node&rsquo;s past, present and future fault
            state &mdash; red where a fault sits, green where it is clear.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* input panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-zinc-700 bg-panel p-6 shadow-xl">
              <h2 className="mb-6 flex items-center gap-2 border-b border-zinc-700 pb-3 font-bold text-zinc-200">
                <ServerCog className="h-5 w-5 text-primary" />
                Telemetry input
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="node-id"
                    className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-300"
                  >
                    <Network className="h-4 w-4 text-zinc-500" />
                    Target Node ID
                  </label>
                  <input
                    id="node-id"
                    type="number"
                    min={1}
                    value={form.location}
                    onChange={(e) => set('location')(e.target.value)}
                    className="w-full rounded-md border border-zinc-600 bg-dark p-3 font-mono text-lg font-bold text-primary outline-none transition focus:border-primary"
                  />
                  <p className="mt-1.5 text-[10px] text-zinc-600">
                    Nodes 1&ndash;1126 appear in the training telemetry.
                  </p>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-300">
                    <Siren className="h-4 w-4 text-zinc-500" />
                    Severity Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SEVERITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => set('severity_type')(opt.value)}
                        title={opt.hint}
                        className={`rounded-md border py-2.5 font-mono text-sm font-bold transition ${
                          Number(form.severity_type) === opt.value
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-zinc-600 bg-dark text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Slider
                  Icon={Zap}
                  label="Event Burst Count"
                  hint="events fired"
                  min={1}
                  max={9}
                  value={form.num_events}
                  onChange={set('num_events')}
                />

                <Slider
                  Icon={Layers}
                  label="Resource Count"
                  hint="resource types"
                  min={1}
                  max={5}
                  value={form.num_resources}
                  onChange={set('num_resources')}
                />

                <Slider
                  Icon={ScrollText}
                  label="Log Volume"
                  hint="log payload"
                  min={1}
                  max={1650}
                  value={form.total_log_volume}
                  onChange={set('total_log_volume')}
                  unit="MB"
                />
              </div>

              <button
                onClick={runPrediction}
                disabled={loading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-4 font-mono font-bold text-dark shadow-[0_0_20px_rgba(253, 230, 138,0.35)] transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ANALYSING...
                  </>
                ) : (
                  <>
                    <Cpu className="h-4 w-4" />
                    RUN FAULT PREDICTION
                  </>
                )}
              </button>

              <button
                onClick={reset}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 py-2.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset inputs
              </button>
            </div>
          </div>

          {/* result panel */}
          <div id="result" className="lg:col-span-3">
            {error && (
              <div className="mb-6 rounded-lg border border-danger/50 bg-danger/10 p-4 text-sm text-danger">
                {error}
              </div>
            )}

            {loading && !result && (
              <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-zinc-700 bg-panel">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="animate-pulse font-mono text-sm text-primary">
                  Scoring node, querying history, projecting risk...
                </p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-700 bg-panel/40 px-8 text-center">
                <Cpu className="h-12 w-12 text-zinc-700" />
                <p className="font-mono text-zinc-500">Engine on standby</p>
                <p className="max-w-sm text-sm text-zinc-600">
                  Set your telemetry values and run the prediction. The past,
                  present and future chart appears here.
                </p>
              </div>
            )}

            {result && !loading && (
              <FaultTimelineChart key={`chart-${runId}`} result={result} />
            )}

            {result && !loading && (
              <AiCopilotPanel
                key={`copilot-${runId}`}
                data={copilot}
                loading={copilotLoading}
                error={copilotError}
                node={result.target_node}
              />
            )}

            {result && !loading && result.fault_count === 0 && (
              <p className="mt-8 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-zinc-400">
                All three windows are clear, so the GenAI incident commander was
                not engaged. It appears automatically the moment a window is
                flagged red.
              </p>
            )}

            {result && !loading && (
              <p className="mt-6 rounded-lg border border-zinc-800 bg-panel/40 p-4 text-xs leading-relaxed text-zinc-500">
                <b className="text-zinc-400">On the future bar:</b> the dataset
                has no time axis, so this is a transparent weighted projection
                rather than a trained forecaster. Its exact weighting is printed
                on the Future card above. Treat it as an early warning signal, not
                a scheduled failure.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PredictPage
