import joi from 'joi'

export default joi.object({
	code: joi.number()
	.required()
    .error(Error("Code is incorrect"))
    .min(100000)
    .max(999999)
})