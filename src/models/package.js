const mongoose = require('mongoose');

// const itinerary = [{
//     activity : {
//         type : Array
//     },
//     transfer_type : {

//     }
// }]


const policies = {
    cancellation : {type : String},
    date_change : {type : String}
}
   


const packageSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {
        type: String,
        required:true
    },
    dept_city : {
        type : String,
        required:true
    },
    dest_city : {
        type : String,
        required:true
    },
    airline : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airlines',
        required : true
    }],
    quint_price : {
        type : Number
    },
    dual_price : {
        type : Number
    },
    triple_price : {
        type : Number
    },
    quad_price : {
        type : Number
    },
    child_price_with_bed : {
        type : Number
    },
    child_price_without_bed : {
        type : Number
    },
    infant_price : {
        type : Number
    },
    discount : {
        type : Number
    },
    start_date : {
        type : String,
        required : true
    },
    end_date : {
        type : String,
        required : true
    },
    mrp: {
        type : Number
    },
    package_type : {
        type : String,
        enum : ['Economy','Premium','Luxury'],
        required : true
    },
    organizer : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'AdminProfile',
        required : true
    },
    itinerary : {
        type : Array
    },
    policies : policies,
    hotel : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Hotel',
        required : true
    }],
    booked : {
        type : Number
    },
    max : {
        type : Number
    },
    published : {
        type : Boolean,
        default : false
    },
    adminAuth : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Admin'
    },
    meals : {
        breakfast : {
            type : Boolean,
            default: false
        },
        lunch : {
            type : Boolean,
            default: false
        },
        dinner : {
            type : Boolean,
            default: false
        }
    },
    wishlist: [
        {
            type: new mongoose.Schema({
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                }
            })
        }
    ]
},{timestamps:true})



module.exports = mongoose.model('Package',packageSchema);