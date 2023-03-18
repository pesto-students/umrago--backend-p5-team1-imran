const mongoose = require('mongoose');
const User = require('../models/user');
const createError = require('http-errors');

exports.getById = async (req,res,next)=>{
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw createError.NotFound('NO USER FOUND')
    
        res.status(200).json({
            statusCode : 200,
            message : "success",
            data: {
                user : user
            } 
        });
    } catch (error) {
        next(error)
    }
}

exports.getAllUsers = async (req,res,next) =>{
    try {
        const users = await User.find().select('-password -__v');
        if (!users) throw createError.NotFound('NO USER FOUND')
    
        res.status(200).json({
            statusCode : 200,
            message : "success",
            data: {
               user : users
            }
        });
    } catch (error) {
        next(error)
    }
}

//   change user image 
exports.changeUserphoto = async (req,res,next) => {       // image - file
    if (!req.body.photoUrl) {
        const error = new Error("No Image Provided");
        error.statusCode = 422;
        return next(error);
    }

    try {
        // const imageUrl = `${req.protocol}://${req.get("host")}/images/`;
        const user = await User.findById(req.payload.userId);
        user.photoUrl = req.body.photoUrl;
        let updatedUser = await user.save();
        res.status(200).json({
            message: "Image Changed Successfully", 
            user: {
                _id: updatedUser._id,
                email: updatedUser.email,
                imageUrl: updatedUser.photoUrl
            }
        });
    } catch (err) {
        next(err);
    }


}

exports.editUser = (req, res, next) => {
    if (!req.body) {
        const error = new Error("No Body Found");
        error.statusCode = 422;
        return next(error);
    }
    try {
        // const imageUrl = `${req.protocol}://${req.get("host")}/images/`;
        User.updateOne({ _id: req.payload.userId }, { $set: req.body }, (err, docs) => {
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