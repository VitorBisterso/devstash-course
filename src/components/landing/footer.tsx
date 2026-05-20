import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-16 px-6 pb-8">
      <div className="max-w-6xl mx-auto flex justify-between gap-16 mb-12 max-md:flex-col max-md:gap-8">
        <div>
          <div className="flex items-center gap-2.5 font-bold text-lg">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#3b82f6" />
              <path
                d="M8 8h12v2H8V8zm0 5h12v2H8v-2zm0 5h8v2H8v-2z"
                fill="white"
              />
            </svg>
            DevStash
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Your developer knowledge hub.
          </p>
        </div>

        <div className="flex gap-12 max-sm:flex-wrap max-sm:gap-8">
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Product
            </h4>
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <span className="text-sm text-muted-foreground cursor-default">
              Changelog
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Resources
            </h4>
            <span className="text-sm text-muted-foreground cursor-default">
              Documentation
            </span>
            <span className="text-sm text-muted-foreground cursor-default">
              API
            </span>
            <span className="text-sm text-muted-foreground cursor-default">
              Blog
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Company
            </h4>
            <span className="text-sm text-muted-foreground cursor-default">
              About
            </span>
            <span className="text-sm text-muted-foreground cursor-default">
              Twitter
            </span>
            <span className="text-sm text-muted-foreground cursor-default">
              GitHub
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t border-border text-center text-sm text-muted-foreground">
        &copy; {year} DevStash. All rights reserved.
      </div>
    </footer>
  );
}
