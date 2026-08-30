// ---------------------------------------------------------------------------
// Personal data layer — edit this file to update the whole site.
// Schema: lib/types.ts. Telemetry adapter: lib/telemetry.ts.
// Facts are sourced from Baris Batur's CV, LinkedIn, and public GitHub profile.
// No production metrics, uptime, traffic, or scale numbers are claimed here.
// ---------------------------------------------------------------------------

import type {
  Profile,
  ContactLink,
  HeroFact,
  SystemNode,
  HeroMetric,
  HomelabTier,
  HomelabPlan,
  HomelabNode,
  HomelabEdge,
  Skill,
  SkillLevel,
  Project,
  ProjectStatus,
  Experience,
  ExperienceLevel,
  GaugeSpecimen,
} from './types'

export type {
  Profile,
  ContactLink,
  HeroFact,
  SystemNode,
  HeroMetric,
  HomelabTier,
  HomelabPlan,
  HomelabNode,
  HomelabEdge,
  Skill,
  SkillLevel,
  SkillContext,
  Project,
  ProjectStatus,
  CaseFile,
  Experience,
  ExperienceLevel,
  GaugeSpecimen,
} from './types'

export const profile = {
  name: 'Baris Batur',
  role: 'DevOps Engineer · Cloud',
  region: 'Stavanger, Norway',
  coords: '58.97°N · 5.73°E',
  email: 'barisbatur12@gmail.com',
  slug: 'baris-batur',
  identityLabel: 'baris',
  github: 'github.com/baris-batur',
  githubUrl: 'https://github.com/baris-batur',
  linkedin: 'linkedin.com/in/baris-batur',
  linkedinUrl: 'https://linkedin.com/in/baris-batur',
  summary:
    'A DevOps engineer working in cloud, keeping platforms healthy across on-prem, cloud, and hybrid environments. Coding is the thing I genuinely enjoy. When I’m not at work I’m self-hosting my own services on servers I run at home, shipping side projects on GitHub, and pulling apart new tools just to see how they tick. That curiosity is what pulls me from fullstack apps to ML experiments to infrastructure. BSc in Computer Science from NTNU.',
  status: 'DevOps Engineer · DFØ',
  taglinePrefix: 'I make systems',
  taglineEmphasis: ['legible', 'reliable', 'simple'] as const,
  compiledLine: 'compiled in stavanger · I use Arch, btw',
  edition: 'ed. 2026 · rev.03',
  terminalPrompt: 'baris@arch:~$ session',
  terminalNow: 'building things · stavanger, norway',
  footerHeadline: "Let's build something.",
  footerPitch:
    'Open to talking about DevOps and cloud, fullstack work, and applied ML. Drop me a line.',
  footerCredit: 'built like infrastructure software',
  seoTitle: 'Baris Batur · DevOps Engineer',
  seoDescription:
    'DevOps engineer from Stavanger building fullstack systems, CI/CD pipelines, and ML tooling, from Postgres and Docker to self-hosted LLMs. A portfolio designed like instrument software.',
} satisfies Profile

export const contactLinks: ContactLink[] = [
  { id: 'email', label: 'email', value: profile.email, href: `mailto:${profile.email}` },
  { id: 'github', label: 'github', value: profile.github, href: profile.githubUrl },
  { id: 'linkedin', label: 'linkedin', value: profile.linkedin, href: profile.linkedinUrl },
]

// Honest, verifiable facts shown in the hero status panel — no trends implied.
export const heroFacts: HeroFact[] = [
  { label: 'location', value: 'Stavanger, NO' },
  { label: 'role', value: 'DevOps Engineer', sub: 'DFØ · Cloud' },
  { label: 'degree', value: 'BSc Computer Science', sub: 'NTNU · 2023–26' },
  { label: 'focus', value: 'DevOps · Cloud', sub: 'kubernetes' },
]

// Hero "control plane" — the systems the identity node connects to.
// Order defines placement around the constellation. Detail lines are factual.
export const systemNodes: SystemNode[] = [
  { id: 'devops', label: 'devops', detail: 'ci/cd · docker · kubernetes' },
  { id: 'ai', label: 'ai / ml', detail: 'pandas · numpy · llms' },
  { id: 'fullstack', label: 'fullstack', detail: 'react · next.js · typescript' },
  { id: 'data', label: 'data', detail: 'postgres · object storage' },
  { id: 'platform', label: 'platform', detail: 'linux · s3 · self-hosted' },
]

// Countable, honest metrics for the hero instrument (they count up on view).
export const heroMetrics: HeroMetric[] = [
  { value: 13, label: 'public repos', note: 'github' },
  { value: 8, label: 'core tools', note: 'daily driver' },
  { value: 3, label: 'spoken langs', note: 'no · en · jp' },
]

// Core stack chips for the hero panel footer.
export const coreStack: string[] = [
  'python',
  'typescript',
  'react',
  'next.js',
  'kubernetes',
  'postgres',
  'docker',
  'linux',
]

// ---------------------------------------------------------------------------
// Homelab topology — a self-hosted Kubernetes cluster Baris is PLANNING to
// build on owned hardware: this website, a media server, and (maybe) file
// hosting. This is a planned reference architecture, NOT a running production
// system — every node carries an honest `plan` status. Edit freely as the
// real build progresses (e.g. flip a node's plan to 'live').
// ---------------------------------------------------------------------------
export const homelabTierLabels: Record<HomelabTier, string> = {
  edge: 'edge · ingress',
  control: 'control plane',
  workload: 'workloads',
  storage: 'storage',
}

export const homelabTierColor: Record<HomelabTier, string> = {
  edge: 'var(--signal-cyan)',
  control: 'var(--signal-amber)',
  workload: 'var(--signal-green)',
  storage: 'var(--foreground)',
}

export const homelabPlanColor: Record<HomelabPlan, string> = {
  planned: 'var(--signal-amber)',
  idea: 'var(--muted-foreground)',
  external: 'var(--signal-cyan)',
  live: 'var(--signal-green)',
}

export const homelabPlanLabel: Record<HomelabPlan, string> = {
  planned: 'planned',
  idea: 'idea · maybe',
  external: 'external',
  live: 'live',
}

export const homelabNodes: HomelabNode[] = [
  {
    id: 'net',
    label: 'internet',
    sub: 'inbound',
    x: 80,
    y: 250,
    tier: 'edge',
    plan: 'external',
    tech: 'DNS · TLS',
    detail: 'Public traffic to my domain arrives here over HTTPS.',
  },
  {
    id: 'proxy',
    label: 'reverse proxy',
    sub: 'ingress · tls',
    x: 230,
    y: 250,
    tier: 'edge',
    plan: 'planned',
    tech: 'Traefik',
    detail:
      'Terminates TLS and routes each request to the right service inside the cluster.',
  },
  {
    id: 'monitor',
    label: 'monitoring',
    sub: 'metrics · dashboards',
    x: 390,
    y: 80,
    tier: 'control',
    plan: 'planned',
    tech: 'Prometheus · Grafana',
    detail: 'Cluster metrics and dashboards so I can actually see what the lab is doing.',
  },
  {
    id: 'k8s',
    label: 'k8s control plane',
    sub: 'orchestration',
    x: 390,
    y: 250,
    tier: 'control',
    plan: 'planned',
    tech: 'k3s / kubeadm',
    detail:
      'A self-managed Kubernetes cluster: the layer I plan to run everything on, on hardware I own.',
  },
  {
    id: 'store',
    label: 'storage',
    sub: 'persistent volumes',
    x: 390,
    y: 420,
    tier: 'storage',
    plan: 'planned',
    tech: 'NAS · PVCs',
    detail: 'Persistent storage backing the media library and hosted files.',
  },
  {
    id: 'site',
    label: 'website',
    sub: 'this portfolio',
    x: 580,
    y: 110,
    tier: 'workload',
    plan: 'planned',
    tech: 'Next.js',
    detail: 'This portfolio, self-hosted on the cluster instead of a managed host.',
  },
  {
    id: 'media',
    label: 'media server',
    sub: 'streaming',
    x: 580,
    y: 250,
    tier: 'workload',
    plan: 'planned',
    tech: 'Jellyfin',
    detail: 'A media server for streaming my own library to my devices.',
  },
  {
    id: 'files',
    label: 'file server',
    sub: 'personal cloud',
    x: 580,
    y: 390,
    tier: 'workload',
    plan: 'idea',
    tech: 'Nextcloud?',
    detail: 'Personal file hosting / cloud storage. A maybe on the roadmap, not decided yet.',
  },
]

export const homelabEdges: HomelabEdge[] = [
  { from: 'net', to: 'proxy', label: 'https' },
  { from: 'proxy', to: 'k8s', label: 'ingress' },
  { from: 'k8s', to: 'site', label: 'serve' },
  { from: 'k8s', to: 'media', label: 'serve' },
  { from: 'k8s', to: 'files', label: 'serve' },
  { from: 'media', to: 'store', label: 'stream' },
  { from: 'files', to: 'store', label: 'store' },
  { from: 'monitor', to: 'k8s', label: 'scrape' },
]

// Playful, factual ticker items.
export const tickerItems: string[] = [
  'based=stavanger',
  'distro=arch',
  'edu=ntnu compsci',
  'lang=python',
  'lang=typescript',
  'lang=c#',
  'focus=devops',
  'orchestration=kubernetes',
  'gitops=argocd',
  'observability=grafana·loki·mimir',
  'db=postgres',
  'container=docker',
  'shell=bash',
  'repos=13',
  'spoken=no·en·jp',
]

export const skillLevelBars: Record<SkillLevel, number> = {
  core: 4,
  strong: 3,
  familiar: 2,
  learning: 1,
}

// Self-assessed familiarity, grounded in the CV — qualitative, not a metric.
export const stack: Skill[] = [
  {
    domain: 'languages',
    primary: 'Python · TypeScript',
    tools: ['Java', 'C', 'C#'],
    level: 'core',
    context: 'projects',
  },
  {
    domain: 'web / backend',
    primary: 'React · Next.js',
    tools: ['Node.js', '.NET', 'Spring', 'Tailwind', 'Vite', 'REST'],
    level: 'strong',
    context: 'work',
  },
  {
    domain: 'data / ml',
    primary: 'Pandas · NumPy',
    tools: ['scikit-learn', 'Torchvision'],
    level: 'strong',
    context: 'projects',
  },
  {
    domain: 'ai / llm',
    primary: 'PyTorch',
    tools: ['NorLLM', 'diffusion models', 'U-Net', 'scikit-learn'],
    level: 'familiar',
    context: 'projects',
  },
  {
    domain: 'databases',
    primary: 'PostgreSQL',
    tools: ['SQLite', 'S3-compatible storage'],
    level: 'strong',
    context: 'work',
  },
  {
    domain: 'devops / infra',
    primary: 'Docker · Kubernetes',
    tools: ['CI/CD', 'Linux', 'Windows Server', 'VM', 'Firebase'],
    level: 'core',
    context: 'work',
  },
  {
    domain: 'tooling',
    primary: 'Git · Linux',
    tools: ['Arch', 'omarchy', 'Bash'],
    level: 'core',
    context: 'personal',
  },
]

export const projectStatusColor: Record<ProjectStatus, string> = {
  work: 'var(--signal-green)',
  collab: 'var(--signal-cyan)',
  experimental: 'var(--signal-amber)',
  jam: 'var(--signal-amber)',
  personal: 'var(--foreground)',
}

export const projects: Project[] = [
  {
    id: 'PRJ-01',
    name: 'CV-Scanner',
    kind: 'trondheim kommune · fullstack',
    blurb:
      'A system for semantic analysis and matching of candidate profiles against job postings, built around a self-hosted NorLLM for privacy and data sovereignty. I focused on the integration layer between the language model and the GUI.',
    meta: [
      { k: 'year', v: '2026' },
      { k: 'role', v: 'developer' },
      { k: 'type', v: 'professional' },
    ],
    tags: ['NorLLM', 'TypeScript', 'React', 'PostgreSQL', 'Windows Server'],
    status: 'work',
    feature: true,
    caseFile: {
      problem:
        'A municipality receives far more applications than staff can read closely. Ranking candidates against a posting by hand is slow and inconsistent, but the data is sensitive, so it cannot be sent to a third-party AI API.',
      built:
        'A fullstack system that semantically matches candidate profiles against job postings, running entirely on infrastructure the municipality controls. I owned the integration layer between the language model and the GUI.',
      approach: [
        'Self-host a Norwegian language model (NorLLM) so no candidate data ever leaves the premises.',
        'Model profiles and postings as clean relational rows in PostgreSQL for the matching engine to read.',
        'Expose inference through a stable REST contract so the frontend never depends on where the model runs.',
        'Bridge on-prem inference to cloud infrastructure over a narrow, explicit trust boundary.',
      ],
      outcome:
        'Delivered a working matching tool that keeps sensitive hiring data on-premise while giving staff a legible ranked view over the model, with data sovereignty and without giving up a modern AI workflow.',
      outcomeKind: 'qual',
      architecture: [
        { step: 'candidate ui', note: 'staff submit profiles + postings' },
        { step: 'api layer', note: 'stable REST contract' },
        { step: 'matching engine', note: 'semantic embeddings' },
        { step: 'norllm', note: 'self-hosted inference' },
        { step: 'postgres', note: 'profiles + postings' },
      ],
      decisions: [
        {
          choice: 'Self-hosted NorLLM over a hosted API',
          rationale: 'Municipal hiring data is sensitive; sovereignty was a hard requirement, not a preference.',
        },
        {
          choice: 'Thin, stateless UI',
          rationale: 'Made the API the single source of truth for match logic and kept the client simple.',
        },
        {
          choice: 'Hybrid on-prem + cloud',
          rationale: 'The app lives in the cloud but inference stays local. The bridge reconciles the two safely.',
        },
      ],
      challenges: [
        'Making a self-hosted model behave like a dependable service the frontend can rely on.',
        'Keeping the trust boundary between local inference and cloud infrastructure explicit and narrow.',
        'Turning raw inference output into a ranking hiring staff can actually reason about.',
      ],
    },
  },
  {
    id: 'PRJ-02',
    name: 'Hackerspace NTNU',
    kind: 'open-source · fullstack',
    blurb:
      'The organization website for DevOps Hackerspace at NTNU. I worked on the fullstack architecture, set up and modelled a PostgreSQL database and S3-compatible object storage for production, and contributed to the CI/CD pipelines.',
    meta: [
      { k: 'year', v: '2025–26' },
      { k: 'stack', v: 'next.js' },
      { k: 'type', v: 'open-source' },
    ],
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Docker'],
    status: 'work',
    href: 'https://hackerspace-ntnu.no/',
    caseFile: {
      problem:
        'A student organization needs a public website and internal tooling that many contributors can work on over time, and it has to actually run in production, not just on a laptop.',
      built:
        'The organization website for DevOps Hackerspace at NTNU. I worked across the fullstack architecture and set up the production data layer and pipelines.',
      approach: [
        'Design a scalable fullstack architecture that a rotating group of contributors can extend.',
        'Model a PostgreSQL database and provision S3-compatible object storage for production.',
        'Contribute to CI/CD pipelines covering build, test, and deploy.',
      ],
      outcome:
        'A live, open-source site running in production with a data layer and deployment pipeline that outlast any single contributor.',
      outcomeKind: 'qual',
      architecture: [
        { step: 'next.js app', note: 'server + client' },
        { step: 'postgres', note: 'modelled schema' },
        { step: 'object storage', note: 'S3-compatible' },
        { step: 'ci/cd', note: 'build · test · deploy' },
      ],
      decisions: [
        {
          choice: 'PostgreSQL + S3-compatible storage',
          rationale: 'Separates structured records from large binary assets cleanly.',
        },
        {
          choice: 'Invest in CI/CD early',
          rationale: 'With many contributors, automated build/test/deploy is what keeps main shippable.',
        },
      ],
      challenges: [
        'Designing an architecture legible enough for volunteers to pick up and extend.',
        'Getting production storage and the database modelled so they hold up under real use.',
      ],
    },
  },
  {
    id: 'PRJ-03',
    name: 'Price Recommendation Model',
    kind: 'cogito x infor · machine learning',
    blurb:
      'An AI model built with Cogito for the business partner Bygger’n that recommends prices using various machine-learning algorithms, then exposed via a REST API for use in downstream systems.',
    meta: [
      { k: 'year', v: '2025' },
      { k: 'stack', v: 'python' },
      { k: 'type', v: 'collaboration' },
    ],
    tags: ['Python', 'scikit-learn', 'Pandas', 'NumPy', 'REST API'],
    status: 'collab',
    href: 'https://github.com/baris-batur/CogitoXInfor-h24',
    caseFile: {
      problem:
        'The business partner Bygger’n needed price recommendations that downstream systems could consume programmatically, rather than relying on manual pricing decisions.',
      built:
        'An AI price-recommendation model built with Cogito, trained on the partner’s data and served over a REST API for integration into other systems.',
      approach: [
        'Explore and preprocess the partner’s data with Pandas and NumPy.',
        'Compare several machine-learning algorithms rather than committing to one up front.',
        'Wrap the trained model in a REST API so downstream systems can call it directly.',
      ],
      outcome:
        'A deployable recommendation model exposed through a clean API, built collaboratively with a real business partner as the customer.',
      outcomeKind: 'qual',
      architecture: [
        { step: 'raw data', note: 'partner dataset' },
        { step: 'preprocessing', note: 'pandas · numpy' },
        { step: 'ml models', note: 'algorithm comparison' },
        { step: 'rest api', note: 'downstream access' },
      ],
      decisions: [
        {
          choice: 'Compare multiple algorithms',
          rationale: 'Let the data pick the model instead of assuming one approach would win.',
        },
        {
          choice: 'Serve via REST',
          rationale: 'The model is only useful to the partner if other systems can consume it.',
        },
      ],
      challenges: [
        'Turning a partner’s real-world data into features a model could learn from.',
        'Balancing model quality against something that integrates cleanly downstream.',
      ],
    },
  },
  {
    id: 'PRJ-04',
    name: 'DiffusionModel',
    kind: 'personal · deep learning',
    blurb:
      'An experimental generative model based on Denoising Diffusion Probabilistic Models (DDPM). A U-Net is trained to reverse Gaussian noise step by step to synthesize car images from scratch.',
    meta: [
      { k: 'year', v: '2024' },
      { k: 'stack', v: 'pytorch' },
      { k: 'type', v: 'experimental' },
    ],
    tags: ['Python', 'PyTorch', 'NumPy', 'Torchvision'],
    status: 'experimental',
    href: 'https://github.com/baris-batur/DiffusionModel',
    caseFile: {
      problem:
        'I wanted to understand generative diffusion from the ground up, not by calling an API, but by implementing the noising and denoising process myself.',
      built:
        'An experimental generative model based on Denoising Diffusion Probabilistic Models (DDPM) that synthesizes car images from pure noise.',
      approach: [
        'Build a preprocessing pipeline over 10,000+ car images in PyTorch.',
        'Train a U-Net to predict and remove Gaussian noise across iterative timesteps.',
        'Tune the sampler and timestep embeddings to improve sample quality.',
      ],
      outcome:
        'A working DDPM that generates car images from scratch, and a hands-on understanding of how diffusion models actually learn to reverse noise.',
      // Qualitative: the 10,000+ figure is dataset size (an input), not a
      // measured result — so this is not labelled a "measured outcome".
      outcomeKind: 'qual',
      architecture: [
        { step: 'image data', note: '10,000+ images' },
        { step: 'forward noise', note: 'gaussian, stepwise' },
        { step: 'u-net', note: 'predicts the noise' },
        { step: 'reverse sample', note: 'denoise to image' },
      ],
      decisions: [
        {
          choice: 'Implement DDPM directly',
          rationale: 'The goal was understanding the mechanism, so a from-scratch build beat a library shortcut.',
        },
        {
          choice: 'U-Net backbone',
          rationale: 'Its encoder–decoder with skip connections is well suited to per-pixel noise prediction.',
        },
      ],
      challenges: [
        'Getting the forward/reverse noise schedules and timestep embeddings correct.',
        'Training stability and sample quality on a single-person compute budget.',
      ],
    },
  },
  {
    id: 'PRJ-05',
    name: 'Pass the Mask',
    kind: 'global game jam · unity',
    blurb:
      'A playable game prototype built from scratch in Unity during a 48-hour game jam, implementing core gameplay logic with C# and a component-based architecture.',
    meta: [
      { k: 'year', v: '2026' },
      { k: 'tool', v: 'unity' },
      { k: 'type', v: 'game jam' },
    ],
    tags: ['C#', 'Unity', '.NET', 'Git'],
    status: 'jam',
    href: 'https://github.com/sivertun/mask-ggj',
    playHref: 'https://emilorv.itch.io/pass-the-mask',
    caseFile: {
      problem:
        'Global Game Jam gives you a theme and 48 hours to ship a playable game from nothing. The constraint is time, not scope.',
      built:
        'A playable Unity game prototype built from scratch during the jam, with core gameplay logic implemented in C#.',
      approach: [
        'Scope ruthlessly to one core mechanic that can ship inside 48 hours.',
        'Structure the game with a component-based architecture in Unity.',
        'Implement gameplay logic in C# and iterate against playtests as they happen.',
      ],
      outcome:
        'A finished, playable prototype of “Pass the Mask”, shipped and published to itch.io within the 48-hour window.',
      outcomeKind: 'qual',
      architecture: [
        { step: 'theme', note: '48-hour constraint' },
        { step: 'core mechanic', note: 'scoped tight' },
        { step: 'components', note: 'unity architecture' },
        { step: 'playable build', note: 'shipped to itch.io' },
      ],
      decisions: [
        {
          choice: 'Component-based architecture',
          rationale: 'Kept gameplay pieces composable and fast to change under time pressure.',
        },
        {
          choice: 'One mechanic, done well',
          rationale: 'In a jam, a finished small game beats an unfinished ambitious one.',
        },
      ],
      challenges: [
        'Shipping something genuinely playable inside a hard 48-hour deadline.',
        'Cutting scope fast enough to leave time for polish and playtesting.',
      ],
    },
  },
  {
    id: 'PRJ-06',
    name: 'personal-linux-config',
    kind: 'personal · dotfiles',
    blurb:
      'My custom Arch Linux configuration, built on top of the omarchy distribution. A living record of a setup I actually daily-drive. (I use Arch, btw.)',
    meta: [
      { k: 'year', v: '2025' },
      { k: 'os', v: 'arch' },
      { k: 'type', v: 'personal' },
    ],
    tags: ['Linux', 'Arch', 'Bash', 'omarchy'],
    status: 'personal',
    href: 'https://github.com/baris-batur/personal-linux-config',
    caseFile: {
      problem:
        'A daily-driver development environment is worth reproducing. Rebuilding it from memory on a new machine is error-prone and slow.',
      built:
        'My custom Arch Linux configuration, layered on top of the omarchy distribution and version-controlled as a living record of a setup I actually use every day.',
      approach: [
        'Base the setup on omarchy, then layer personal configuration on top.',
        'Keep dotfiles and Bash scripts in version control as the source of truth.',
        'Treat the repo as living documentation, updated as the setup evolves.',
      ],
      outcome:
        'A reproducible, version-controlled environment I daily-drive, and a reference I can trust when setting up a new machine.',
      outcomeKind: 'qual',
      architecture: [
        { step: 'omarchy base', note: 'arch distribution' },
        { step: 'dotfiles', note: 'version-controlled' },
        { step: 'bash scripts', note: 'setup automation' },
        { step: 'daily driver', note: 'the real system' },
      ],
      decisions: [
        {
          choice: 'Build on omarchy',
          rationale: 'Start from a sane base instead of assembling everything from zero.',
        },
        {
          choice: 'Everything in git',
          rationale: 'A config that isn’t version-controlled isn’t reproducible.',
        },
      ],
      challenges: [
        'Keeping the repo honest as the real setup drifts over time.',
      ],
    },
  },
]

export const experienceLevelColor: Record<ExperienceLevel, string> = {
  WORK: 'var(--signal-green)',
  AI: 'var(--signal-cyan)',
  JAM: 'var(--signal-amber)',
  SALES: 'var(--muted-foreground)',
  EDU: 'var(--foreground)',
}

export const experience: Experience[] = [
  {
    ts: 'Jul 2026 – now',
    org: 'DFØ · Norwegian Agency for Public and Financial Management',
    role: 'Systems Developer (DevOps/Cloud) & Systems Administrator (HR/Cloud)',
    level: 'WORK',
    lines: [
      'Broad DevOps work keeping the platform behind the agency’s payroll service healthy, from cluster management and observability to secrets and automated deployments.',
      'Still onboarding onto the full scope of the role, so this entry will be revised as it develops.',
    ],
  },
  {
    ts: 'Jan – May 2026',
    org: 'Trondheim Kommune',
    role: 'Full-stack Developer',
    level: 'WORK',
    lines: [
      'Developed CV-Scanner, an LLM-based system that semantically analyzes CVs against job postings.',
      'Built as a bachelor’s thesis in consultative partnership with the HR department at Trondheim Kommune.',
      'Self-hosted NorLLM for privacy and data sovereignty, with secure API integration to cloud infrastructure.',
    ],
  },
  {
    ts: 'Aug 2025 – May 2026',
    org: 'Hackerspace NTNU',
    role: 'Web Developer',
    level: 'WORK',
    lines: [
      'Developed and maintained the Hackerspace NTNU website (hackerspace-ntnu.no).',
      'Primary focus on fullstack development with React and TypeScript, plus DevOps responsibilities.',
      'Set up and modelled a PostgreSQL database and S3-compatible object storage, and contributed to CI/CD.',
    ],
  },
  {
    ts: 'Feb 2026',
    org: 'Global Game Jam 2026',
    role: 'Game Developer',
    level: 'JAM',
    lines: [
      'Teamed up with a small crew to build “Pass the Mask”, a 2D platformer in Unity/C# in 48 hours.',
      'Explored the theme “Mask” through tilemap physics and Git-based collaboration.',
    ],
  },
  {
    ts: 'Jan – Jun 2025',
    org: 'Cogito x Infor',
    role: 'Data Scientist',
    level: 'AI',
    lines: [
      'Partnered with ERP provider Infor and building-materials supplier Bygger’n on data-driven pricing.',
      'Used machine learning on data gathered via a web-scraping API to generate upper/lower price recommendations.',
    ],
  },
  {
    ts: 'Aug – Dec 2024',
    org: 'Cogito NTNU',
    role: 'AI Developer',
    level: 'AI',
    lines: [
      'Designed and implemented deep generative models based on Denoising Diffusion Probabilistic Models (DDPM).',
      'Used iterative denoising and stochastic noise processes to synthesize image data from learned representations.',
      'Built preprocessing pipelines over 10,000+ images in PyTorch.',
    ],
  },
  {
    ts: 'Sep – Dec 2023',
    org: 'Sektor Alarm',
    role: 'Sales Consultant',
    level: 'SALES',
    lines: [
      'Field sales focused on identifying customer needs and tailoring solutions accordingly.',
      'Strengthened communication, persuasion, and consultative selling skills.',
    ],
  },
  {
    ts: '2023 – 2026',
    org: 'NTNU Trondheim',
    role: 'BSc Computer Science',
    level: 'EDU',
    lines: ['Bachelor’s degree in Computer Science.'],
  },
]

// ---------------------------------------------------------------------------
// Synthetic sample series for the interface-demo dashboard. This data is
// illustrative only — it is NOT real telemetry from any production system.
// ---------------------------------------------------------------------------
export const latencySeries = [
  42, 44, 41, 39, 45, 52, 61, 78, 96, 110, 118, 108, 96, 88, 84, 90, 102, 121, 134, 128, 112, 90,
  72, 58,
]
export const trafficSeries = [
  12, 9, 7, 6, 8, 14, 28, 46, 62, 71, 74, 70, 66, 64, 61, 63, 69, 78, 82, 75, 58, 40, 26, 17,
]

// Generic gauge specimens for the interface study — not real SLOs.
export const gauges: GaugeSpecimen[] = [
  { name: 'gauge · alpha', value: 62 },
  { name: 'gauge · beta', value: 78 },
  { name: 'gauge · gamma', value: 41 },
]
