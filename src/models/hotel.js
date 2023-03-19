const mongoose = require('mongoose')

const amenties = {
    ac : {
        type : Boolean
    },
    toiletries: {
        type : Boolean
    },
    room_service : {
        type : Boolean
    },
    gym: {
        type : Boolean
    },
    wifi: {
        type : Boolean
    },
    led_tv: {
        type : Boolean
    },
    free_laundry : {
        type : Boolean
    },
    paid_laundary : {
        type : Boolean
    },
    bus : {
        type : Boolean
    },
    cab : {
        type : Boolean
    },
    lounge : {
        type : Boolean
    } 
}
const child = [{
    child_type : {
        type : String,
        enum : ['Infant','Kid'],
        required : true
    },
    bed_required : {
        type : Boolean
    },
    price : {
        type : Number
    }
}]

const room = {
    available : {
        type : Boolean
    },
    price : {
        type : Number
    }
}

const room_type = [{
    types : {
        type: String,
        enum : ['dual','triple','quad','quint'],
        required : true
    },
    room : room
}]





const travel_service = {
    type : String,
    enum : ['Bus', 'Cab'],
    required : true
}


const policies = {
    booking : {
        type: String
    },
    cancel : {
        type: String
    },
    refund : {
        type: String
    }
}

// const meal = {

// }

const rating = {
    meal : {
        type: Number
    },
    travel : {
        type: Number
    },
    customer_support : {
        type: Number
    },
    other_services : {
        type: Number
    }
}


//MAIN SCHEMA
const hotelSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {
        type : String,
        required : true
    },
    city : {
        type : String
    },
    address : {
        type : String,
        required : true
    },
    distance_between : {
        type : String
    },
    images : {
        type:Array
    },
    amenities : amenties
})

module.exports = mongoose.model('Hotel',hotelSchema);