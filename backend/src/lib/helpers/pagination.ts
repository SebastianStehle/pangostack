// The maximum number of items a single page may request, to protect the database from
// unbounded result sets requested via user controlled query parameters.
export const MAX_PAGE_SIZE = 100;

export interface Pagination {
  skip: number;
  take: number;
}

// Clamps user provided paging values into a safe range and returns the skip/take to use.
export function getPagination(page: number, pageSize: number, maxPageSize = MAX_PAGE_SIZE): Pagination {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 0;
  const safeSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), maxPageSize) : 1;

  return { skip: safePage * safeSize, take: safeSize };
}
