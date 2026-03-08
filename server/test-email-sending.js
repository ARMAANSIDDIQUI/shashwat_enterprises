const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "gozoomtechnologies@gmail.com",
        pass: "qwuyqyxwiystcbhf",
    },
});

const testEmail = 'anuragpal07015@gmail.com';

const fs = require('fs');
const logFile = 'test_email_results.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function sendTestEmail() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    log(`Sending test email to ${testEmail}...`);
    try {
        const info = await transporter.sendMail({
            from: '"Shashwat Enterprises Test" <gozoomtechnologies@gmail.com>',
            to: testEmail,
            subject: "Test Email from Shashwat Enterprises",
            text: "This is a test email to verify that the email notification system is working correctly for your account.",
            html: "<h1>Test Email</h1><p>This is a test email to verify that the email notification system is working correctly for your account.</p>",
        });
        log(`Message sent: ${info.messageId}`);
        log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
        log(`Error sending test email: ${error.message}`);
    } finally {
        log('Done.');
        process.exit(0);
    }
}

sendTestEmail();
