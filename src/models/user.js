const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};


//User Schema
const UserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    method: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required : true
    },
    email: {
        type: String,
        lowercase: true,
        default : null
    },
    phonenumber: {
        type: String,
        default : null
    },
    password: {
        type: String,
        default : null
    },
    googleId: {
        type: String,
        default : null
    },
    googleToken: {
        type: String,
        default : null
    },
    photoUrl : {
        type : String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    date_of_birth : {
        type : Date,
        default : null
    },
    gender : {
        type : String,
        default : null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    hashedSalt : {
        type : String,
        default : null
    }

});


UserSchema.methods.isValidPassword = async function (password) {
    try {
      return await bcrypt.compare(password, this.password)
    } catch (error) {
      throw error
    }
  }
  

module.exports = mongoose.model('User', UserSchema);