import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class GenerateAllSQLTables {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  static async startUpDB() {
    console.log('in config/db script...');

    // await this.dataSource.query(`
    //
    //         CREATE TABLE IF NOT EXISTS likes (
    //             id          SERIAL PRIMARY KEY ,
    //             "postId"  INTEGER NOT NULL,
    //             "commentId"  INTEGER NOT NULL,
    //             "userId"    INTEGER NOT NULL,
    //             reaction    varchar(10) DEFAULT 'None'
    //             "addedAt"   DATE DEFAULT NOW(),
    //
    //             CONSTRAINT FK_LIKES_POSTS
    //                 FOREIGN KEY ("postId")
    //                 REFERENCES posts (id) ),
    //
    //             CONSTRAINT FK_LIKES_COMMENTS
    //                 FOREIGN KEY ("commentId")
    //                 REFERENCES comments (id) )
    //         `)
  }
}
