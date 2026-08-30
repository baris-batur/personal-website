import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <figure className="plate w-full max-w-md bg-card/40 p-6">
        <figcaption className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          404
        </figcaption>
        <p className="mt-3 text-pretty text-foreground">page not found</p>
        <Link
          href="/"
          className="mt-5 inline-block border border-border px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          back to index
        </Link>
      </figure>
    </main>
  )
}
