import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import fs from 'fs'
import path from 'path'
import morgan from 'morgan'
import config from './config.js'
import postgres from './modules/postgres.js'
import routes from './routes/routes.js'
async function main(){ 

let __dirname = path.resolve(path.dirname(''))

let db = await  postgres()

const app = express()

const server = http.createServer(app)
server.listen(80 , ()=>{console.log('HTTP server is ready')})

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(async (req,res,next)=>{
req.postgres = db
next()
})

routes(app)

}

main()

