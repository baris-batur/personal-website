import { StatusBar } from '@/components/status-bar'
import { Hero } from '@/components/hero'
import { ObservabilityPanel } from '@/components/observability-panel'
import { StackInventory } from '@/components/stack-inventory'
import { HomelabTopology } from '@/components/homelab-topology'
import { ServerTelemetry } from '@/components/server-telemetry'
import { ProjectsGrid } from '@/components/projects-grid'
import { ExperienceLog } from '@/components/experience-log'
import { FooterTerminal } from '@/components/footer-terminal'

export default function Page() {
  return (
    <div id="top" className="min-h-screen bg-background">
      <StatusBar />
      <main>
        <Hero />
        <ObservabilityPanel />
        <StackInventory />
        <HomelabTopology />
        <ServerTelemetry />
        <ProjectsGrid />
        <ExperienceLog />
        <FooterTerminal />
      </main>
    </div>
  )
}
