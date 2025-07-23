import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendInviteEmail = async ({ email, projectName, inviterName, token, message }) => {
  try {
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invitation to join ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">You're invited to collaborate!</h2>
          <p><strong>${inviterName}</strong> has invited you to join the project <strong>${projectName}</strong>.</p>
          
          ${message ? `<p><em>"${message}"</em></p>` : ''}
          
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">
            If you can't click the button, copy and paste this link into your browser:<br>
            <a href="${inviteUrl}">${inviteUrl}</a>
          </p>
          
          <p style="color: #6B7280; font-size: 14px;">
            This invitation will expire in 7 days.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent successfully');
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
};

export const sendTaskNotificationEmail = async ({ email, taskTitle, projectName, action }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Task ${action}: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Task Update</h2>
          <p>A task has been <strong>${action}</strong> in project <strong>${projectName}</strong>.</p>
          
          <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0; color: #374151;">${taskTitle}</h3>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">
            Log in to your account to view the details.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending task notification email:', error);
  }
};