import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";

export class SayHelloCommand {
    constructor(
        public readonly name: string
    ) {

    }
}

@CommandHandler(SayHelloCommand)
export class SayHelloHandler implements ICommandHandler<SayHelloCommand>{
    execute(command: SayHelloCommand): Promise<any> {
        const {name} = command
        const res = `Hello, ${name}`
        return Promise.resolve(res);
    }


}