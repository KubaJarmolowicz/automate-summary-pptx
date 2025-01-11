import sgMail from "@sendgrid/mail";

export class EmailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error("SENDGRID_API_KEY is not defined");
    sgMail.setApiKey(apiKey);
  }

  async sendPresentation(email: string, presentation: Buffer): Promise<void> {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_VERIFIED_EMAIL || "",
      subject: "Your Campaign Summary",
      text: "Please find your presentation attached.",
      attachments: [
        {
          content: presentation.toString("base64"),
          filename: "campaign-summary.pptx",
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          disposition: "attachment",
        },
      ],
    });
  }
}
