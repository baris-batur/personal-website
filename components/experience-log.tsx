import { experience, experienceLevelColor } from '@/lib/data'
import { Section } from '@/components/section'
import { SectionHeading } from '@/components/section-heading'
import { Reveal } from '@/components/reveal'

export function ExperienceLog() {
  return (
    <Section index="06" label="log">
      <SectionHeading kicker="history" title="Changelog" spec={`${experience.length} commits`}>
        A reverse-chronological log of where I&apos;ve studied, worked, and shipped. Read it like a
        git history of the last few years.
      </SectionHeading>

      <div>
        {experience.map((entry, i) => (
          <Reveal key={entry.org + entry.ts} delay={i * 50} as="div">
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-[10rem_1fr]">
              {/* timestamp + level */}
              <div className="md:pt-5">
                <div className="font-mono text-xs text-muted-foreground font-numeric">
                  {entry.ts}
                </div>
                <div
                  className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: experienceLevelColor[entry.level] }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: experienceLevelColor[entry.level] }}
                  />
                  {entry.level}
                </div>
              </div>

              {/* rail + content */}
              <div className="relative border-border pb-10 md:border-l md:pl-8 md:pt-5">
                <span
                  className="absolute left-0 top-6 hidden h-2 w-2 -translate-x-1/2 rounded-full ring-4 ring-background md:block"
                  style={{ background: experienceLevelColor[entry.level] }}
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="text-lg font-medium tracking-tight">{entry.role}</h3>
                  <span className="font-mono text-sm text-primary">@ {entry.org}</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {entry.lines.map((line, j) => (
                    <li
                      key={j}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
