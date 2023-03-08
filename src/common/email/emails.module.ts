import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EmailService } from "./email.service";
import { User, UserSchema } from "../../users/user.schema";
import { UsersModule } from "../../users/users.module";

@Module({
    imports: [
        UsersModule,
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}])
    ],

    controllers: [],


    providers: [
EmailService
        // {
        //     provide: getModelToken(User.name),
        //     useValue: userModel,
        // },
    ],
    exports:[EmailService]
})
export class EmailsModule {
}