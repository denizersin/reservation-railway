export const getHtmlTemplate = (html: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Your Email Title</title>
    </head>
    <body>
        ${html}
    </body>
    </html>
    `
}