import joi from 'joi'

export default joi.object({
	name:joi.string()
	 .max(64)
	 .min(3)
	 .required()
	 .error(Error("Name is invalid")),
	phone:joi.string()
	 .pattern(/^9989[0123456789][0-9]{7}$/)
	 .required()
	 .error(Error("Phone is invalid")),
	bdate: joi.date()
	 .required()
	 .error(Error('Bdate is invalid')),
	gender: joi.string()
	 .required()
	 .min(1)
	 .max(2)
	 .error(Error('Gender is incorrect'))
})