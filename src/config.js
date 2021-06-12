import dotenv from 'dotenv'
dotenv.config()

const {env} = process
export default {
PG_CONNECTION_STRING: env.PG_CONNECTION_STRING
}