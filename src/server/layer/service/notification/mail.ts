import Nodemailer from 'nodemailer';
import { MailtrapTransport } from "mailtrap";
import { getHtmlTemplate } from '@/server/utils/mail';
import { MailtrapResponse } from 'mailtrap/dist/types/transport';
import Mailgun, { Interfaces, Enums } from 'mailgun.js';
import formData from 'form-data';
// const SibApiV3Sdk = require('sib-api-v3-sdk');




export const sendMail2 = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
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


const brevoapi = "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"



export const sendMail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
    const transporter = Nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,                   // TLS için 587
        secure: false,               // Güvenlik TLS üzerinden sağlanır
        auth: {
            user: '8165cc001@smtp-brevo.com', // SMTP kullanıcı adı
            pass: "XGBLF9pqaCkTW06m",     // SMTP şifreniz (API anahtarı olabilir)
        },
    });

    // E-posta içeriği
    const mailOptions = {
        from: 'ersindenim@gmail.com', // Gönderen
        to,                 // Alıcı
        subject: subject,           // Konu
        text: "TURK FATIH TUTAK",   // Mesaj metni
        html: html, // HTML mesajı
    };

    // E-postayı gönder
    const result = await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Hata oluştu:', error);
            }
            console.log('E-posta başarıyla gönderildi:', info.response);
            resolve(info)
        })
    })
    return result
}
