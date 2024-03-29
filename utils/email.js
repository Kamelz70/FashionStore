const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.EMAIL_FROM;
    }
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //sendGrid transporter
            console.log('sending production mail');
            return nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 465,
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
        } else {
            return nodemailer.createTransport({
                // service:"Gmail",
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
        }
    }
    async send(template, subject) {
        const html = pug.renderFile(
            `${__dirname}/../views/email/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject,
            }
        );
        // Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html),
        };
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome To The Fashion Family');
    }
    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            `Your Password Reeset Token (valid for ${process.env.PASSWORD_RESET_EXPIRY_MINS} mins)`
        );
    }
};
