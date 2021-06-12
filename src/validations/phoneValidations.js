import joi from 'joi'

export default joi.object({
	phone: joi.string()
	.pattern(/^9989[0123456789][0-9]{7}$/)
	.required()
    .error(Error("phone number is incorrect"))
})