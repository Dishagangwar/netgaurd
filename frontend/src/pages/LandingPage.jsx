import { useRef } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  ChevronDown,
  Clock,
  Database,
  Gauge,
  History,
  LineChart,
  Radar,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react'
import ParticleField from '../components/ParticleField'
import TiltCard from '../components/TiltCard'
import useLandingAnimations from '../hooks/useLandingAnimations'

const CAPABILITIES = [
  {
    Icon: BrainCircuit,
    title: 'XGBoost fault classifier',
    body: 'A gradient boosted model trained on 7,381 real telecom telemetry records across 929 network nodes. It sorts a node into Normal, Warning or Critical and reports how sure it is.',
  },
  {
    Icon: History,
    title: 'Incident history lookup',
    body: 'Every prediction is cross checked against the node’s recorded fault history, so you see whether this box has a track record of failing or is misbehaving for the first time.',
  },
  {
    Icon: Radar,
    title: 'Forward risk projection',
    body: 'A transparent weighted blend of the live prediction, past incident rate and current load pressure, giving an early warning before a node tips over.',
  },
  {
    Icon: Terminal,
    title: 'Generative incident response',
    body: 'The moment a fault is flagged, Gemini takes the incident and writes the root cause, the bash commands that mend the node now, and the changes that stop it recurring.',
  },
]

const STEPS = [
  {
    Icon: Gauge,
    step: '01',
    title: 'Feed it telemetry',
    body: 'Enter the five signals the model was trained on: node ID, severity type, event burst count, resource count and log volume.',
  },
  {
    Icon: Activity,
    step: '02',
    title: 'The engine runs',
    body: 'XGBoost scores the live state, the history table is queried for that node, and the projection weights both against current load.',
  },
  {
    Icon: BarChart3,
    step: '03',
    title: 'Read one chart',
    body: 'Past, Present and Future land as three bars. Red means a fault sits in that window, green means it is clear. No manual reading required.',
  },
  {
    Icon: Sparkles,
    step: '04',
    title: 'Get the fix',
    body: 'If any bar is red, the Gemini incident commander opens and streams the root cause, the commands that mend the node, and how to prevent it recurring.',
  },
]

const SIGNALS = [
  { name: 'Target Node ID', range: '1 – 1126', body: 'Which node in the mesh you are asking about.' },
  { name: 'Severity Type', range: '0 – 2', body: 'The severity class the upstream alarm system attached to the event.' },
  { name: 'Event Burst Count', range: '1 – 9', body: 'How many distinct events fired at that node in the window.' },
  { name: 'Resource Count', range: '1 – 5', body: 'How many resource types were involved in the incident.' },
  { name: 'Log Volume', range: '1 – 1650 MB', body: 'Total log data the node emitted. Heavy bursts drive the projection up.' },
]

/**
 * Title split per character, so each letter can hinge in on its own axis.
 * Takes segments rather than one string, so "AI" keeps its accent colour
 * without tinting the A inside NETGUARD.
 */
const Title3D = ({ segments }) => (
  <span className="inline-block" style={{ perspective: 900 }}>
    {segments.map((segment, s) => (
      <span key={s} className={segment.className}>
        {segment.text.split('').map((char, i) => (
          <span
            key={`${s}-${i}`}
            data-anim="title-char"
            className="inline-block"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </span>
    ))}
  </span>
)

const LandingPage = ({ onNavigate }) => {
  const rootRef = useRef(null)
  useLandingAnimations(rootRef)

  const scrollToPredict = () => {
    document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={rootRef} className="min-h-screen bg-dark text-white font-sans">
      {/* nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800/80 bg-dark/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-mono text-lg font-bold tracking-tight">
              NETGUARD <span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#overview" className="hidden text-zinc-400 transition hover:text-primary sm:block">
              Overview
            </a>
            <a href="#how" className="hidden text-zinc-400 transition hover:text-primary sm:block">
              How it works
            </a>
            <button
              onClick={() => onNavigate('predict')}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-dark transition hover:bg-amber-100"
            >
              Predict Fault
            </button>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section
        data-anim="hero"
        className="relative flex min-h-screen items-center overflow-hidden pt-20"
      >
        <ParticleField />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, rgba(253, 230, 138, 0.14) 0%, rgba(9,9,11,0) 62%)',
          }}
        />

        <div
          data-anim="hero-content"
          className="relative mx-auto max-w-4xl px-6 text-center"
        >
          <span
            data-anim="badge"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            XGBoost &middot; 7,381 telemetry records &middot; Gemini copilot
          </span>

          <h1 className="mt-8 text-5xl font-black tracking-tight sm:text-7xl">
            <Title3D
              segments={[
                { text: 'NETGUARD ', className: '' },
                { text: 'AI', className: 'text-primary' },
              ]}
            />
          </h1>

          <p
            data-anim="hero-line"
            className="mx-auto mt-6 max-w-2xl font-mono text-base text-zinc-300 sm:text-xl"
          >
            Autonomous Telemetry Analytics &amp; Generative Incident Response
          </p>

          <p
            data-anim="hero-line"
            className="mx-auto mt-6 max-w-2xl leading-relaxed text-zinc-400"
          >
            NetGuard AI watches a telecom network the way an experienced engineer
            would: it reads the live signals coming off a node, remembers how that
            node has failed before, and tells you whether trouble is behind you,
            on you right now, or coming. One node, one chart, three answers.
          </p>

          <div
            data-anim="hero-line"
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => onNavigate('predict')}
              data-anim="cta-glow"
              className="group flex items-center gap-2 rounded-md bg-primary px-8 py-4 font-mono font-bold text-dark shadow-[0_0_30px_rgba(253, 230, 138, 0.45)] transition-colors hover:bg-amber-100"
            >
              [ PREDICT FAULT ]
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={scrollToPredict}
              className="rounded-md border border-zinc-700 px-8 py-4 font-mono text-zinc-300 transition hover:border-primary hover:text-primary"
            >
              What is this?
            </button>
          </div>
        </div>

        <button
          onClick={scrollToPredict}
          aria-label="Scroll to overview"
          data-anim="chevron"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-hint text-zinc-500 hover:text-primary"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </section>

      {/* overview */}
      <section id="overview" className="border-t border-zinc-800 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p
            data-anim="heading"
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary"
          >
            What it is
          </p>
          <h2 data-anim="heading" className="mt-3 max-w-3xl text-3xl font-bold sm:text-4xl">
            A fault prediction console for network operations teams
          </h2>
          <p data-anim="heading" className="mt-5 max-w-3xl leading-relaxed text-zinc-400">
            Network operations centres drown in telemetry. Thousands of events an
            hour, most of them noise, a handful of them the first sign of an
            outage. NetGuard AI puts a trained model in front of that firehose and
            answers the only question that matters on a shift:{' '}
            <span className="text-zinc-200">is this node in trouble?</span>
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {CAPABILITIES.map(({ Icon, title, body }) => (
              <TiltCard key={title} data-anim="cap-card" className="rounded-xl">
                <div className="h-full rounded-xl border border-zinc-800 bg-panel/60 p-7 transition-colors hover:border-primary/50 hover:bg-panel">
                  <div
                    className="mb-4 inline-flex rounded-lg border border-primary/20 bg-primary/10 p-3"
                    style={{ transform: 'translateZ(38px)' }}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3
                    className="mb-2 text-lg font-bold text-zinc-100"
                    style={{ transform: 'translateZ(24px)' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{body}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="border-t border-zinc-800 bg-panel/25 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p
            data-anim="heading"
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary"
          >
            How it works
          </p>
          <h2 data-anim="heading" className="mt-3 text-3xl font-bold sm:text-4xl">
            Five inputs in, three verdicts and a fix out
          </h2>

          <div
            data-anim="steps-grid"
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {STEPS.map(({ Icon, step, title, body }) => (
              <TiltCard key={step} data-anim="step-card" max={7} className="rounded-xl">
                <div className="relative h-full overflow-hidden rounded-xl border border-zinc-800 bg-dark p-7">
                  <span
                    data-anim="step-numeral"
                    className="absolute right-6 top-5 font-mono text-4xl font-black text-zinc-800"
                  >
                    {step}
                  </span>
                  <Icon
                    className="mb-4 h-7 w-7 text-primary"
                    style={{ transform: 'translateZ(30px)' }}
                  />
                  <h3
                    className="mb-2 text-lg font-bold text-zinc-100"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{body}</p>
                </div>
              </TiltCard>
            ))}
          </div>

          {/* how to read the chart */}
          <div
            data-anim="chart-panel"
            className="mt-14 rounded-xl border border-zinc-800 bg-dark p-8"
          >
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-zinc-100">
              <LineChart className="h-5 w-5 text-primary" />
              Reading the result chart
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              The result is a single chart with three bars. Bar height is fault
              risk from 0 to 100%, and any bar at or above the 50% threshold is
              treated as a fault.
            </p>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {[
                {
                  Icon: History,
                  label: 'Past',
                  body: 'Share of this node’s recorded observations that were actual faults.',
                },
                {
                  Icon: Activity,
                  label: 'Present',
                  body: 'The model’s live probability that the node is in a fault state right now.',
                },
                {
                  Icon: Clock,
                  label: 'Future',
                  body: 'Projected risk, blending the live score, incident history and load pressure.',
                },
              ].map(({ Icon, label, body }) => (
                <div
                  key={label}
                  data-anim="window-card"
                  className="rounded-lg border border-zinc-800 bg-panel/50 p-5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-zinc-400" />
                    <span className="font-bold text-zinc-200">{label}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-6 border-t border-zinc-800 pt-6 text-sm">
              <span data-anim="legend-item" className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded bg-danger shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                <span className="text-zinc-300">
                  <b className="text-danger">Red</b> &mdash; fault in this window
                </span>
              </span>
              <span data-anim="legend-item" className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                <span className="text-zinc-300">
                  <b className="text-emerald-500">Green</b> &mdash; window is clear
                </span>
              </span>
              <span data-anim="legend-item" className="flex items-center gap-2.5">
                <span className="h-4 w-4 rounded bg-zinc-600" />
                <span className="text-zinc-300">
                  <b className="text-zinc-300">Grey</b> &mdash; no data for this node
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* the five signals */}
      <section className="border-t border-zinc-800 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p
            data-anim="heading"
            className="font-mono text-xs uppercase tracking-[0.3em] text-primary"
          >
            The inputs
          </p>
          <h2
            data-anim="heading"
            className="mt-3 flex items-center gap-3 text-3xl font-bold sm:text-4xl"
          >
            <Database className="h-8 w-8 text-primary" />
            The five signals the model reads
          </h2>
          <p data-anim="heading" className="mt-5 max-w-3xl leading-relaxed text-zinc-400">
            These are the exact features the classifier was trained on. The ranges
            below come from the training telemetry, so staying inside them keeps
            the prediction inside the data the model has actually seen.
          </p>

          <div
            data-anim="signals-table"
            className="mt-12 overflow-hidden rounded-xl border border-zinc-800"
          >
            {SIGNALS.map((s, i) => (
              <div
                key={s.name}
                data-anim="signal-row"
                className={`flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:gap-6 ${
                  i % 2 ? 'bg-panel/40' : 'bg-panel/15'
                }`}
              >
                <span className="w-48 shrink-0 font-bold text-zinc-200">{s.name}</span>
                <span className="w-36 shrink-0 rounded border border-primary/25 bg-primary/10 px-2.5 py-1 text-center font-mono text-xs text-primary">
                  {s.range}
                </span>
                <span className="text-sm text-zinc-400">{s.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* closing CTA */}
      <section id="start" className="relative overflow-hidden border-t border-zinc-800 py-28">
        <ParticleField density={0.00006} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(253, 230, 138, 0.13) 0%, rgba(9,9,11,0) 65%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 data-anim="cta" className="text-3xl font-bold sm:text-5xl">
            Ready to check a node?
          </h2>
          <p data-anim="cta" className="mx-auto mt-5 max-w-xl leading-relaxed text-zinc-400">
            Enter the five telemetry values for any node and NetGuard AI returns
            its past, present and future fault picture as a single chart.
          </p>
          <button
            onClick={() => onNavigate('predict')}
            data-anim="cta-glow"
            className="group mt-10 inline-flex items-center gap-3 rounded-md bg-primary px-10 py-5 font-mono text-lg font-bold text-dark shadow-[0_0_35px_rgba(253, 230, 138, 0.5)] transition-colors hover:bg-amber-100"
          >
            [ PREDICT FAULT ]
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1.5" />
          </button>
          <p data-anim="cta" className="mt-6 text-xs text-zinc-500">
            If a fault is flagged, the Gemini incident commander opens
            underneath with the fix.
          </p>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-zinc-500 sm:flex-row">
          <span className="flex items-center gap-2 font-mono">
            <ShieldCheck className="h-4 w-4 text-zinc-600" />
            NETGUARD AI
          </span>
          <span>Fault predictions are model output. Verify before acting on a live network.</span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
