import type { ReactNode } from 'react'

export function Section({
  id,
  index,
  label,
  field,
  className = '',
  children,
}: {
  id?: string
  index: string
  label: string
  field?: 'dotted' | 'grid'
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={`relative border-b border-border ${className}`}>
      {field && (
        <div
          className={`pointer-events-none absolute inset-0 ${
            field === 'dotted' ? 'dotted-field' : 'grid-field'
          } opacity-40`}
          aria-hidden
        />
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[5rem_1fr]">
          {/* editorial spine / gutter */}
          <div className="hidden lg:block lg:border-r lg:border-border">
            <div className="sticky top-11 flex flex-col items-end gap-4 pr-5 pt-20">
              <span className="font-mono text-xs tracking-tight text-primary">§{index}</span>
              <span className="spine-label font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {label}
              </span>
            </div>
          </div>

          {/* content */}
          <div className="min-w-0 py-16 lg:py-24 lg:pl-10">{children}</div>
        </div>
      </div>
    </section>
  )
}
