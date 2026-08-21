import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertOctagon,
  Briefcase,
  Building2,
  Check,
  ClipboardCopy,
  DollarSign,
  Loader2,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react'

/**
 * Renders text one character at a time so the copilot reads as though it is
 * thinking out loud. Skips straight to the full string when the user has asked
 * for reduced motion.
 */
const useTypewriter = (text, speed = 8) => {
  const [typed, setTyped] = useState(0)

  const reduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    if (!text || reduceMotion) return

    const id = setInterval(() => {
      setTyped((n) => (n >= text.length ? n : n + 1))
    }, speed)

    return () => clearInterval(id)
  }, [text, speed, reduceMotion])

  // derived, so there is never a stale reset to flush on a new report
  const shown = reduceMotion ? text : text.slice(0, typed)
  const done = reduceMotion || !text || typed >= text.length

  return { shown, done }
}

const CommandLine = ({ command }) => {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard blocked (insecure context or denied permission)
    }
  }

  return (
    <div className="group mt-2 flex items-start gap-2 rounded-md border border-zinc-700 bg-dark p-3">
      <span className="select-none font-mono text-xs text-emerald-500">$</span>
      <code className="flex-1 break-all font-mono text-xs leading-relaxed text-zinc-300">
        {command}
      </code>
      <button
        onClick={copy}
        title="Copy command"
        aria-label={copied ? 'Command copied' : 'Copy command'}
        className="shrink-0 rounded p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-primary"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <ClipboardCopy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}

const AiCopilotPanel = ({ data, loading, error, node, activeRole = 'L1 Engineer', onRoleChange }) => {
  // the root cause types out first; the rest of the report is held back until it finishes
  const { shown, done } = useTypewriter(data?.root_cause || '')

  if (!loading && !error && !data) return null

  const isNoc = activeRole === 'NOC Manager'

  return (
    <section
      className={`mt-8 animate-fade-up overflow-hidden rounded-xl border shadow-xl transition-colors duration-300 ${
        isNoc
          ? 'border-cyan-500/40 bg-panel'
          : 'border-amber-500/40 bg-panel'
      }`}
    >
      {/* Header with Title & Role Switcher */}
      <header
        className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 transition-colors duration-300 ${
          isNoc
            ? 'border-cyan-500/30 bg-cyan-500/10'
            : 'border-amber-500/30 bg-amber-500/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg border p-2 ${
              isNoc
                ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                : 'border-amber-500/40 bg-amber-500/20 text-amber-300'
            }`}
          >
            {isNoc ? <Building2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`font-bold tracking-wide ${
                  isNoc ? 'text-cyan-200' : 'text-amber-200'
                }`}
              >
                {isNoc ? 'Executive NOC Commander' : 'L1 Technical Incident Commander'}
              </h3>
              {data?.model && !loading && (
                <span className="rounded border border-zinc-700 bg-dark/80 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-400">
                  {data.model}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {isNoc
                ? `Gemini assessing SLA risk, financial loss & subscriber blast radius on node ${node}`
                : `Gemini diagnosing hardware faults & bash operations on node ${node}`}
            </p>
          </div>
        </div>

        {/* Interactive Role Switcher Pills */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-dark/80 p-1">
          <button
            onClick={() => onRoleChange && onRoleChange('L1 Engineer')}
            disabled={loading}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-bold transition ${
              activeRole === 'L1 Engineer'
                ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            L1 Engineer
          </button>
          <button
            onClick={() => onRoleChange && onRoleChange('NOC Manager')}
            disabled={loading}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono font-bold transition ${
              activeRole === 'NOC Manager'
                ? 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            NOC Manager
          </button>
        </div>
      </header>

      <div className="p-6">
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {isNoc
                  ? 'Gemini formulating Executive NOC Incident & SLA Briefing...'
                  : 'Correlating telemetry, drafting technical root cause & bash fixes...'}
              </span>
            </div>
            <div className="h-2 w-3/4 animate-pulse rounded bg-zinc-700" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-zinc-700" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
            <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-bold text-warning">
                Copilot could not generate a response
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">{error}</p>
              <p className="mt-2 text-xs text-zinc-500">
                The prediction above is unaffected &mdash; only the AI write-up failed.
              </p>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-7">
            {/* Persona Badge Notification */}
            <div
              className={`flex items-center justify-between rounded-lg border p-3 text-xs font-mono ${
                isNoc
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {isNoc ? <Building2 className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                Active Perspective: <b>{isNoc ? 'Executive NOC Operations' : 'L1 Network Diagnostics'}</b>
              </span>
              <span className="text-[11px] text-zinc-400">
                {isNoc ? 'Business & SLA Focused' : 'CLI & Hardware Focused'}
              </span>
            </div>

            {/* Root cause / Executive Assessment */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <Radar className={`h-4 w-4 ${isNoc ? 'text-cyan-400' : 'text-amber-300'}`} />
                {isNoc ? 'Executive Incident Assessment' : 'Technical Root Cause Analysis'}
              </h4>
              <p className="text-sm leading-relaxed text-zinc-200">
                {shown}
                {!done && (
                  <span
                    className={`ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse ${
                      isNoc ? 'bg-cyan-400' : 'bg-amber-300'
                    }`}
                  />
                )}
              </p>
            </div>

            {done && (
              <>
                {data.impact && (
                  <div
                    className={`animate-fade-up rounded-lg border-l-4 p-4 ${
                      isNoc
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-danger bg-danger/10'
                    }`}
                  >
                    <p
                      className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                        isNoc ? 'text-cyan-300' : 'text-danger'
                      }`}
                    >
                      {isNoc ? <DollarSign className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      {isNoc ? 'Financial & SLA Risk Exposure' : 'Subscriber & Service Impact (If Left Alone)'}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-200">
                      {data.impact}
                    </p>
                  </div>
                )}

                {/* Immediate Actions / Operational Directives */}
                {data.immediate_actions?.length > 0 && (
                  <div className="animate-fade-up">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {isNoc ? (
                        <Briefcase className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <Wrench className="h-4 w-4 text-amber-300" />
                      )}
                      {isNoc ? 'Operational Directives & Escalation' : 'Mend It Now'}
                      <span className="font-normal normal-case tracking-normal text-zinc-600">
                        {isNoc ? '— executive action items' : '— safest step first'}
                      </span>
                    </h4>
                    <ol className="space-y-4">
                      {data.immediate_actions.map((action, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-zinc-700 bg-dark/60 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                                isNoc
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-zinc-100">{action.step}</p>
                              {action.detail && (
                                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                                  {action.detail}
                                </p>
                              )}
                              {action.command && !isNoc && (
                                <CommandLine command={action.command} />
                              )}
                              {action.command && isNoc && (
                                <div className="mt-2 inline-flex items-center gap-1.5 rounded border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-mono text-cyan-300">
                                  <span>Action Item:</span>
                                  <span className="font-bold">{action.command}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Prevention / SLA Mitigation */}
                {data.prevention?.length > 0 && (
                  <div className="animate-fade-up">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      {isNoc ? 'Long-Term SLA & Contract Protection' : 'Prevent It Recurring'}
                    </h4>
                    <ul className="space-y-2">
                      {data.prevention.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-dark/40 p-3"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span className="text-sm leading-relaxed text-zinc-300">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Verification / Executive Sign-Off */}
                {data.verification && (
                  <div className="animate-fade-up flex items-start gap-3 rounded-lg border border-zinc-700 bg-dark/40 p-4">
                    <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        {isNoc ? 'Executive Incident Clearance Criteria' : 'Confirm The Fix'}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                        {data.verification}
                      </p>
                    </div>
                  </div>
                )}

                <p className="border-t border-zinc-800 pt-4 text-xs leading-relaxed text-zinc-500">
                  Tailored by Gemini AI specifically for {activeRole}. Review all directives before execution.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default AiCopilotPanel
