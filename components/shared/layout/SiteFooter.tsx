import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">BunDefi</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm font-medium hover:text-primary">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm font-medium hover:text-primary">
            Privacy
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}

