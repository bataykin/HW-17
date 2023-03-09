export type PaginatorModel<Entities> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Entities;
};
