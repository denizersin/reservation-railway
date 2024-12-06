import Nodemailer from 'nodemailer';
import { MailtrapTransport } from "mailtrap";
import { getHtmlTemplate } from '@/server/utils/mail';
import { MailtrapResponse } from 'mailtrap/dist/types/transport';
import Mailgun, { Interfaces, Enums } from 'mailgun.js';
import formData from 'form-data';
export const sendMail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
    console.log(to, subject, html)

    if (subject.includes('example')) {
        return {
            success: true,
            message_ids: []
        } as MailtrapResponse
    }

    console.log('sending....')

    const TOKEN = "078650cbe970b01e9e13d1c4f352d9dd";

    const transport = Nodemailer.createTransport(
        MailtrapTransport({
            token: TOKEN,
        })
    );

    const sender = {
        address: "hello@demomailtrap.com",
        name: "Mailtrap Test",
    };
    const recipients = [
        to,
    ];


    const result = await new Promise((resolve, reject) => transport
        .sendMail({
            from: sender,
            to: recipients,
            subject: subject,
            html: getHtmlTemplate(html),
            category: "Integration Test",

        }, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        }))

    return result


}


export const sendMail2 = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {


    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({username: 'api', key: '7164f0bbd9f42f37319f6a481393aeac-f55d7446-4923b5af'});
    
    mg.messages.create('sandbox049526f5440347c980e82ef20e33de60.mailgun.org', {
        from: `Excited User <mailgun@sandbox049526f5440347c980e82ef20e33de60.mailgun.org>`,
        to: ["ersindenim@gmail.com"],
        subject: "Hello",
        text: "Testing some Mailgun awesomeness!",
        html: "<h1>Testing some Mailgun awesomeness!</h1>"
    })
    .then(msg => console.log(msg)) // logs response data
    .catch(err => console.log(err.message)); // logs any error


}
