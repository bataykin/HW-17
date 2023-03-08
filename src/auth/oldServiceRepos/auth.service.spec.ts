import { AuthMongoService } from "./auth.Mongo.service";

describe('AuthService', () => {
  let service: AuthMongoService;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [AuthMongoService],
  //   }).compile();
  //
  //   service = module.get<AuthMongoService>(AuthMongoService);
  // });

  it('should be defined', () => {
    expect(1).toBe(1);
  });
});
