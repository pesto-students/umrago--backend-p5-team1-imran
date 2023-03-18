const mongoose = require('mongoose');



//Traveller Schema
const travellerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    first_name : {
        type : String,
        required : true
    },
    last_name : {
        type : String,
        required : true
    },
    date_of_birth : {
        type : Date,
        required : true
    },
    gender : {
        type : String,
        required : true
    },
    nationality : {
        type : String,
        required : true
    },
    relationship_of_cotraveller : {
        type : String,
        required : true
    },
    front_of_passport : {
        type : String,
        required : true
    },
    back_of_passport : {
        type : String,
        required : true
    },
    passport_exp_date : {
        type : Date,
        required : true
    },
    passport_no : {
        type : String,
        required : true 
    },
    isActive : {
        type : Boolean,
        default : true
    }
});



module.exports = mongoose.model('Traveller', travellerSchema);