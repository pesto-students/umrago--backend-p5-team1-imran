const mongoose = require('mongoose');
//DEPARTURE & ARRIVAL SCHEMA
const dept_arr = {
    dept_city : {
        type : String
    },
    arr_city : {
        type : String
    },
    dept_time : {
        type : String
    },
    arr_time : {
        type : String
    }
}

//BAGGAGE SCHEMA
const baggage = {
    cabin :{
        type : Number,
        required:true
    },
    checkin : {
        type: Number,
        required:true
    }
}

//AIRLINE SCHEMA
const airline = {
    name : {
        type : String,
        required:true
    },
    flight_number:{
        type :String
    },
    airlines_logo : {
        type : String,
    },
    travel_class : {
        type : String
    }
}


//MAIN SCHEMA
const airlineSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    islayover : {
        type:Boolean
    },
    layover : [{
        dept_city : {
            type : String
        },
        arr_city : {
            type : String
        },
        dept_time : {
            type : String
        },
        arr_time : {
            type : String
        },
        airline_name : {
            type : String
        },
        flight_number : {
            type : String
        },
        meal_in_flight : {
            type : Boolean,
            required : true
        },
        airlines_logo : {
            type : String,
        }
    }],
    dept_arr : dept_arr,
    baggage : baggage,
    airline : airline,
    meal_in_flight : {
        type : Boolean,
        required : true
    },
    isoutgoing : {
        type : Boolean,
        required : true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    }
})

module.exports = mongoose.model('Airlines', airlineSchema);