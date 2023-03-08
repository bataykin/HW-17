import { Injectable } from "@nestjs/common";

import nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  constructor() {}

  async sendConfirmationOfRegistrationMail(email: string, code: string) {
    const msg = `<h1>Password recovery</h1>
        <p>To finish password registration please follow the link below:
            <a href='https://some-front.com/confirm-registration?code=${code}'>confirm registration</a>
        </p>`;

    const subject = "Registration on tiny nodemailer project, mail #";
    // const message = "https://some-front.com/confirm-registration?code=" + code
    return await this.sendEmail(email, subject, msg);
  }

  async resendRegistrationEmail(email: string, code: string) {
    const msg = `<h1>Password recovery</h1>
        <p>To resend  registration code please follow the link below:
            <a href='https://some-front.com/resending-registration?code=${code}'>resend registration code</a>
        </p>`;

    const subject =
      "NEW Attempting Registration on tiny nodemailer project, mail #";
    // const message = "https://some-front.com/resending-registration?code=" + code

    return await this.sendEmail(email, subject, msg);
  }

  async sendEmail(email: string, subject: string, message: string) {
    console.log("REAL sendEmail to " + email);
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bataykin@gmail.com",
        pass: "wbkxpcldxdregdne",
      },
    });

    let result = await transporter.sendMail({
      from: '"Serega" <bataykin@gmail.com>',
      to: email,
      subject: subject,
      html: message,
    });
  }
}
