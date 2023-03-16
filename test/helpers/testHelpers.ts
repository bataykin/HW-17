import { LikesEnum } from "../../src/posts/entities/likes.enum";

export class TestHelpersClass {
  createRandomString = (length: number) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
      counter += 1;
    }
    return result;
  };

  createFakeUsers = (count: number) => {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        input: {
          login: this.createRandomString(8),
          password: this.createRandomString(8),
          email: this.createRandomString(4) + "@lala.com",
        },
        id: null,
        accessToken: null,
        refreshToken: null,
      });
    }
    return users;
  };

  createFakeBlogs = (count: number) => {
    const blogs = [];
    for (let i = 0; i < count; i++) {
      blogs.push({
        input: {
          name: this.createRandomString(8),
          description: this.createRandomString(20),
          websiteUrl: "https://" + this.createRandomString(8) + ".com",
        },
        id: null,
        createdAt: null,
      });
    }
    return blogs;
  };

  createFakePosts = (count: number) => {
    const posts = [];
    for (let i = 0; i < count; i++) {
      posts.push({
        input: {
          content: this.createRandomString(8),
          shortDescription: this.createRandomString(15),
          title: this.createRandomString(10),
        },
        id: null,
        blogId: null,
      });
    }
    return posts;
  };

  createFakeComments = (count: number) => {
    const comments = [];
    for (let i = 0; i < count; i++) {
      comments.push({
        input: {
          content: this.createRandomString(15),
        },
        id: null,
        postId: null,
        createdAt: null,
      });
    }
    return comments;
  };

  createFakeQuestions = (count: number) => {
    const questions = [];
    for (let i = 0; i < count; i++) {
      let answers = [];
      for (let j = 0; j < 5; j++) {
        answers.push(this.createRandomString(5));
      }
      questions.push({
        input: {
          body: this.createRandomString(15),
          correctAnswers: answers,
        },
        id: null,
      });
    }
    return questions;
  };

  createRandomAnswers = (count: number, question: any[]) => {
    const answers = [];
    for (let i = 0; i < question.length; i++) {
      answers.push({
        answer:
          question[i].input.correctAnswers[
            Math.floor(Math.random() * question[i].input.correctAnswers.length)
          ],
      });
    }
    return answers;
  };

  banReason = this.createRandomString(15);

  banUserDto = {
    isBanned: true,
    banReason: this.createRandomString(15),
    blogId: null,
  };

  unbanUserDto = {
    isBanned: false,
    banReason: this.createRandomString(15),
    blogId: null,
  };

  banBlogDto = {
    isBanned: true,
  };

  unbanBlogDto = {
    isBanned: false,
  };

  wrongUUID = "8f31bcb4-f776-4165-b98f-43d0e687a540";
  commentUpdateContentDto = {
    content: "commentUpdateContentDtocommentUpdateContentDto",
  };

  likeDto = {
    likeStatus: LikesEnum.Like,
  };

  dislikeDto = {
    likeStatus: LikesEnum.Dislike,
  };
}
