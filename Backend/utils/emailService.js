import { BrevoClient } from "@getbrevo/brevo";

// 1. Initialize the client (The way you found in the docs!)
const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

/**
 * Sends a 4-digit OTP via the new Brevo v4 Client
 */
const sendVerificationEmail = async (userEmail, userName, otpCode) => {
  try {
    // 2. Send the email using the new simple syntax
    await client.transactionalEmails.sendTransacEmail({
      subject: "🍳 Your KKB Kitchen Verification Code",
      sender: {
        name: "KKB Kitchen",
        email: process.env.EMAIL_USER,
      },
      to: [
        {
          email: userEmail,
          name: userName,
        },
      ],
      htmlContent: `
                <div style="font-family: sans-serif; max-width: 400px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
                    <h2 style="color: #f97316; text-align: center;">Welcome Chef ${userName}!</h2>
                    <p style="text-align: center; color: #666;">Use the code below to verify your email.</p>
                    <div style="background: #fff7ed; padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #f97316; letter-spacing: 10px; font-size: 40px; margin: 0;">${otpCode}</h1>
                    </div>
                    <p style="font-size: 12px; color: #999; text-align: center;">This code expires in 10 minutes. Happy cooking!</p>
                </div>
            `,
    });

    console.log(`✅ Brevo v4: Email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Brevo v4 Error:", error);
    return false;
  }
};

export { sendVerificationEmail };
