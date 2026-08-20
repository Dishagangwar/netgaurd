import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react'

const GRID = [100, 75, 50, 25, 0]

/**
 * Colour rule, kept in one place so the bars, the labels and the legend can
 * never disagree with each other:
 *   red   -> this window carries a fault (risk >= threshold)
 *   green -> this window is clear
 *   slate -> no data for this window, which is NOT the same as "clear"
 */
const styleFor = (window) => {
  if (!window.has_data) {
    return {
      bar: 'bg-zinc-600',
      glow: '',
      text: 'text-zinc-400',
      border: 'border-zinc-600',
      chip: 'bg-zinc-700/40 text-zinc-300 border-zinc-600',
      label: 'NO DATA',
      Icon: HelpCircle,
    }
  }
  if (window.fault) {
    return {
      bar: 'bg-danger',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.55)]',
      text: 'text-danger',
      border: 'border-danger',
      chip: 'bg-danger/15 text-danger border-danger/40',
      label: 'FAULT',
      Icon: AlertTriangle,
    }
  }
  return {
    bar: 'bg-emerald-500',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.45)]',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    chip: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40',
    label: 'CLEAR',
    Icon: CheckCircle2,
  }
}

const FaultTimelineChart = ({ result }) => {
  const [grown, setGrown] = useState(false)

  // let the bars start flat, then grow, so the reading lands as a motion cue.
  // the parent remounts this component per run, so there is nothing to reset.
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 60)
    return () => clearTimeout(t)
  }, [])

  const { windows, threshold, verdict, fault_count: faultCount, target_node: node } = result
  const anyFault = faultCount > 0

  return (
    <div className="space-y-6">
      {/* headline verdict */}
      <div
        className={`rounded-xl border p-5 flex items-start gap-4 ${
          anyFault ? 'border-danger/50 bg-danger/10' : 'border-emerald-500/50 bg-emerald-500/10'
        }`}
      >
        <div
          className={`rounded-full p-2 mt-0.5 ${
            anyFault ? 'bg-danger/20 animate-pulse-ring' : 'bg-emerald-500/20'
          }`}
        >
          {anyFault ? (
            <AlertTriangle className="w-6 h-6 text-danger" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          )}
        </div>
        <div>
          <p className={`font-bold text-lg ${anyFault ? 'text-danger' : 'text-emerald-500'}`}>
            {anyFault
              ? `${faultCount} of 3 windows flagged for node ${node}`
              : `Node ${node} is clear`}
          </p>
          <p className="text-sm text-zinc-300 mt-1">{verdict}</p>
        </div>
      </div>

      {/* the chart */}
      <div className="bg-panel border border-zinc-700 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h3 className="font-bold text-zinc-200 uppercase tracking-wider text-sm">
              Fault risk across time
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Node {node} &middot; bar height is fault risk, 0&ndash;100%
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-2 text-zinc-400">
              <span className="w-3 h-3 rounded-sm bg-danger" /> Fault
            </span>
            <span className="flex items-center gap-2 text-zinc-400">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Clear
            </span>
            <span className="flex items-center gap-2 text-zinc-400">
              <span className="w-3 h-3 rounded-sm bg-zinc-600" /> No data
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {/* y axis */}
          <div className="relative h-64 w-10 shrink-0 text-[10px] text-zinc-500 font-mono">
            {GRID.map((tick) => (
              <span
                key={tick}
                className="absolute right-0 -translate-y-1/2"
                style={{ top: `${100 - tick}%` }}
              >
                {tick}%
              </span>
            ))}
          </div>

          {/* plot area */}
          <div className="relative h-64 flex-1">
            {GRID.map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 border-t border-zinc-700/60"
                style={{ top: `${100 - tick}%` }}
              />
            ))}

            {/* decision threshold */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-warning/70"
              style={{ top: `${100 - threshold}%` }}
            >
              <span className="absolute right-0 -top-5 text-[10px] font-bold text-warning bg-panel px-2 rounded">
                FAULT THRESHOLD {threshold}%
              </span>
            </div>

            <div className="absolute inset-0 flex items-end justify-around gap-4 sm:gap-10 px-2 sm:px-8">
              {windows.map((w) => {
                const s = styleFor(w)
                return (
                  <div
                    key={w.phase}
                    className="group relative flex h-full w-full max-w-[110px] flex-col justify-end items-center"
                  >
                    <span className={`mb-2 font-mono text-sm font-bold ${s.text}`}>
                      {w.risk}%
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-1000 ease-out ${s.bar} ${s.glow} ${
                        w.fault ? 'animate-pulse' : ''
                      }`}
                      style={{ height: grown ? `${Math.max(w.risk, 1.5)}%` : '0%' }}
                      role="img"
                      aria-label={`${w.title}: ${w.risk} percent fault risk, ${s.label}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* x axis labels */}
        <div className="flex justify-around gap-4 sm:gap-10 px-2 sm:px-8 ml-[52px] mt-3">
          {windows.map((w) => {
            const s = styleFor(w)
            return (
              <div key={w.phase} className="w-full max-w-[110px] text-center">
                <p className="font-bold text-zinc-200 text-sm">{w.title}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                  {w.subtitle}
                </p>
                <span
                  className={`mt-2 inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${s.chip}`}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* per window explanation */}
      <div className="grid gap-4 md:grid-cols-3">
        {windows.map((w) => {
          const s = styleFor(w)
          const Icon = s.Icon
          return (
            <div
              key={w.phase}
              className={`bg-panel border-l-4 ${s.border} border-y border-r border-y-zinc-700 border-r-zinc-700 rounded-lg p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.text}`} />
                <h4 className="font-bold text-zinc-200 text-sm">{w.title}</h4>
                <span className={`ml-auto font-mono text-sm font-bold ${s.text}`}>
                  {w.risk}%
                </span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-400">{w.detail}</p>
              <p className="mt-3 text-[10px] uppercase tracking-wide text-zinc-600">
                Source: {w.source}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FaultTimelineChart
