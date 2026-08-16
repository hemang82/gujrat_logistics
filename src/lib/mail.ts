import nodemailer from 'nodemailer';

interface SendLogisticEmailOptions {
  to: string;
  companyName: string;
  email: string;
  password?: string;
  phone: string;
  transporterId?: string;
  gstNumber?: string;
  action: 'create' | 'update';
}

export async function sendLogisticEmail({
  to,
  companyName,
  email,
  password,
  phone,
  transporterId,
  gstNumber,
  action,
}: SendLogisticEmailOptions) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;
  const fromName = process.env.SMTP_FROM_NAME || 'Trust Logistics Support';

  if (!host || !user || !pass || !fromEmail) {
    console.warn(
      'SMTP credentials are missing in .env.local. Skipping email delivery. ' +
        `Details for ${companyName} (${email}) are saved to DB.`
    );
    return { success: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const isCreate = action === 'create';
    const subject = isCreate
      ? `Welcome to Trust Logistics - ${companyName} Account Created`
      : `Trust Logistics - ${companyName} Account Updated`;

    // Professional HTML Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            border: 1px solid #eef2f6;
          }
          .header {
            background-color: #0F766E;
            padding: 30px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 30px;
          }
          .welcome-text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 25px;
          }
          .details-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 25px;
          }
          .details-title {
            font-size: 14px;
            font-weight: bold;
            color: #0F766E;
            text-transform: uppercase;
            margin-top: 0;
            margin-bottom: 15px;
            border-bottom: 2px solid #ccfbf1;
            padding-bottom: 8px;
          }
          .detail-row {
            display: flex;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .detail-label {
            width: 150px;
            font-weight: bold;
            color: #4a5568;
            flex-shrink: 0;
          }
          .detail-value {
            color: #1a202c;
            word-break: break-all;
          }
          .btn-container {
            text-align: center;
            margin: 30px 0 10px;
          }
          .btn {
            background-color: #0F766E;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            font-weight: bold;
            font-size: 15px;
            border-radius: 6px;
            display: inline-block;
            transition: background-color 0.2s;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Trust Logistics</h1>
          </div>
          <div class="content">
            <p class="welcome-text">
              Dear Partner,<br><br>
              ${
                isCreate
                  ? `Your logistics company account has been successfully registered on the Trust Logistics platform. Please find your login credentials and statutory details below.`
                  : `Your logistics company account details have been successfully updated on the Trust Logistics platform. Please find the updated information below.`
              }
            </p>
            
            <div class="details-card">
              <h2 class="details-title">Account Details</h2>
              <div class="detail-row">
                <span class="detail-label">Company Name:</span>
                <span class="detail-value">${companyName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Login Email:</span>
                <span class="detail-value">${email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Password:</span>
                <span class="detail-value" style="font-family: monospace; font-size: 15px; background: #eef2f6; padding: 2px 6px; border-radius: 4px;">
                  ${password ? password : '•••••••• (Unchanged)'}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone Number:</span>
                <span class="detail-value">${phone}</span>
              </div>
            </div>

            <div class="details-card">
              <h2 class="details-title">Statutory Details</h2>
              <div class="detail-row">
                <span class="detail-label">Transporter ID:</span>
                <span class="detail-value">${transporterId || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">GST Number:</span>
                <span class="detail-value">${gstNumber || 'N/A'}</span>
              </div>
            </div>

            <div class="btn-container">
              <a href="${process.env.SITE_URL || 'http://trustlogistic.in'}/admin/login" class="btn" target="_blank">Login to Portal</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Trust Logistics. All rights reserved.<br>
            If you did not request this, please contact support.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error occurred in sendLogisticEmail:', error);
    return { success: false, error };
  }
}
