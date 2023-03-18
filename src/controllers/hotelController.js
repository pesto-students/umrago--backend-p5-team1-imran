const Hotel = require('../models/hotel');
const async = require('async');
const clearImage = require('../helpers/clear-image');
const resourceNotFound = require('../helpers/resourceNotFound');
const  mongoose  = require('mongoose');

//GET ALL HOTELS
exports.getAll = (req,res,next)=>{
    async.parallel([
        function(callback){
            Hotel.countDocuments({},(err,count)=>{
                let totalHotels = count;
                callback(err,totalHotels);
            });
        },
        function(callback){
            Hotel.find({})
                .exec((err,hotels)=>{
                    if(err) return next(err);
                    callback(err,hotels);
                });
        }
    ],function(err,result){
        if(err) return next(err);
        let totalHotels = result[0];
        let hotels = result[1];
        res.status(200).json({
            statusCode : 200,
            message : "success",
            data : hotels,
            totalHotels : totalHotels
        });
    });       
}

exports.postHotel = (req,res,next) =>{
     //if post is empty
     if (!req.file && !req.body) {
        const error = new Error("Body is Empty");
        error.statusCode = 422;
        return next(error);
    }
    const hotel = new Hotel({
            _id : new mongoose.Types.ObjectId(),
            name : req.body.name,
            city : req.body.city,
            address : req.body.address,
            distance_between : req.body.distance_between,
            images : req.body.images,
            amenities  : req.body.amenities
        })
    // const hotel = new Hotel({
    //     _id : new mongoose.Types.ObjectId(),
    //     name : req.body.name,
    //     address : req.body.address,
    //     contact_number : req.body.contact_number,
    //     distance_between : req.body.distance_between,
    //     location : req.body.location,
    //     images : req.body.images,
    //     amenties : {
    //         ac : req.body.amenties.ac,
    //         card_payment : req.body.amenties.card_payment,
    //         checkIn_time : req.body.amenties.checkIn_time,
    //         elevator : req.body.amenties.elevator,
    //         wifi : req.body.amenties.wifi,
    //         daily_housekeeping : req.body.amenties.daily_housekeeping,
    //         parking_facility : req.body.amenties.parking_facility,
    //         handicap_support : req.body.amenties.handicap_support,
    //         power_backup : req.body.amenties.power_backup,
    //         geyser : req.body.amenties.geyser,
    //         fan : req.body.amenties.fan,
    //         tv : req.body.amenties.tv
    //     },
    //     room_types : {
    //         types : req.body.room_types.types,
    //         room : {
    //             available : req.body.room_types.room.available,
    //             price : req.body.room_types.room.price,
    //             child : {
    //                 child_type : req.body.room_types.room.child.child_type,
    //                 bed_required : req.body.room_types.room.child.bed_required,
    //                 price : req.body.room_types.room.child.price
    //             }
    //         }
    //     },
    //     travel_service : req.body.travel_service,
    //     hotel_policies : {
    //         booking : req.body.hotel_policies.booking,
    //         cancel : req.body.hotel_policies.cancel,
    //         refund : req.body.hotel_policies.refund
    //     },
    //     hotel_rating : {
    //         meal : req.body.hotel_rating.meal,
    //         travel : req.body.hotel_rating.travel,
    //         customer_support : req.body.hotel_rating.customer_support,
    //         other_services : req.body.hotel_rating.other_services
    //     },
    //     hotel_meals : req.body.hotel_meals
    // })

    hotel.save()
    .then(data =>{
        res.status(201).json({
            statusCode : 201,
            message : "Created Successfully",
            data : data
        });
    }).catch(err=>{
        next(err)
    });
}


//GET BY ID
exports.getById = async (req,res,next)=>{
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            resourceNotFound(`no Hotel found with ID = ${req.params.id}`);
        }
        res.status(200).json({
            statusCode : 200,
            message : "success",
            data: hotel
        });
    } catch (err) {
        next(err);
    }
}


//Del By ID
exports.delHotel = async (req,res,next) =>{
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            resourceNotFound(`No Hotel Found with ID = ${req.params.id}`);
        }
        const deletedHotel = await Hotel.findByIdAndRemove(req.params.id);

        res.status(200).json({
            statusCode : 200,
            message: "Hotel Deleted Successfully",
            data: deletedHotel
        });
    } catch (err) {
        next(err);
    }
}