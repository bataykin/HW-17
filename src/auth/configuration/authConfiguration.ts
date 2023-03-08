import { registerAs } from "@nestjs/config";

export const getAuthConfiguration = registerAs('authorization', () => {
  return {
    type: process.env.AUTH_TYPE ?? 'OAUTH2',
  };
});

// export default registerAs ('authorization', () => {
//     return {
//         type: process.env.AUTH_TYPE ?? 'OAUTH2'
//     }
// })

export type AuthConfigType = {
  authorization: ReturnType<typeof getAuthConfiguration>;
};
