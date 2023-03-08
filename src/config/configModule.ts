import { ConfigModule } from "@nestjs/config";
import { getConfiguration } from "./configuration";


// let envFilePath = '.env'
// switch (process.env.NODE_ENV) {
//     case 'production':
//         envFilePath = 'env.production'
//         break;
//     case 'testing':
//         envFilePath = 'env.testing'
//         break;
// }

const environment = process.env.NODE_ENV || 'development'

export const configModule = ConfigModule.forRoot({
    envFilePath: [`.env.${environment}`,'.env.local', '.env'],
    isGlobal: true,
    ignoreEnvFile: false,
    load: [getConfiguration],

    // validationSchema: Joi.object({
    //     NODE_ENV: Joi.string()
    //         .valid('development', 'production', 'test', 'provision', 'staging')
    //         .default('development'),
    //     PORT: Joi.number().default(3000),
    //     MONGO_URI: Joi.string().uri().required(),
    //     // LALA: Joi.string().required()
    // }),

    validationOptions:{
        allowUnknown: true
    },
    expandVariables: true
});
