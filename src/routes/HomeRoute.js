import express from 'express'

const router = express.Router()

router.get('/' , async (req  ,res)=>{
res.send("salom")
})

export default {
	path:'/',
	router:router
} 