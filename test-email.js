<<<<<<< HEAD
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('Testing with:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '(hidden)' : 'NOT SET');
    console.log('');

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Test Email',
      text: 'If you see this, email is working!',
    });

    console.log('✓ Email sent successfully!');
    console.log(result);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testEmail();
=======
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('Testing with:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '(hidden)' : 'NOT SET');
    console.log('');

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: 'Test Email',
      text: 'If you see this, email is working!',
    });

    console.log('✓ Email sent successfully!');
    console.log(result);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testEmail();
>>>>>>> 478644174306fadc4f2a716ac6a04f42362c7c09
