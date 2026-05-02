import { AppError } from "./AppError";

export type PaginationQuery = {
  page?: string | number;
  pageSize?: string | number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: Pagination;
};

const parsePositiveIntegerQueryParam = (name: string, value: string | number | undefined, defaultValue: number) => {
  if (value === undefined || value === "") {
    return defaultValue;
  }

  const parsedValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(`${name} must be a number greater than or equal to 1`, 400);
  }

  return parsedValue;
};

export const paginate = <T>(items: T[], query: PaginationQuery = {}): PaginatedResult<T> => {
  const page = parsePositiveIntegerQueryParam("page", query.page, 1);
  const pageSize = parsePositiveIntegerQueryParam("pageSize", query.pageSize, 10);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};
