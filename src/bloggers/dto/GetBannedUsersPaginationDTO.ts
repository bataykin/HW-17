export class GetBannedUsersPaginationDTO {
  // @IsString()
  searchLoginTerm?: string | null;

  sortBy?: string | "createdAt";

  sortDirection?: "asc" | "desc";

  // @IsInt()
  // @IsPositive()
  pageNumber?: number | 1;

  // @IsInt()
  // @IsPositive()
  pageSize?: number | 10;

  // @IsUUID()
  // id: string;

  skipSize?: number | 0;
}
