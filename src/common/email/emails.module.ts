import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { UsersModule } from "../../users/users.module";

@Module({
  imports: [UsersModule],

  controllers: [],

  providers: [
    EmailService,
    // {
    //     provide: getModelToken(User.name),
    //     useValue: userModel,
    // },
  ],
  exports: [EmailService],
})
export class EmailsModule {}
