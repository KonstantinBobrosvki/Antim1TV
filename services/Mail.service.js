const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_NAME, // generated ethereal user
        pass: process.env.MAIL_PASSWORD // generated ethereal password
    }
});

class MailService {
    async SendMail(info) {
        if (!(info.to && info.subject && info.html)) {
            throw new Error('Грешка в пощата')
        }
       
        return transporter.sendMail({
            from: {

                name: 'Antim 1 TV 😌',
                address: process.env.MAIL_NAME

            }, // sender address
            to: info.to, // list of receivers
            subject: info.subject, // Subject line
            html: info.html, // html body
        });
    }

    async SendWelcomeMail({ to, username }) {
        //TODO: add here delete acount button
        const info = {
            to,
            subject: `Добре дошъл, ${username} в Antim1tv`,
            html: 'Прочети faq за да разбереш повече неща'
        }
        return this.SendMail(info);
    }

    async SendRestorePasswordmail({ to, name, link }) {
        const info = {
            to,
            subject: `Забравена парола, ${name}? `,
            html: `Дано не ти стане навик. Eто линк за нова парола (валиден 10 мин)
            <br> <a href=${link}>${link}</a>`
        }
        return this.SendMail(info);
    }
}

module.exports = new MailService();


