import {Module} from "@nestjs/common";
import {QuizController} from "./quiz.controller";
import {QuizSQLService} from "./quiz.SQL.service";
import {QuizSQLRepo} from "./quiz.SQL.repo";
import {AuthModule} from "../auth/auth.module";


@Module({
    imports: [AuthModule],

    controllers: [QuizController],

    providers: [QuizSQLService, QuizSQLRepo],

    exports: []
})
export class QuizModule {
}
