import { QuestionPublishedStatusEnum } from "./questionPublishedStatusEnum";
import { Transform } from "class-transformer";

export class QuestionsPaginationDTO {
  // constructor(
  //   bodySearchTerm: string,
  //   publishedStatus: QuestionPublishedStatusEnum,
  //   sortBy: string,
  //   sortDirection: "asc" | "desc",
  //   pageNumber: number,
  //   pageSize: number,
  //   skipSize?: number,
  // ) {
  //   this.bodySearchTerm = bodySearchTerm.toUpperCase() ?? null;
  //   this.publishedStatus = publishedStatus ?? QuestionPublishedStatusEnum.all;
  //   this.sortBy = sortBy ?? "createdAt";
  //   this.sortDirection = sortDirection ?? "desc";
  //   this.pageNumber = pageNumber ?? 1;
  //   this.pageSize = pageSize ?? 10;
  //   this.skipSize =
  //     this.pageNumber > 0 ? this.pageSize * (this.pageNumber - 1) : 0;
  // }

  bodySearchTerm: string = null;
  publishedStatus: QuestionPublishedStatusEnum =
    QuestionPublishedStatusEnum.all;
  sortBy = "createdAt";
  sortDirection: "asc" | "desc" = "desc";
  @Transform(({ value }) => parseInt(value))
  pageNumber = 1;
  @Transform(({ value }) => parseInt(value))
  pageSize = 10;

  get skipSize(): number {
    return this.pageNumber > 0 ? this.pageSize * (this.pageNumber - 1) : 0;
  }

  // get makeDTO() {
  //   return {
  //     bodySearchTerm: this.bodySearchTerm.toUpperCase() ?? null,
  //     publishedStatus: this.publishedStatus ?? QuestionPublishedStatusEnum.all,
  //     sortBy: this.sortBy ?? "createdAt",
  //     sortDirection: this.sortDirection ?? "desc",
  //     pageNumber: this.pageNumber ?? 1,
  //     pageSize: this.pageSize ?? 10,
  //     skipSize: this.pageNumber > 0 ? this.pageSize * (this.pageNumber - 1) : 0,
  //   } as QuestionsPaginationDTO;
  // }
}
