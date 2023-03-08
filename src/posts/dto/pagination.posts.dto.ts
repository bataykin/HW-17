import {IsInt, IsPositive} from "class-validator";

export class PaginationPostsDto {
    // @IsInt()
    // @IsPositive()
    pageNumber?: number | 1

    // @IsInt()
    // @IsPositive()
    pageSize?: number | 10

    sortBy?: string | "createdAt"

    sortDirection?: "asc" | "desc"

    skipSize?: number
}