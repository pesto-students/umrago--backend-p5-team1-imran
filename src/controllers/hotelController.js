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