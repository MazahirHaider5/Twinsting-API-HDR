import nodemailer from "nodemailer";
import logger from "../config/logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_SENDER_NAME,
    pass: process.env.MAIL_SENDER_PASS
  }
});

export async function sendMail(email: string, subject: string, body: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Twinsting" <${process.env.MAIL_SENDER_NAME}>`,
      to: email,
      subject: subject,
      text: body
    });
    logger.info("Email sent: ", info.response);
  } catch (error) {
    logger.error("Error sending email: ", error);
  }
}
