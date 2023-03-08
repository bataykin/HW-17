export class BlogsPaginationDto {
  // @IsString()
  searchNameTerm?: string | null;

  // @IsInt()
  // @IsPositive()
  pageNumber?: number | 1;

  // @IsInt()
  // @IsPositive()
  pageSize?: number | 10;

  sortBy?: string | 'createdAt';

  sortDirection?: 'asc' | 'desc';

  skipSize?: number | 0;
}
