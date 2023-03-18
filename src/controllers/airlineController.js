const Airline = require('../models/airline');
const async = require('async');
const clearImage = require('../helpers/clear-image');
const resourceNotFound = require('../helpers/resourceNotFound');
const  mongoose  = require('mongoose');

//GET ALL AIRLINES
exports.getAll = (req,res,next)=>{
    async.parallel([
        function(callback){
            Airline.countDocuments({userId : req.payload.userId},(err,count)=>{
                let totalAirlines = count;
                callback(err,totalAirlines);
            });
        },
        function(callback){
            Airline.find({userId : req.payload.userId})
                .exec((err,airlines)=>{
                    if(err) return next(err);
                    callback(err,airlines);
                });
        }
    ],function(err,result){
        if(err) return next(err);
        let totalAirlines = result[0];
        let airlines = result[1];
        res.status(200).json({
            statusCode : 200,
            message : "success",
            data : airlines,
            totalAirlines : totalAirlines 
        });
    });       
}

//POST AIRLINES
exports.CreateAirline = (req,res,next)=>{
    //if post is empty
    if (!req.file && !req.body) {
        const error = new Error("Body is Empty");
        error.statusCode = 422;
        return next(error);
    }
    const airline = new Airline({
        _id : new mongoose.Types.ObjectId(),
        islayover : req.body.islayover,
        layover : req.body.layover,
        dept_arr : req.body.dept_arr,
        baggage : req.body.baggage,
        airline : req.body.airline,
        meal_in_flight : req.body.meal_in_flight,
        isoutgoing : req.body.isoutgoing,
        userId : req.payload.userId
    })

    airline.save()
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
        const airline = await Airline.findById(req.params.id);
        if (!airline) {
            resourceNotFound(`no Airline found with ID = ${req.params.id}`);
        }
        res.status(200).json({
            statusCode : 200,
            message : "success",
            data: airline
        });
    } catch (err) {
        next(err);
    }
}

//DELETE BY ID
exports.delById = async (req,res,next)=>{
    try {
        const airline = await Airline.findById(req.params.id);
        if (!airline) {
            resourceNotFound(`No Airline Found with ID = ${req.params.id}`);
        }

        // if (airline.airlines_logo) {
        //     clearImage(airline.airlines_logo);
        // }
        const deletedAirline = await Airline.findByIdAndRemove(req.params.id);

        res.status(200).json({
            statusCode : 200,
            message: "Airline Deleted Successfully",
            data: deletedAirline
        });
    } catch (err) {
        next(err);
    }
}