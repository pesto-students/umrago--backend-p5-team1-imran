const mongoose = require('mongoose');



//Admin Schema
const profileSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    admin : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Admin'
    },
    company_logo : {
        type : String
    },
    company_name : {
        type : String,
        required : true
    },
    address : {
        type : String
    }
});



module.exports = mongoose.model('AdminProfile', profileSchema);