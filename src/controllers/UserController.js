import rn from 'random-number'
import phoneValidation from '../validations/phoneValidations.js'
import signupValidation from '../validations/signupValidations.js'
import codeValidation from '../validations/codeValidation.js'
import sendSms from '../modules/sms.js'
import pkg from 'sequelize'
import moment from 'moment'
const {Op}  = pkg
class UserController{
	static async usersCheckPhone(req,res){
		try {
			const data = await phoneValidation.validateAsync(req.body)
			let user = await req.postgres.users.findOne({
				where:{
					phone: data.phone
				}
			})
			res.status(200).json({
				ok:true,
				exsist: user? true: false
			})

		} catch(e) {
			res.status(400).json({
				"ok":false,
				message: e+""
			})
		}
	}

	static async usersSignup(req,res){
		try {
			const data = await signupValidation.validateAsync(req.body)
			let user = await req.postgres.users.create({
				name: data.name,
				bdate:data.bdate,
				phone:data.phone,
				gender:data.gender == '1' ? "female" : "male"
			})
			res.status(200).json({
				ok:true,
				message: "Sucessfully registred",
				data: user.dataValues
			})
		} catch(e) {
			if(e == `SequelizeUniqueConstraintError: повторяющееся значение ключа нарушает ограничение уникальности \"users_phone_key\"`){
				e= "Phone Number is already exsist"
			}
			res.status(400).json({
				"ok":false,
				message: e+""
			})
		}
	}

	static async usersLogin(req,res){
		try {
			let data = await phoneValidation.validateAsync(req.body)
			const user = await req.postgres.users.findOne({
				where:{
					phone: data.phone
				}
			})

			if(!user){
				throw Error("User not found!")
			}
            
			const ban = await req.postgres.ban_model.findOne({
				where:{
					user_id: user.dataValues.user_id,
					expireDate: {
						[Op.gt]: new Date()
					}
				}
			})

			console.log(ban)
			
			if(ban) throw  new Error(`You are banned untill ${moment(ban.dataValues.expireDate)}`)

				let gen = rn.generator({
					min:  100000,
					max:  999999,
					integer: true
				})

			await req.postgres.attempts.destroy({
				where:{
					user_id: user.user_id
				}
			})
			let attempts = await req.postgres.attempts.create({
				code: gen(),
				user_id: user.user_id
			})
            // await sendSms(data.phone , `Your code: ${attempts.dataValues.code}`)
            console.log(attempts.dataValues.code)

            await res.status(201).json({
            	ok:true,
            	message:"Code successfully send",
            	id: attempts.dataValues.id
            })

        } catch(e) {
        	res.status(401).json({
        		ok:false,
        		message: e + ""
        	})
        }
    }

    static async validateCode(req,res) {
    	try {

    		let validationID = req.headers["code-validation-id"]
    		const {code} = await codeValidation.validateAsync(req.body)
    		
    		if(!validationID){
    			throw Error('Invalid validation token')
    		}
    		const attempt = await req.postgres.attempts.findOne({
    			where:{
    				id:validationID
    			},
    			include: {
    				model: req.postgres.users,
    				as: "user",
    				attributes: ["user_attempts"]
    			}
    		})
    		if(!attempt) throw new Error('Validation code is not found')
    			console.log(attempt.dataValues.attempts , attempt.dataValues.user.dataValues.user_attempts)

    		if(Number(code) !== Number(attempt.dataValues.code) ){
    			await req.postgres.attempts.update({
    				attempts:attempt.dataValues.attempts + 1
    			},{
    				where:{
    					id:validationID
    				}
    			})

    			if(Number(attempt.dataValues.attempts) > 3){
    				await req.postgres.attempts.destroy({
    					where:{
    						id:validationID
    					}
    				})
    				await req.postgres.users.update({
    					user_attempts: attempt.dataValues.user.dataValues.user_attempts + 1
    				},{
    					where:{
    						user_id: attempt.dataValues.user_id
    					}
    				})

    				if(Number(attempt.dataValues.user.dataValues.user_attempts) >= 3){
    					await req.postgres.users.update({
    						user_attempts: 0
    					},{
    						where:{
    							user_id: attempt.dataValues.user_id
    						}
    					})
    					await req.postgres.ban_model.create({
    						user_id: attempt.DataValues.user_id,
    						expireDate: new Date(Date.now() + 7200000)
    					})
    				}
    			}
    			throw  new Error('Validation code is incorrect')
    		}

    	} catch(e) {
    		res.status(401).json({
    			ok:false,
    			message: e+''
    		})
    	}
    }

}

export default UserController 