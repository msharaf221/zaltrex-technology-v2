import nodemailer from "nodemailer";

export async function sendNotificationEmail(subject: string, body: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_EMAIL;

  if (!host || !user || !pass || !to) return;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"Zaltrex System" <${user}>`,
      to,
      subject,
      text: body,
    });
  } catch (error) {
    console.error("[mailer] Email notification failed:", error);
  }
}
