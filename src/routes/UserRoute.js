import express from 'express'
import UserController from '../controllers/UserController.js'

const router = express.Router()
router.post('/check-phone' , UserController.usersCheckPhone, async (req  ,res)=>{
res.json({
	"ok":true
})
})

router.post('/signup' , UserController.usersSignup, async (req  ,res)=>{
res.json({
	"ok":true
})
})
router.post('/login' , UserController.usersLogin, async (req  ,res)=>{
res.json({
	"ok":true
})
})


router.post('/validate-code' , UserController.validateCode , async(req,res)=>{
res.json({
	"ok":true
})
})

export default {
	path:'/users',
	router:router
} 