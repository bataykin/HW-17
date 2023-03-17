import { Transform } from "class-transformer";

export class GamesPaginationDTO {
  sortBy = "pairCreatedDate";
  sortDirection: "asc" | "desc" = "desc";
  @Transform(({ value }) => parseInt(value))
  pageNumber = 1;
  @Transform(({ value }) => parseInt(value))
  pageSize = 10;

  get skipSize(): number {
    return this.pageNumber > 0 ? this.pageSize * (this.pageNumber - 1) : 0;
  }
}
