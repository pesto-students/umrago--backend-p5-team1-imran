const Joi = require('@hapi/joi')

const authSchema = Joi.object({
  name : Joi.string(),
  email: Joi.string().email().lowercase(),
  // password: Joi.string().min(2),
  phonenumber : Joi.string(),
  code : Joi.number()
})

const resetPassword = Joi.object({
  phonenumber : Joi.string(),
  password: Joi.string(),
  code : Joi.number()
})



module.exports = {
  authSchema,resetPassword
}
