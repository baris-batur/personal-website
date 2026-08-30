// ---------------------------------------------------------------------------
// Content schema — values live in lib/data.ts (edit that file).
// Telemetry types live in lib/telemetry.ts (client-safe) and are re-exported here.
// The sample generator and sanitizer are server-only.
// ---------------------------------------------------------------------------

export type Profile = {
  name: string
  role: string
  region: string
  coords: string
  email: string
  /** Short handle shown in the status bar (e.g. github slug). */
  slug: string
  /** Identity-node label on the control-plane instrument. */
  identityLabel: string
  github: string
  githubUrl: string
  linkedin: string
  linkedinUrl: string
  summary: string
  status: string
  taglinePrefix: string
  taglineEmphasis: readonly [string, string, string]
  compiledLine: string
  edition: string
  terminalPrompt: string
  terminalNow: string
  footerHeadline: string
  footerPitch: string
  footerCredit: string
  seoTitle: string
  seoDescription: string
}

export type ContactLink = {
  id: 'email' | 'github' | 'linkedin'
  label: string
  value: string
  href: string
}

export type HeroFact = {
  label: string
  value: string
  sub?: string
}

export type SystemNode = {
  id: string
  label: string
  detail: string
}

export type HeroMetric = {
  value: number
  label: string
  note: string
}

export type HomelabTier = 'edge' | 'control' | 'workload' | 'storage'
export type HomelabPlan = 'planned' | 'idea' | 'external' | 'live'

export type HomelabNode = {
  id: string
  label: string
  sub: string
  x: number
  y: number
  tier: HomelabTier
  plan: HomelabPlan
  tech: string
  detail: string
}

export type HomelabEdge = {
  from: string
  to: string
  label: string
}

export type SkillLevel = 'core' | 'strong' | 'familiar' | 'learning'
export type SkillContext = 'work' | 'projects' | 'study' | 'personal'

export type Skill = {
  domain: string
  primary: string
  tools: string[]
  level: SkillLevel
  context: SkillContext
}

export type ProjectStatus = 'work' | 'collab' | 'experimental' | 'personal' | 'jam'

export type CaseFile = {
  problem: string
  built: string
  approach: string[]
  outcome: string
  outcomeKind: 'quant' | 'qual'
  architecture: { step: string; note: string }[]
  decisions: { choice: string; rationale: string }[]
  challenges: string[]
}

export type Project = {
  id: string
  name: string
  kind: string
  blurb: string
  meta: { k: string; v: string }[]
  tags: string[]
  status: ProjectStatus
  href?: string
  /** GitHub (or other) source, when href is the live site. */
  sourceHref?: string
  /** Optional playable build (e.g. itch.io). Shown beside href as “play the game”. */
  playHref?: string
  feature?: boolean
  caseFile: CaseFile
}

export type ExperienceLevel = 'WORK' | 'AI' | 'JAM' | 'SALES' | 'EDU'

export type Experience = {
  ts: string
  org: string
  role: string
  level: ExperienceLevel
  lines: string[]
}

export type GaugeSpecimen = {
  name: string
  value: number
}

export type {
  MetricId,
  TimeRangeId,
  TelemetryMode,
  TelemetryFreshness,
  TelemetryStatus,
  MetricDefinition,
  MetricPoint,
  MetricSnapshot,
  HostInfo,
  TelemetrySnapshot,
  TelemetrySource,
} from './telemetry'
