export class SAGetUsersPaginationModel {
  banStatus: "all" | "banned" | "notBanned";
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy = "createdAt";
  sortDirection: "asc" | "desc";
  pageNumber: number;
  pageSize: number;
  skipSize: number;
}
