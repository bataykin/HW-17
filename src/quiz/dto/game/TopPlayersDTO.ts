import { Transform } from "class-transformer";

export class TopPlayersDTO {
  sort: string[] = ["avgScores desc", "sumScore desc"]; //"?sort=avgScores desc&sort=sumScore desc "; // as fieldName<пробел>sortDirection[]
  @Transform(({ value }) => parseInt(value))
  pageNumber = 1;
  @Transform(({ value }) => parseInt(value))
  pageSize = 10;

  get sortBy(): string[] {
    const fields = [];
    for (let i = 0; i < this.sort.length; i++) {
      fields.push(this.sort[i].split(" ")[0]);
    }
    return fields;
  }

  get sortDirection(): string[] {
    const fields = [];
    for (let i = 0; i < this.sort.length; i++) {
      fields.push(this.sort[i].split(" ")[1]);
    }
    return fields;
  }

  get skipSize(): number {
    return this.pageNumber > 0 ? this.pageSize * (this.pageNumber - 1) : 0;
  }
}
