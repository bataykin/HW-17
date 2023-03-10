import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {
    // console.log("HttpExceptionFilter is created");
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exeptionResponse: any = exception.getResponse();

    const arr = exeptionResponse.message;

    console.log(arr.split(" ")[0]);
    const errorsMessages = [];
    if (Array.isArray(arr)) {
      for (let i = 0; i < arr.length; i++) {
        errorsMessages.push({
          message: arr[i],
          field: arr[i].split(" ")[0],
        });
      }
    } else
      errorsMessages.push({
        message: arr,
        field: arr?.split(" ")[0],
      });

    if (status === 400) {
      response.status(status).json({ errorsMessages });
    } else response.status(status).json(exeptionResponse.message);
  }
}

// console.log(status)
// console.log()

// const ctx = host.switchToHttp();
// const response = ctx.getResponse();
// const request = ctx.getRequest();
//
// const status =
//     exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.FORBIDDEN;
//
// const message =
//     typeof exception.message === 'string'
//         ? exception.message
//         : exception.message.message;
//
// const errorResponse = {
//     statusCode: status,
//     timestamp: new Date().toISOString(),
//     path: request.url,
//     message: message || 'Something went wrong',
// };

// const message = Array.isArray(exeptionResponse.message)
//   ? exeptionResponse.message[0]
//   : exeptionResponse.message;
// const field =
//   Array.isArray(exeptionResponse.message) && status !== 429
//     ? exeptionResponse.message[0].split(' ')[0]
//     : 'field';
// const errorsMessages = [];
// // console.log( exeptionResponse.message[0])
// let fieldName = '';
// if (Array.isArray(exeptionResponse.message || status !== 429)) {
//   for (const err of exeptionResponse.message) {
//     if (fieldName !== err[0]) {
//       fieldName = err[0];
//       errorsMessages.push({
//         message: err,
//         field: err.split(' ')[0],
//       });
//     } else continue;
//   }
// } else if (status !== 429 && status !== 400) {
//   errorsMessages.push({
//     message: exeptionResponse.message,
//     field: exeptionResponse.message.split(' ')[0],
//   });
// } else if (Array.isArray(exeptionResponse.message)) {
//   for (const err of exeptionResponse.message) {
//     if (fieldName !== err[0]) {
//       fieldName = err[0];
//       errorsMessages.push({
//         message: err,
//         field: err.split(' ')[0],
//       });
//     } else continue;
//   }
// } else if (status !== 429) {
//   errorsMessages.push({
//     message: exeptionResponse.message,
//     field: exeptionResponse.message.split(' ')[0],
//   });
// }
//
// if (status === 400) {
//   return response.status(status).json({
//     errorsMessages,
//   });
// } else if (status == 429) {
//   return response.status(status).json({
//     message: exeptionResponse,
//   });
// } else return response.status(status).json(exeptionResponse.message);

// response.status(status).json(exception);

// if (status === 500 /*|| process.env.environment !== 'production'*/) {
//     return response.status(status).json(exception);
// }else   if (status == 403 ) {
// const errorResponse = { errorsMessages: [] };
// const resp:any = exception.getResponse();
// // console.log(resp)
//
// errorResponse.errorsMessages.push(
//
//     { message: resp.message, field: resp.message?.split(' ')[0] })

// if (typeof  resp.message !== "string" ) {
//     resp.forEach((m) =>
//         errorResponse.errorsMessages.push({ message: m.message, field: m.message.split(' ')[0] }),
//     );
// } else {
//     errorResponse.errorsMessages.push({ message: resp.message, field: resp.message.split(' ')[0] })

// console.log(errorResponse.errorsMessages)

// const arrErr: any = exception.getResponse()

// return response.status(status).json({
//     message,
//     statusCode: status,
//     time: new Date().toISOString(),
// })
// return response.status(status).json(errorResponse);

// }else {
//
//     const errorResponse = { errorsMessages: [] };
//     const resp:any = exception.getResponse();
//
//
//     if (typeof  resp.message !== "string" ) {
//         resp.message.forEach((m) =>
//             errorResponse.errorsMessages.push({ message: m.message, field: m.message.split(' ')[0] }),
//         );
//     } else {
//         errorResponse.errorsMessages.push({ message: resp.message, field: resp.message.split(' ')[0] })
//     }

// return response
//     .status(status)
//     .json({
//         statusCode: status,
//         timestamp: new Date().toISOString(),
//         path: request.url,
//     });
//     } else return response.status(status).json(exception)
