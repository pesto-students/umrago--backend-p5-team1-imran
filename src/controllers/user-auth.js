const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/user');
const config = require('../../config');
const client = require('twilio')(config.ACCOUNT_SID, config.AUTH_TOKEN);
const clientredis = require('../helpers/init_redis')
const createError = require('http-errors');
const nodemailer = require('nodemailer');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper');
const { authSchema, resetPassword } = require('../helpers/validation_schema')
const fast2sms = require('fast-two-sms');


exports.checkPhoneNumber = async (req, res, next) => {
  let user = await User.findOne({ phonenumber: req.params.phonenumber });
  let phoneExist = false;
  if (user) {
    phoneExist = true;
  }
  res.status(200).json({ phoneExist: phoneExist });
}

exports.sendOtp = async (req, res, next) => {
  await client
    .verify
    .services(config.SERVICE_ID)
    .verifications
    .create({
      to: `+91${req.params.phonenumber}`,
      channel: "sms"
    }).then(data => {
      res.status(200).json({
        statusCode: 200,
        message: "VERIFICATION SEND SUCCESSFULLY",
        data
      });
    }).catch(err => {
      next(err)
    });
}



exports.verifyOtp = (req, res, next) => {
  if (req.query.phonenumber && (req.query.code).length === 6) {
    client
      .verify
      .services(config.SERVICE_ID)
      .verificationChecks
      .create({
        to: `+91${req.query.phonenumber}`,
        code: req.query.code
      })
      .then(data => {
        if (data.status === "approved") {
          res.status(200).json({
            statusCode: 200,
            message: "USER IS VERIFIED!!",
            data
          })
        } else throw createError.NotAcceptable('Enter Correct Otp');
      }).catch(err => {
        next(createError.NotFound('OTP EXPIRED PLEASE SEND OTP AGIAN'))
      });
  } else {
    res.status(400).json({
      statusCode: 400,
      message: "WRONG PHONENUMBER OR CODE :(",
      phonenumber: req.query.phonenumber,
      code: req.query.code
    })
  }
}

exports.verifyotp = (req,res,next) => {
  clientredis.GET(req.query.phonenumber,(err,result)=>{
    if(err){
      console.log(err.message)
      next(createError.NotFound('OTP EXPIRED PLEASE SEND OTP AGIAN'));
    }
    console.log(result)
    if(result != null){
      if(result == req.query.code){
        res.status(200).json({
          statusCode: 200,
          message: "USER IS VERIFIED!!"
        })
      }else {
        next(createError.NotAcceptable('Enter Correct Otp'))
      }
    }else next(createError.NotFound('OTP EXPIRED PLEASE SEND OTP AGIAN'))
    
  });
}



exports.login = async (req, res, next) => {
  try {
    let result;
    const passObj = {
      phonenumber: req.body.phonenumber,
      password: req.body.password
    }
    const codeObj = {
      phonenumber: req.body.phonenumber,
      code: req.body.code
    }
    passObj.password != '' && passObj.password != null ?
      result = await authSchema.validateAsync(passObj) :
      result = await authSchema.validateAsync(codeObj)

    console.log(req.body)
    console.log(result)
    const user = await User.findOne({ phonenumber: result.phonenumber })
    const userData = await User.find({ phonenumber: result.phonenumber });
    if (!user) throw createError.NotFound('USER NOT REGISTERED')
    if (result.code) {
      // client
      //   .verify
      //   .services(config.SERVICE_ID)
      //   .verificationChecks
      //   .create({
      //     to: `+91${result.phonenumber}`,
      //     code: result.code
      //   })
      //   .then(data => {
      //     if (data.status === "approved") {
      //       token(user.id);
      //     }
      //   }).catch(err => {
      //     next(createError.NotAcceptable('OTP EXPIRED PLEASE SEND OTP AGIAN'))
      //   });
      clientredis.GET(result.phonenumber,(err,resp)=>{
        if(err){
          next(err.message);
        }
        if(resp == result.code){
          token(user.id);
        }else{
          next(createError.NotAcceptable('OTP EXPIRED PLEASE SEND OTP AGIAN'))
        }
      })
    } else {
      const isMatch = await user.isValidPassword(result.password)
      if (!isMatch)
        throw createError.Unauthorized('USERNAME/PASSWORD NOT VALID')
      token(user.id);
    }
    async function token(userId) {
      const accessToken = await signAccessToken(userId)
      const refreshToken = await signRefreshToken(userId)
      const myquery = { _id: userId };
      const newvalue = { $set: { refreshToken: refreshToken } };
      User.updateOne(myquery, newvalue).then(console.log("Saved Token"))
      res.status(200).json({
        statusCode: 200,
        message: "Login Success",
        data: {
          user: userData[0]
        },
        tokens: {
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });
    }
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest('INVALID USERNAME/PASSWORD'))
    next(error)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const result = await resetPassword.validateAsync(req.body);
    const doesExist = await User.findOne({ phonenumber: result.phonenumber });

    if (!doesExist) throw createError.NotFound('USER NOT REGISTERED')

    if (result) {
      // client
      //   .verify
      //   .services(config.SERVICE_ID)
      //   .verificationChecks
      //   .create({
      //     to: `+91${result.phonenumber}`,
      //     code: result.code
      //   })
      //   .then(data => {
      //     if (data.status === "approved") {
      //       resetpw(result.phonenumber);
      //     }
      //   }).catch(err => {
      //     next(createError.NotAcceptable('OTP EXPIRED PLEASE SEND OTP AGIAN'))
      //   });
      clientredis.GET(result.phonenumber,(err,result)=>{
        if(err){
          console.log(err.message)
          next(createError.NotFound('OTP EXPIRED PLEASE SEND OTP AGIAN'));
        }
        console.log(result)
        if(result != null){
          if(result == result.code){
            resetpw(result.phonenumber);
          }else {
            next(createError.NotAcceptable('Enter Correct Otp'))
          }
        }else next(createError.NotFound('OTP EXPIRED PLEASE SEND OTP AGIAN'))
        
      });
    }

    async function resetpw(phonenumber) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      const myquery = { phonenumber: phonenumber };
      const newvalue = { $set: { password: hashedPassword, hashedSalt: salt } };
      User.updateOne(myquery, newvalue).then(data => {
        res.status(200).json({
          statusCode: 200,
          message: "Password Changed",
          data: data
        });
        console.log('changed')
      })

    }

  }
  catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest('INVALID PHONENUMBER/CODE'))
    next(error)
  }
}

exports.socialLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const userData = await User.find({ email: req.body.email });
    // check of email found
    if (user) {
      const accessToken = await signAccessToken(user.id)
      const refreshToken = await signRefreshToken(user.id) // Generate JWT
      res.status(200).json({
        statusCode: 200,
        message: "Login Success",
        data: {
          user: userData[0]
        },
        tokens: {
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });
    } else {
      const user = new User({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        method: 'Google',
        googleId: req.body.googleId,
        googleToken: req.body.googleToken,
        photoUrl: req.body.photoUrl,
        email: req.body.email,
        isEmailVerified: true
      });
      const newUser = await user.save();
      console.log(newUser)
      const accessToken = await signAccessToken(newUser.id)
      const refreshToken = await signRefreshToken(newUser.id)  // Generate JWT
      const myquery = { _id: newUser._id };
      const newvalue = { $set: { refreshToken: refreshToken } };
      User.updateOne(myquery, newvalue).then(console.log("Token Saved"))
      res.status(200).json({
        statusCode: 200,
        message: "Login Success",
        data: {
          user: newUser
        },
        tokens: {
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });
    }
  } catch (err) {
    next(err)
  };
}


exports.signup = async (req, res, next) => {
  let hashedPassword;
  try {
    const result = await authSchema.validateAsync(req.body)
    const doesExist = await User.findOne({ phonenumber: result.phonenumber })
    if (doesExist)
      throw createError.Conflict(`${result.phonenumber} is already been registered`)
    const salt = await bcrypt.genSalt(12);
    if(req.body.password){
     hashedPassword = await bcrypt.hash(req.body.password, salt);
    }else{
      hashedPassword = null;
    }
    
    const user = new User({
      _id: mongoose.Types.ObjectId(),
      name: req.body.name,
      method: 'Local',
      phonenumber: req.body.phonenumber,
      isPhoneVerified: true,
      photoUrl: "",
      password: hashedPassword,
      hashedSalt: salt
    });
    const savedUser = await user.save()
    const accessToken = await signAccessToken(savedUser.id)
    const refreshToken = await signRefreshToken(savedUser.id)
    const myquery = { _id: savedUser._id };
    const newvalue = { $set: { refreshToken: refreshToken } };
    User.updateOne(myquery, newvalue).then(console.log("Token Saved"))
    res.status(200).json({
      statusCode: 200,
      message: "Signup Successful",
      data: {
        user: savedUser
      },
      tokens: {
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 422
    next(error)
  }
}


exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refreshToken)
    const accessToken = await signAccessToken(userId)
    const refToken = await signRefreshToken(userId)
    const myquery = { _id: userId };
    const newvalue = { $set: { refreshtoken: refToken } };
    User.updateOne(myquery, newvalue).then(console.log("Token Saved"))
    res.status(200).json({ statusCode: 200, message: "Token Issued", tokens: { accessToken: accessToken, refreshToken: refToken } })
  } catch (error) {
    next(error)
  }
}

exports.sendEmail = (req, res, next) => {
  let mailOtp = Math.floor(1000 + Math.random() * 9000);

  console.log(mailOtp)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  })

  let mailOptions = {
    from: 'umragopvt@gmail.com',
    to: req.params.email,
    subject: 'Verification',
    text: 'YEAH'
  }

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log(err)
      res.json({
        error: err
      })
    }
    else {
      console.log(data)
    }
  })



}

exports.sendotp = async (req, res, next) => {
  async function fasttwosms(number, otp) {
    let resp = await fast2sms.sendMessage({
      authorization: process.env.API_KEY_FAST2SMS,
      message: "Your One-Time Password (OTP) is " + otp + " for UMRAGO. Please do not share this password with anyone",
      numbers: [number]
    })
    console.log(resp)
  }
  clientredis.GET(req.params.phonenumber, (err, result) => {
    if (err) {
      console.log(err.message)
      next(err.message);
    }
    if (result) {
      console.log(result)
      fasttwosms(req.params.phonenumber, result);
      res.status(200).json({
        statusCode: 200,
        message: "VERIFICATION SEND SUCCESSFULLY"
      });
    }
    else {
      let Otp = Math.floor(100000 + Math.random() * 900000);
      clientredis.SET(req.params.phonenumber, Otp, 'EX', 60, async (err, reply) => {
        if (err) {
          console.log(err.message)
          next(err.message)
        } else {
          fasttwosms(req.params.phonenumber, Otp);
          res.status(200).json({
            statusCode: 200,
            message: "VERIFICATION SEND SUCCESSFULLY"
          });
        }
      })
    }
  })
}

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw createError.BadRequest()
    const userId = await verifyRefreshToken(refreshToken)
    clientredis.DEL(userId, (err, val) => {
      if (err) {
        console.log(err.message)
        throw createError.InternalServerError()
      }
      console.log(val)
      res.status(200).json({
        statusCode: 200,
        message: "Logout success"
      })
    })
  } catch (error) {
    next(error)
  }
}