import rn from 'random-number'
import phoneValidation from '../validations/phoneValidations.js'
import signupValidation from '../validations/signupValidations.js'
import codeValidation from '../validations/codeValidation.js'
import sendSms from '../modules/sms.js'
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

            await res.status(200).json({
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
    			}
    		})

            if(Number(code) !== Number(attempt.dataValues.code) ){
    	    await req.postgres.attempts.update({
    	        attempts:attempt.dataValues.attempts + 1
    	    	},{
    	    		where:{
                   id:validationID
    	    	}
    	    })
            }
console.log(attempt)
            if(Number(attempt.dataValues.attempts) >= 3){
            	await req.postgres.attempts.destroy({
            		where:{
            			id:validationID
            		}
            	})
            	throw  new Error('Validation code is incorrect')
            }
console.log(code)
    	} catch(e) {
    		res.status(401).json({
    			ok:false,
    			message: e+''
    		})
    	}
    }

}

export default UserController 