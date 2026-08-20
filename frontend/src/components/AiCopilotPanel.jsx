import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertOctagon,
  Check,
  ClipboardCopy,
  Loader2,
  Radar,
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
      // clipboard blocked (insecure context or denied permission) - the
      // command is still on screen to copy by hand, so just leave it
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

const AiCopilotPanel = ({ data, loading, error, node }) => {
  // the root cause types out first; the rest of the report is held back until
  // it finishes, so the panel unfolds instead of dumping all at once
  const { shown, done } = useTypewriter(data?.root_cause || '')

  if (!loading && !error && !data) return null

  return (
    <section className="mt-8 animate-fade-up overflow-hidden rounded-xl border border-amber-500/40 bg-panel shadow-xl">
      <header className="flex flex-wrap items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-6 py-4">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/15 p-2">
          <Sparkles className="h-5 w-5 text-amber-300" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-amber-200">GenAI Incident Commander</h3>
          <p className="text-xs text-zinc-400">
            Gemini reading the fault on node {node} as an L1 engineer
          </p>
        </div>
        {loading && (
          <span className="flex items-center gap-2 font-mono text-xs text-amber-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            GENERATING
          </span>
        )}
        {data?.model && !loading && (
          <span className="rounded border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase text-zinc-500">
            {data.model}
          </span>
        )}
      </header>

      <div className="p-6">
        {loading && (
          <div className="space-y-3">
            <p className="animate-pulse font-mono text-sm text-amber-300">
              Correlating telemetry, drafting root cause and remediation...
            </p>
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
            {/* root cause, typed out */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <Radar className="h-4 w-4 text-amber-300" />
                Root cause analysis
              </h4>
              <p className="text-sm leading-relaxed text-zinc-200">
                {shown}
                {!done && (
                  <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-amber-300" />
                )}
              </p>
            </div>

            {done && (
              <>
                {data.impact && (
                  <div className="animate-fade-up rounded-lg border-l-4 border-danger bg-danger/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-danger">
                      If left alone
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-200">
                      {data.impact}
                    </p>
                  </div>
                )}

                {/* how to mend it now */}
                {data.immediate_actions?.length > 0 && (
                  <div className="animate-fade-up">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      <Wrench className="h-4 w-4 text-amber-300" />
                      Mend it now
                      <span className="font-normal normal-case tracking-normal text-zinc-600">
                        &mdash; safest step first
                      </span>
                    </h4>
                    <ol className="space-y-4">
                      {data.immediate_actions.map((action, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-zinc-700 bg-dark/60 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-mono text-xs font-bold text-amber-300">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-zinc-100">{action.step}</p>
                              {action.detail && (
                                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                                  {action.detail}
                                </p>
                              )}
                              {action.command && <CommandLine command={action.command} />}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* how to stop it happening again */}
                {data.prevention?.length > 0 && (
                  <div className="animate-fade-up">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Prevent it recurring
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

                {data.verification && (
                  <div className="animate-fade-up flex items-start gap-3 rounded-lg border border-zinc-700 bg-dark/40 p-4">
                    <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Confirm the fix
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                        {data.verification}
                      </p>
                    </div>
                  </div>
                )}

                <p className="border-t border-zinc-800 pt-4 text-xs leading-relaxed text-zinc-500">
                  Generated by a language model from the telemetry above. Review
                  every command before running it against a live network.
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
