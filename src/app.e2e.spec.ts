import { INestApplication } from "@nestjs/common";

// jest.setTimeout(20000)

describe('AppController (e2e)', () => {
  let app: INestApplication;
  it('/ (fake test)', () => {
    return undefined;
  });

  // beforeAll(async () => {
  //     const moduleFixture = await Test.createTestingModule({
  //         imports: [AppModule],
  //     }).compile();
  //
  //     app = moduleFixture.createNestApplication();
  //     await app.init();
  // });
  //
  // it('/ (GET)', () => {
  //     return request(app.getHttpServer())
  //         .get('/')
  //         .expect(200)
  //         .expect('Hello World!');
  // });
  //
  // it('/blogs (GET) provide object containing pagination data and items[]', async () => {
  //     const res = await request(app.getHttpServer())
  //         .get('/blogs')
  //
  //     // console.log(res.body)
  //     expect(res.body).toEqual(
  //         expect.objectContaining({
  //             // items: expect.arrayContaining(
  //             //     expect.objectContaining({
  //             //         id: expect.any(String),
  //             //         name: expect.any(String),
  //             //         websiteUrl: expect.any(String),
  //             //         createdAt: expect.any(Date)
  //             //     })
  //             // ),
  //             pagesCount: expect.any(Number),
  //             page: expect.any(Number),
  //             pageSize: expect.any(Number),
  //             totalCount: expect.any(Number),
  //         }))
  // })
});
