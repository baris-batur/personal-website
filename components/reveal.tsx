'use client'

import type { ReactNode } from 'react'
import { useInView } from '@/hooks/use-in-view'

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'tr' | 'section'
}) {
  const { ref, inView } = useInView()
  const Comp = Tag as any
  return (
    <Comp
      ref={ref as any}
      className={`reveal ${inView ? 'in' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Comp>
  )
}
