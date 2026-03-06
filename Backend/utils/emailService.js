import nodemailer from "nodemailer";

// This creates the "Postman" using your Gmail account
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // Your gmail: e.g. chidera@gmail.com
    pass: process.env.EMAIL_PASS  // YOUR 16-CHARACTER APP PASSWORD
  }
});

/**
 * Sends a 4-digit OTP to the user
 * @param {string} userEmail - Recipient's email
 * @param {string} userName - User's name for the greeting
 * @param {string} otpCode - The 4-digit code generated in your controller
 */
 const sendVerificationEmail = async (userEmail, userName, otpCode) => {
  const mailOptions = {
    from: `"KKB Kitchen" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "🍳 Your KKB Kitchen Verification Code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
        <h2 style="color: #f97316; text-align: center;">Welcome Chef ${userName}!</h2>
        <p style="text-align: center; color: #666;">Use the code below to verify your email and join the community.</p>
        <div style="background: #fff7ed; padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
          <h1 style="color: #f97316; letter-spacing: 10px; font-size: 40px; margin: 0;">${otpCode}</h1>
        </div>
        <p style="font-size: 12px; color: #999; text-align: center;">This code expires in 10 minutes. Happy cooking!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    return false;
  }
};

export { sendVerificationEmail };