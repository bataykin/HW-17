import { Transform } from "class-transformer";

export class CreateUserPaginatedDto {
  // @IsInt()
  @Transform(({ value }) => parseInt(value))
  pageNumber?: number | 1;

  // @IsInt({})
  @Transform(({ value }) => parseInt(value), {})
  pageSize?: number | 10;

  searchLoginTerm?: string | null;
  searchEmailTerm?: string | null;

  sortBy?: string | "createdAt";

  sortDirection?: "asc" | "desc";

  skipSize?: number | 0;
}
