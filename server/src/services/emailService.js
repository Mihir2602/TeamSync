const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

// OAuth2 transporter creation
const createTransporter = async () => {
  console.log('🔧 Creating OAuth2 transporter...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    }
  });

  try {
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Transporter verification failed:', error.message);
    throw error;
  }
};

const renderTemplate = async (templateName, data) => {
  const templatePath = path.join(__dirname, `../../templates/${templateName}.ejs`);
  try {
    return await ejs.renderFile(templatePath, data);
  } catch (error) {
    console.error(`Error rendering ${templateName} template:`, error);
    
    // Fallback HTML templates
    if (templateName === 'verify-email') {
      return `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
              <h2 style="color: #007bff; margin-bottom: 20px;">Welcome to TeamSync!</h2>
              <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                Please verify your email address to complete your registration.
              </p>
              <a href="${data.verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `;
    } else if (templateName === 'reset-password') {
      return `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
              <h2 style="color: #dc3545; margin-bottom: 20px;">Password Reset Request</h2>
              <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
                Click the button below to reset your password. This link will expire in 1 hour.
              </p>
              <a href="${data.resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `;
    }
    
    throw new Error('Unknown template');
  }
};

const sendEmail = async (options) => {
  try {
    console.log('📧 Attempting to send email to:', options.to);
    const transporter = await createTransporter();
    const result = await transporter.sendMail(options);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendVerificationEmail = async (email, token) => {
  try {
    console.log('📧 Sending verification email to:', email);
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const html = await renderTemplate('verify-email', { verificationUrl });
    
    return await sendEmail({
      from: `"TeamSync" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address - TeamSync',
      html,
      priority: 'high'
    });
  } catch (error) {
    console.error('❌ Verification email error:', error.message);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    console.log('📧 Sending password reset email to:', email);
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const html = await renderTemplate('reset-password', { resetUrl });
    
    return await sendEmail({
      from: `"TeamSync" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - TeamSync',
      html,
      priority: 'high'
    });
  } catch (error) {
    console.error('❌ Password reset email error:', error.message);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};