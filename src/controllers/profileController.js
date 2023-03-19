const mongoose = require('mongoose');
const AdminProfile = require('../models/profile');
const createError = require('http-errors');
const Package = require('../models/package');
const async = require('async');
const Admin = require('../models/admin');
exports.postProfile = (req,res,next) =>{
      //if post is empty
      if (!req.file && !req.body) {
        const error = new Error("Body is Empty");
        error.statusCode = 422;
        return next(error);
    }
    const adminProfile = new AdminProfile({
        _id : new mongoose.Types.ObjectId(),
        admin : req.payload.userId,
        company_logo : req.body.company_logo,
        company_name : req.body.company_name,
        address : req.body.address
    })

    adminProfile.save()
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

exports.getProfile = async (req,res,next) =>{
    try {
        const profile = await AdminProfile.find({admin : req.payload.userId});
        const admin = await Admin.findById(req.payload.userId);
        const package = await Package.countDocuments({adminAuth : mongoose.Types.ObjectId(req.payload.userId)});
        const unpublished = await Package.countDocuments({adminAuth : mongoose.Types.ObjectId(req.payload.userId),published: false});
        const published = await Package.countDocuments({adminAuth : mongoose.Types.ObjectId(req.payload.userId),published: true});
        res.status(200).json({
            statusCode: 200,
            message: "success",
            data: {
                profile : profile[0],
                personal : admin,
                totalpackages : package,
                unpublished : unpublished,
                published : published
            }
        });
    } catch (err) {
        next(err);
    }
}

exports.getAll = (req,res,next)=>{
    async.parallel([
        function(callback){
            AdminProfile.countDocuments({},(err,count)=>{
                let totalProfile = count;
                callback(err,totalProfile);
            });
        },
        function(callback){
            AdminProfile.find({}).populate('admin' ,'-password')
                .exec((err,profiles)=>{
                    if(err) return next(err);
                    callback(err,profiles);
                });
        }
    ],function(err,result){
        if(err) return next(err);
        let totalProfile = result[0];
        let profiles = result[1];
        res.status(200).json({
            statusCode : 200,
            message : "success",
            data : profiles,
            totalProfile : totalProfile 
        });
    });       
}

exports.editProfile = (req,res,next) =>{
    if (!req.body) {
        const error = new Error("No Body Found");
        error.statusCode = 422;
        return next(error);
    }
    try {
        // const imageUrl = `${req.protocol}://${req.get("host")}/images/`;
        AdminProfile.updateOne({ admin: req.payload.userId }, { $set: req.body }, (err, docs) => {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                res.status(200).json({
                    statusCode : 200,
                    message: "Updated Success",
                    data : docs
                });
            }
        })
    } catch (err) {
        next(err);
    }
}