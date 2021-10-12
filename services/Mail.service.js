const nodemailer = require('nodemailer');

//TODO: CHANGE TO NORMAL MAIL IN ENV FILE, NOT PERSONAL.
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure:true,
    auth: {
        user: process.env.MAIL_NAME, // generated ethereal user
        pass: process.env.MAIL_PASSWORD // generated ethereal password
    }
});

class MailService {
    async SendMail(info) {
        if (!(info.to && info.text && info.subject && info.html)) {
            throw new Error('Грешка в пощата')
        }
        console.log(`<${process.env.MAIL_NAME}>`);
        return transporter.sendMail({
            from:{
                
                    name: 'Antim 1 TV 😌',
                    address: process.env.MAIL_NAME+'@yandex.ru'
                
            }, // sender address
            to: info.to, // list of receivers
            subject: info.subject, // Subject line
            text: info.text, // plain text body
            html: info.html, // html body
        });
    }

    async SendWelcomeMail({ to, username }) {
        //TODO: add here delete acount button
        const info = {
            to,
            subject: `Добре дошъл, ${username} в Antim1tv`,
            text: 'Прочети faq за да разбереш повече неща',
            html: ''
        }
        return this.SendMail(info);
    }

    async SendRestorePasswordmail({to, name, link}) {
        const info = {
            to,
            subject: `Забравена парола, ${name}? `,
            text: 'Дано не ти стане навик. Eто линк за нова парола (валиден 10 мин)',
            html:`<br> <a href=${link}>${link}</a>`
        }
        return this.SendMail(info);
    }
}

module.exports = new MailService();


