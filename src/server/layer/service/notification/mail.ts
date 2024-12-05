import Nodemailer from 'nodemailer';
import { MailtrapTransport } from "mailtrap";
import { getHtmlTemplate } from '@/server/utils/mail';
import { MailtrapResponse } from 'mailtrap/dist/types/transport';
export const sendMail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {


    if(subject.includes('example')){
        return {
            success:true,
            message_ids:[]
        } as MailtrapResponse
    }


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


    const result = await transport
        .sendMail({
            from: sender,
            to: recipients,
            subject: subject,
            html: getHtmlTemplate(html),
            category: "Integration Test",
        })

    return result


}


