'use client'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <figure className="plate w-full max-w-md bg-card/40 p-6">
        <figcaption className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          error
        </figcaption>
        <p className="mt-3 text-pretty text-foreground">something went wrong</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 border border-border px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          retry
        </button>
      </figure>
    </main>
  )
}
