const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // If details are mock, print to console and return success
    if (process.env.EMAIL_USER === 'mock_email@example.com' || !process.env.EMAIL_USER) {
      console.log('---------------- MOCK EMAIL SENT ----------------');
      console.log(`To:      ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message:\n${options.message}`);
      console.log('-------------------------------------------------');
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const message = {
      from: `${process.env.FROM_NAME || 'EduLearn LMS'} <${process.env.FROM_EMAIL || 'noreply@edulearn.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || undefined
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (err) {
    console.error('Email could not be sent, logging contents below:');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Message:', options.message);
    return false;
  }
};

module.exports = sendEmail;
