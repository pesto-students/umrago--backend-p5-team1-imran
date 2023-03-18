const mongoose = require('mongoose');
const Traveller = require('../models/traveller');
const createError = require('http-errors');
const client = require('../helpers/init_redis');

exports.getAllTravellers = async (req, res, next) => {
    try {
        client.GET("travellers", async (err, result) => {
            if (err) {
                next(err);
            }
            console.log(result);
            if (result != null) {
                res.status(200).json({
                    statusCode: 200,
                    message: "success",
                    data: JSON.parse(result)
                });
            } else {
                const travellers = await Traveller.find();
                if (!travellers) throw createError.NotFound('NO USER FOUND');
                client.SET("travellers", JSON.stringify(travellers), 'EX', 3600 * 2, (err, result) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).json({
                            statusCode: 200,
                            message: "success",
                            data: travellers
                        });
                    }
                });
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.getAllUserTravellers = async (req, res, next) => {
    try {
        const travellers = await Traveller.find({ user: req.payload.userId });
        // if (travellers.length <= 0) throw createError.NotFound('NO USER FOUND')

        res.status(200).json({
            statusCode: 200,
            message: "success",
            data: travellers
        });
    } catch (error) {
        next(error)
    }
}

exports.postTravellers = async (req, res, next) => {
    //if post is empty
    if (!req.file && !req.body) {
        const error = new Error("Body is Empty");
        error.statusCode = 422;
        return next(error);
    }
    const traveller = new Traveller({
        _id: new mongoose.Types.ObjectId(),
        user: req.payload.userId,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: req.body.date_of_birth,
        gender: req.body.gender,
        nationality: req.body.nationality,
        relationship_of_cotraveller: req.body.relationship_of_cotraveller,
        front_of_passport: req.body.front_of_passport,
        back_of_passport: req.body.back_of_passport,
        passport_exp_date: req.body.passport_exp_date,
        passport_no: req.body.passport_no
    })

    traveller.save()
        .then(data => {
            res.status(201).json({
                statusCode: 201,
                message: "Created Successfully",
                data: data
            });
        }).catch(err => {
            next(err)
        });
}

exports.editTraveller = (req, res, next) => {
    if (!req.body) {
        const error = new Error("No Body Found");
        error.statusCode = 422;
        return next(error);
    }
    try {
        // const imageUrl = `${req.protocol}://${req.get("host")}/images/`;
        Traveller.updateOne({ _id: req.params.id }, { $set: req.body }, (err, docs) => {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                res.status(200).json({
                    statusCode: 200,
                    message: "Updated Success",
                    data: docs
                });
            }
        })
    } catch (err) {
        next(err);
    }
}

exports.delById = async (req, res, next) => {
    try {
        const traveller = await Traveller.findById(req.params.id);
        if (!traveller) {
            resourceNotFound(`No traveller Found with ID = ${req.params.id}`);
        }

        // if (airline.airlines_logo) {
        //     clearImage(airline.airlines_logo);
        // }
        const deletedTraveller = await Traveller.findByIdAndRemove(req.params.id);

        res.status(200).json({
            statusCode: 200,
            message: "Traveller Deleted Successfully",
            data: deletedTraveller
        });
    } catch (err) {
        next(err);
    }
}