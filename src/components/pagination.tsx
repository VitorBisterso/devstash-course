import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={`${baseUrl}?page=${currentPage - 1}`}>
          <Button variant="outline" size="sm">
            Previous
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : page === currentPage ? (
          <Button key={page} variant="default" size="sm">
            {page}
          </Button>
        ) : (
          <Link key={page} href={`${baseUrl}?page=${page}`}>
            <Button variant="outline" size="sm">
              {page}
            </Button>
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={`${baseUrl}?page=${currentPage + 1}`}>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  )
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = []

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push("...", total)
  } else if (current >= total - 3) {
    pages.push(1, "...")
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1, "...")
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    pages.push("...", total)
  }

  return pages
}
