import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class TestingSQLService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async removeAll() {
    await this.dataSource.dropDatabase();

    await this.dataSource.query(`
                    
                    
                    CREATE TABLE users (
                        id                  SERIAL PRIMARY KEY ,    
                        login               varchar(15) UNIQUE NOT NULL,        
                        email               varchar(100) NOT NULL,
                        "passwordHash"      varchar NOT NULL,
                        "addedAt"           TIMESTAMP DEFAULT NOW(),
                        "confirmationCode"  varchar,
                        "expirationDate"    TIMESTAMP,
                        "isConfirmed"       BOOLEAN DEFAULT FALSE);


                    CREATE TABLE bloggers (
                        id                  SERIAL PRIMARY KEY ,    
                        name                varchar(15) UNIQUE NOT NULL,        
                        "websiteUrl"        varchar(100) NOT NULL);
        
        
        
                    CREATE TABLE posts (
                        id                  SERIAL PRIMARY KEY ,    
                        title               varchar(30)  NOT NULL,        
                        "shortDescription"  varchar(100) NOT NULL,
                        content             varchar(1000) NOT NULL,
                        "bloggerId"         INTEGER,
                        "addedAt"           TIMESTAMP DEFAULT NOW(),
                        "extendedLikesInfo" INTEGER);
                        
                        
                        
                     CREATE TABLE comments (
                        id                  SERIAL PRIMARY KEY ,    
                        content             varchar(300) NOT NULL,
                        "userId"            INTEGER,  
                        "userLogin"         varchar(30) NOT NULL,      
                        "addedAt"           TIMESTAMP DEFAULT NOW(),
                        "postId"            INTEGER NOT NULL,
                        "likesInfo"         INTEGER);
                    

                                                               
                    CREATE TABLE likes (
                        id                  SERIAL PRIMARY KEY ,    
                        "postId"            INTEGER,
                        "commentId"         INTEGER,
                        "userId"            INTEGER NOT NULL,
                        reaction            varchar(10) DEFAULT 'None',
                        "addedAt"           TIMESTAMP DEFAULT NOW());   
                    
                    
                    
                    CREATE TABLE reftokens (
                        id                  SERIAL  ,    
                        token             varchar PRIMARY KEY NOT NULL,
                        "isValid"           BOOLEAN,
                        "replacedBy"        varchar,
                        "expiresAt"         TIMESTAMP ); 
                     
                     
                     
                    ALTER TABLE posts 
                        ADD CONSTRAINT FK_POSTS_BLOGGERS
                            FOREIGN KEY ("bloggerId") 
                            REFERENCES bloggers (id);
                        
                    ALTER TABLE posts 
                        ADD CONSTRAINT FK_POSTS_LIKES
                            FOREIGN KEY ("extendedLikesInfo") 
                            REFERENCES likes (id);
                      
                      
                            
                    ALTER TABLE comments 
                        ADD CONSTRAINT FK_COMMENTS_POSTS
                        FOREIGN KEY ("postId") 
                        REFERENCES posts (id);
                        
                    ALTER TABLE comments 
                        ADD CONSTRAINT FK_COMMENTS_LIKES
                        FOREIGN KEY ("likesInfo") 
                        REFERENCES likes (id);
                        
                    
                    
                    ALTER TABLE likes 
                        ADD CONSTRAINT FK_LIKES_POSTS
                            FOREIGN KEY ("postId") 
                            REFERENCES posts (id);
                            
                    ALTER TABLE likes 
                        ADD CONSTRAINT FK_LIKES_COMMENTS
                            FOREIGN KEY ("commentId") 
                            REFERENCES comments (id);

                    ALTER TABLE likes 
                        ADD CONSTRAINT PK_LIKES_USER_POST
                            UNIQUE ("userId", "postId");
                            
                    ALTER TABLE likes 
                        ADD CONSTRAINT PK_LIKES_USER_COMMENT
                            UNIQUE ("userId", "commentId");
        
        
      `);

    // drop table public.posts CASCADE
    //
    // for (let collectionsKey in this.connection.collections) {
    //   await this.connection.dropCollection(collectionsKey)
    // }
    //
    // await this.connection.dropCollection('users')
    // await this.connection.dropCollection('requests')
    // await this.connection.dropCollection('refreshtokens')
    // await this.connection.dropCollection('bloggers')
    // await this.connection.dropCollection('posts')
    // await this.connection.dropCollection('comments')
    return "all data deleted...";
  }

  async removeQuiz() {
    await this.removeAll();

    await this.dataSource.query(`
                    
                    CREATE TABLE questions (
                        id                  SERIAL PRIMARY KEY,    
                        question            varchar(100) UNIQUE NOT NULL,        
                        answer              varchar(100) NOT NULL,
                        "lastUsedAt"        TIMESTAMP DEFAULT NOW());


                    CREATE TABLE answers (
                        id                  SERIAL PRIMARY KEY ,    
                        "gameId"            INTEGER NOT NULL,        
                        "playerId"          INTEGER NOT NULL,
                        "questionId"        INTEGER NOT NULL, 
                        "answerStatus"      varchar(10),
                        "addedAt"           TIMESTAMP DEFAULT NOW());
                
        
                    CREATE TABLE players (
                        id                  SERIAL PRIMARY KEY,    
                        answers             INTEGER [],        
                        "userId"            INTEGER,
                        score               INTEGER);
                                                
                        
                     CREATE TABLE games (
                        id                  SERIAL PRIMARY KEY ,    
                        "firstPlayer"       INTEGER,  
                        "secondPlayer"      INTEGER,  
                        questions           INTEGER [],      
                        status              varchar(30),
                        "pairCreatedDate"   TIMESTAMP DEFAULT NOW(),
                        "startGameDate"     TIMESTAMP,
                        "finishGameDate"    TIMESTAMP);
                    

                     
                    ALTER TABLE answers 
                        ADD CONSTRAINT FK_ANSWERS_QUESTIONS
                            FOREIGN KEY ("questionId") 
                            REFERENCES questions (id);
                        
                    ALTER TABLE answers 
                        ADD CONSTRAINT FK_ANSWERS_PLAYERS
                            FOREIGN KEY ("playerId") 
                            REFERENCES players (id);
                        
                    ALTER TABLE answers 
                        ADD CONSTRAINT FK_ANSWERS_GAMES
                            FOREIGN KEY ("gameId") 
                            REFERENCES games (id);
                        
                        
                        
                    ALTER TABLE players 
                        ADD CONSTRAINT FK_PLAYERS_USERS
                            FOREIGN KEY ("userId") 
                            REFERENCES users (id);
                            
                          
                                                        
                            
                    ALTER TABLE games 
                        ADD CONSTRAINT FK_GAMES_FIRSTPLAYER
                            FOREIGN KEY ("firstPlayer") 
                            REFERENCES players (id);
                            
                    ALTER TABLE games 
                        ADD CONSTRAINT FK_GAMES_SECONDPLAYER
                            FOREIGN KEY ("secondPlayer") 
                            REFERENCES players (id);                        
      
      `);
    return "delete quiz data";
  }
}
