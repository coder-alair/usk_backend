const nodemailer = require("nodemailer");
const sendinBlueTransport = require("nodemailer-sendinblue-transport");
const transporter = nodemailer.createTransport(
    new sendinBlueTransport({
        apiKey: process.env.BREVO_KEY
    })
);

async function sendCredentialsEmail({ toEmail, toName, email, phone, password }) {
    let msg = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Welcome to IDSA,</h2>
            <p>Here are your login credentials:</p>
            <table style="margin-top: 20px;">
              <tr>
                <td><strong>Email:</strong></td>
                <td>${email}</td>
              </tr>
              <tr>
                <td><strong>Phone:</strong></td>
                <td>${phone}</td>
              </tr>
              <tr>
                <td><strong>Password:</strong></td>
                <td>${password}</td>
              </tr>
            </table>
            <p style="color: #888;">If you have any issues, reply to this email or contact support.</p>
          </div>
        </body>
      </html>
    `;
    try {
        sendMail(toEmail, 'Your Account Credentials', msg);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

async function sendMail(receiver, subject, msg) {
    try {
        const mailOptions = {
            from: "sonkum236@gmail.com",
            to: receiver,
            subject: subject,
            html: msg,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {

        console.error("Error sending email: " + error);
    }
}

module.exports = { sendCredentialsEmail };
