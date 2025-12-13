import type { PaginationData } from "@/data/pagination";

interface PaginationProps {
  data: PaginationData;
  onPageChange: (page: number) => void;
}

export function Pagination({ data, onPageChange }: PaginationProps) {
  const { page: currentPage, total_pages: totalPages } = data;

  const getPages = () => {
    const pages = new Set<number>();

    pages.add(1);

    if (totalPages > 0) {
      pages.add(totalPages);

      pages.add(currentPage);

      if (currentPage - 1 > 1) pages.add(currentPage - 1);
      if (currentPage + 1 < totalPages) pages.add(currentPage + 1);
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const pagesToShow = getPages();

  return (
    <div className="flex items-center justify-end gap-2 select-none">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>

      {pagesToShow.map((p, i) => (
        <button
          key={i}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 border rounded ${
            p === currentPage ? "bg-secondary font-bold" : ""
          }`}
        >
          {p}
        </button>
      ))}

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
