
import { env } from '@/env'
import { createServer } from 'http'
import next from 'next'
import { parse } from 'url'

console.log('2131232')
console.log(env.NODE_ENV, env.NODE_ENV_2, 'asd')
const port = parseInt('3000', 10)
const dev = env.NODE_ENV_2 !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

setTimeout(() => {

}, (1000));

app.prepare().then(async () => {


  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(port)


  console.log(
    `> Server listening at http://localhost:${port} as ${dev ? 'development' : env.NODE_ENV_2
    }`
  )
})

