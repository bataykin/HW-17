import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AuthService } from "../authService";

export class AboutMeCommand {
    constructor(public readonly token: any) {
    }
}


@QueryHandler(AboutMeCommand)
export class AboutMeHandler implements IQueryHandler<AboutMeCommand>{
    constructor(private readonly authService:AuthService) {
    }
    async execute(query: AboutMeCommand): Promise<any> {
        const userId = await this.authService.getUserIdByToken(query.token)
        const retrievedUserFromToken = await this.authService.retrieveUser(query.token)
        return this.authService.aboutMe(retrievedUserFromToken.sub)
    }
}