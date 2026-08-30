'use client'

import { useEffect, useRef, useState } from 'react'
import { profile, coreStack, contactLinks } from '@/lib/data'
import { isSafeExternalHref } from '@/lib/safe-href'
import { Copy, Check } from '@/components/icons'

type Line = { cmd: string; out: string[] }

const HELP = [
  'available commands:',
  '  whoami     · who is this',
  '  contact    · how to reach me',
  '  stack      · working toolchain',
  '  now        · what i am doing',
  '  clear      · reset the buffer',
]

function run(cmd: string): string[] {
  const c = cmd.trim().toLowerCase()
  switch (c) {
    case 'help':
      return HELP
    case 'whoami':
      return [`${profile.name} · ${profile.role}`, profile.summary]
    case 'contact':
      return contactLinks.map((l) => `${l.label.padEnd(10)} ${l.value}`)
    case 'stack':
      return [coreStack.join(' · ')]
    case 'now':
      return [profile.status, profile.terminalNow]
    case '':
      return []
    default:
      return [`command not found: ${c}. try 'help'`]
  }
}

export function FooterTerminal() {
  const [history, setHistory] = useState<Line[]>([
    { cmd: 'whoami', out: [`${profile.name} · ${profile.role}`, profile.summary] },
  ])
  const [value, setValue] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [history])

  const submit = () => {
    const cmd = value
    if (cmd.trim().toLowerCase() === 'clear') {
      setHistory([])
      setValue('')
      return
    }
    setHistory((h) => [...h, { cmd, out: run(cmd) }])
    setValue('')
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <footer id="log" className="scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-8 flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span className="text-primary">◢</span>
          <span className="uppercase tracking-[0.2em]">get in touch</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* terminal */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-lg border border-border bg-card/60">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-signal-red/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-signal-amber/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-signal-green/70" />
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {profile.terminalPrompt}
                </span>
              </div>

              <div
                ref={scrollRef}
                className="h-72 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
                onClick={() => inputRef.current?.focus()}
              >
                {history.map((line, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex gap-2">
                      <span className="text-signal-green">➜</span>
                      <span className="text-accent">~</span>
                      <span className="text-foreground">{line.cmd}</span>
                    </div>
                    {line.out.map((o, j) => (
                      <div key={j} className="whitespace-pre-wrap pl-6 text-muted-foreground">
                        {o}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="flex gap-2">
                  <span className="text-signal-green">➜</span>
                  <span className="text-accent">~</span>
                  <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229)
                        submit()
                    }}
                    className="flex-1 bg-transparent text-foreground caret-transparent outline-none"
                    placeholder="type 'help'"
                    spellCheck={false}
                    autoComplete="off"
                    aria-label="terminal command input"
                  />
                  <span className="caret -ml-1 inline-block h-4 w-2 bg-primary" aria-hidden />
                </div>
              </div>
            </div>
          </div>

          {/* contact card */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-card/40 p-6">
              <div>
                <h2 className="text-balance text-3xl font-medium tracking-tight">
                  {profile.footerHeadline}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {profile.status}. {profile.footerPitch}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={copyEmail}
                  className="group flex w-full items-center justify-between rounded border border-border px-3 py-2.5 text-left transition-colors hover:border-primary"
                >
                  <span className="font-mono text-sm text-foreground">{profile.email}</span>
                  {copied ? (
                    <Check className="text-signal-green" width={15} height={15} />
                  ) : (
                    <Copy className="text-muted-foreground group-hover:text-primary" width={15} height={15} />
                  )}
                </button>
                {contactLinks
                  .filter((l) => l.id !== 'email' && isSafeExternalHref(l.href))
                  .map((l) => (
                  <a
                    key={l.id}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center justify-between rounded border border-border px-3 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <span>{l.value}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 group-hover:text-primary">
                      {l.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 font-mono text-[11px] text-muted-foreground sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} {profile.name} · {profile.footerCredit}
          </span>
          <span className="flex items-center gap-2">
            <span className="status-dot h-1.5 w-1.5 rounded-full bg-signal-green" />
            {profile.region}
          </span>
        </div>
      </div>
    </footer>
  )
}
