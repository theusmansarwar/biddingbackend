const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net", // GoDaddy SMTP server
    port: 465, // Use 465 for SSL or 587 for TLS
    secure: true, // True for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER, // Your GoDaddy email
      pass: process.env.EMAIL_PASS, // Your GoDaddy email password
    },
  });

// ✅ Send confirmation email to user & admin
const sendEmailToCompany = async (name, email, res) => {
  // ✅ 1. Email to the Customer
  const customerMailOptions = {
    from: `"Moawin Auctions" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Bid Placed Successfully – Moawin Auctions",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <div style="background: #004aad; color: white; padding: 20px; text-align: center;">
            <h2>Bid Confirmation</h2>
          </div>
          <div style="padding: 20px;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for placing your bid on <strong>Moawin Auctions</strong>. Your bid has been received and recorded successfully.</p>
            <p> Stay tuned — we’ll update you shortly.</p>
            <p> Thank you for your support,</p>
            <p style="margin-top: 20px;">– The Moawin Team</p>
          </div>
          <div style="background: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #555;">
            © ${new Date().getFullYear()} Moawin Auctions. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  // ✅ 2. Email to the Admin
  const adminMailOptions = {
    from: `"Moawin Auctions" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL, // e.g. admin@moawin-usa.org
    subject: `New Bid Placed by ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <div style="background: #c0392b; color: white; padding: 20px; text-align: center;">
            <h2>New Bid Notification</h2>
          </div>
          <div style="padding: 20px;">
            <p>A new bid has been placed by:</p>
            <p><strong>${name}</strong></p>
          </div>
          <div style="background: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #555;">
            Automated email from Moawin Auctions
          </div>
        </div>
      </div>
    `,
  };

  // ✅ Send Emails Sequentially
  transporter.sendMail(customerMailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email to customer:", error);
      return res.status(500).json({ status: 500, message: "Error sending email to customer" });
    }

    transporter.sendMail(adminMailOptions, (adminError, adminInfo) => {
      if (adminError) {
        console.error("❌ Error sending email to admin:", adminError);
        return res.status(500).json({ status: 500, message: "Error sending email to admin" });
      }

      console.log("✅ Emails sent successfully");
      return res.status(200).json({ status: 200, message: "Emails sent successfully" });
    });
  });
};

module.exports = sendEmailToCompany;
