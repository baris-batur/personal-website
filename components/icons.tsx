import type { SVGProps } from 'react'

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const Activity = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </svg>
)

export const Terminal = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m4 17 6-5-6-5M12 19h8" />
  </svg>
)

export const Layers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" opacity="0.55" />
  </svg>
)

export const GitBranch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="6" cy="5" r="2.4" />
    <circle cx="6" cy="19" r="2.4" />
    <circle cx="18" cy="7" r="2.4" />
    <path d="M6 7.5v9M18 9.5c0 4-6 2-6 6.5" />
  </svg>
)

export const Cpu = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
    <path d="M9 1.5v3M15 1.5v3M9 19.5v3M15 19.5v3M1.5 9h3M1.5 15h3M19.5 9h3M19.5 15h3" />
  </svg>
)

export const Shield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5l-8-3Z" />
  </svg>
)

export const Radar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" opacity="0.4" />
    <circle cx="12" cy="12" r="5" opacity="0.6" />
    <path d="M12 12 19 7" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
  </svg>
)

export const Copy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="12" height="12" rx="1.5" />
    <path d="M5 15V4a1 1 0 0 1 1-1h9" opacity="0.6" />
  </svg>
)

export const Check = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m5 13 4 4 10-11" />
  </svg>
)
