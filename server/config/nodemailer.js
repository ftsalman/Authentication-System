
import nodemailer from "nodemailer";

let _transporter = null;

const getTransporter = () => {
  if (!_transporter) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP_USER or SMTP_PASS is missing in .env");
    }

    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return _transporter;
};

export const transporter = {
  sendMail(mailOptions) {
    return getTransporter().sendMail(mailOptions);
  },

  verify() {
    return getTransporter().verify();
  },
};
