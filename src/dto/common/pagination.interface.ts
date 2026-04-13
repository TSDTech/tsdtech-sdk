/**
 * Parameters for controlling list pagination.
 */
export interface PaginationInput {
  /** The page number to retrieve (starts at 1). */
  page?: number;
  /** The number of items to return per page. */
  pageSize?: number;
}

/**
 * Standard envelope for paginated API responses.
 * @template T - The type of the items contained in the list.
 */
export interface PaginatedListResponse<T> {
  /** Array of items for the current page. */
  items: T[];
  /** Total number of pages available based on the pageSize. */
  pageCount: number;
  /** Total number of items across all pages. */
  totalItems?: number;
}