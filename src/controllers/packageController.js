const Package = require('../models/package');
const Wishlist = require('../models/wishlist');
const async = require('async');
const resourceNotFound = require('../helpers/resourceNotFound');
const mongoose = require('mongoose');
const createError = require('http-errors');
const AdminProfile = require('../models/profile');
String.prototype.toCamelCase = function() {
    return this.replace(/\b(\w)/g , function(match, capture) {
      return capture.toUpperCase();
    }).replace(/([A-Z])/g, '$1');
  }

//   exports.uploadImage = (req,res,next) =>{
//       console.log(req.files)
//       let length = req.files.length;
//       let arr ;
//       for(i=0;i < length + 1; i++){
//        arr =  "http://143.110.250.43:5000/" + req.files[i].path
//        console.log(arr)
//        res.json({
//            images : arr
//        })
//       }
      
//   }

//GET ALL PACKAGES
exports.getAll = (req, res, next) => {
    const perPage = 15;
    const page = req.query.page - 1;
    const searchKeyword = req.body.start_date;
    let query = req.body;
    let mysort;
    if (req.body.priceDefined) {
        query['quint_price'] = { $gte: (query.priceDefined[0]), $lte: (query.priceDefined[1]) }
        delete query['priceDefined']
    }
    if(req.body.start_date){
        query['start_date'] = { $gte : searchKeyword}
        console.log(query)
    }
    if(req.query.sortBy == 'asc'){
        mysort = {quint_price : 1}
    }else if(req.query.sortBy == 'desc'){
        mysort = {quint_price : -1}
    }else{
        mysort = {createdAt : -1}
    }
    async.parallel([
        function (callback) {
            Package.countDocuments(query, (err, count) => {
                let totalpackages = count;
                callback(err, totalpackages);
            });
        },
        function (callback) {
            Package.find(query).sort(mysort)
            .populate('airline' ,'airline meal_in_flight travel_class islayover isoutgoing')
            .select('name airline quint_price discount mrp start_date end_date meals wishlist')
                .skip(perPage * page)
                .limit(perPage)
                .exec((err, packages) => {
                    if (err) return next(err);
                    let package = packages.map(pack => {
                        return {
                            _id : pack._id,
                            name :  pack.name.toCamelCase(),
                            quint_price : pack.quint_price,
                            discount : pack.discount,
                            start_date : pack.start_date,
                            end_date : pack.end_date,
                            wishlist : pack.wishlist,
                            mrp : Math.ceil(pack.mrp),
                            meals : pack.meals,
                            airline : [{
                                _id : pack.airline[0]._id,
                                name : pack.airline[0].airline.name.toCamelCase(),
                                logo : pack.airline[0].airline.airlines_logo,
                                flight_number : pack.airline[0].airline.flight_number,
                                meal_in_flight : pack.airline[0].meal_in_flight,
                                travel_class : pack.airline[0].airline.travel_class,
                                islayover : pack.airline[0].islayover,
                                isoutgoing : pack.airline[0].isoutgoing
                            },{
                                _id : pack.airline[1]._id,
                                name : pack.airline[1].airline.name.toCamelCase(),
                                logo : pack.airline[1].airline.airlines_logo,
                                flight_number : pack.airline[1].airline.flight_number,
                                meal_in_flight : pack.airline[1].meal_in_flight,
                                travel_class : pack.airline[1].airline.travel_class,
                                islayover : pack.airline[1].islayover,
                                isoutgoing : pack.airline[1].isoutgoing
                            }]
                        }
                    })
                    callback(err, package);
                });
        }
    ], function (err, result) {
        console.log(err)
        if (err) return next(err);
        let totalpackages = result[0];
        let packages = result[1];
        res.status(200).json({
            statusCode: 200,
            message: "success",
            parameters: req.body,
            data: packages,
            totalpackages: totalpackages,
            pages: Math.ceil(totalpackages / perPage)
        });
    });
}

exports.getAllPackAdmin = (req, res, next) => {
    const adminId = mongoose.Types.ObjectId(req.payload.userId);
    let query = req.body;
    let mysort;
    const searchKeyword = req.body.start_date;
    if (req.body.priceDefined) {
        query['quint_price'] = { $gte: (query.priceDefined[0]), $lte: (query.priceDefined[1]) }
        delete query['priceDefined']
    }
    if(req.payload.userId){
        query['adminAuth'] = adminId
    }
    if(req.body.start_date){
        query['start_date'] = { $gte : searchKeyword}
        console.log(query)
    }
    if(req.query.sortBy == 'asc'){
        mysort = {quint_price : 1}
    }else if(req.query.sortBy == 'desc'){
        mysort = {quint_price : -1}
    }else{
        mysort = {createdAt : -1}
    }
    const perPage = 15;
    const page = req.query.page - 1;
    async.parallel([
        function (callback) {
            Package.countDocuments(query, (err, count) => {
                let totalpackages = count;
                callback(err, totalpackages);
            });
        },
        function (callback) {
            Package.find(query).sort(mysort)
            .populate('airline' ,'airline meal_in_flight travel_class islayover isoutgoing')
            .select('name airline adminAuth quint_price mrp discount  start_date end_date booked max')
                .skip(perPage * page)
                .limit(perPage)
                .exec((err, packages) => {
                    if (err) return next(err);
                    let package = packages.map(pack => {
                        return {
                            _id : pack._id,
                            name : pack.name.toCamelCase(),
                            quint_price : pack.quint_price,
                            discount : pack.discount,
                            start_date : pack.start_date,
                            end_date : pack.end_date,
                            booked : pack.booked,
                            max : pack.max,
                            mrp : Math.ceil(pack.mrp),
                            adminAuth : pack.adminAuth,
                            airline : [{
                                _id : pack.airline[0]._id,
                                name : pack.airline[0].airline.name.toCamelCase(),
                                logo : pack.airline[0].airline.airlines_logo,
                                flight_number : pack.airline[0].airline.flight_number,
                                meal_in_flight : pack.airline[0].meal_in_flight,
                                travel_class : pack.airline[0].airline.travel_class,
                                islayover : pack.airline[0].islayover,
                                isoutgoing : pack.airline[0].isoutgoing
                            },{
                                _id : pack.airline[1]._id,
                                name : pack.airline[1].airline.name.toCamelCase(),
                                logo : pack.airline[1].airline.airlines_logo,
                                flight_number : pack.airline[1].airline.flight_number,
                                meal_in_flight : pack.airline[1].meal_in_flight,
                                travel_class : pack.airline[1].airline.travel_class,
                                islayover : pack.airline[1].islayover,
                                isoutgoing : pack.airline[1].isoutgoing
                            }]
                        }
                    })
                    callback(err, package);
                });
        }
    ], function (err, result) {
        console.log(err)
        if (err) return next(err);
        let totalpackages = result[0];
        let packages = result[1];
        res.status(200).json({
            statusCode: 200,
            message: "success",
            parameters: req.body,
            data: packages,
            totalpackages: totalpackages,
            pages: Math.ceil(totalpackages / perPage)
        });
    });
}

exports.postPackage = async (req, res, next) => {
    //if post is empty
    if (!req.file && !req.body) {
        const error = new Error("Body is Empty");
        error.statusCode = 422;
        return next(error);
    }
    const organizer = req.body.organizer;
    const profileExist = await AdminProfile.findOne({_id : organizer});
    if(!profileExist){
      next(createError.NotAcceptable('PLEASE UPDATE YOUR PROFILE'))  ;
    }
    if(profileExist) {
        const profile = await AdminProfile.find({_id : organizer});
        const package = new Package({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            dept_city: req.body.dept_city,
            dest_city : req.body.dest_city,
            airline: req.body.airline,
            quint_price: req.body.quint_price,
            dual_price: req.body.dual_price,
            triple_price: req.body.triple_price,
            quad_price: req.body.quad_price,
            child_price_with_bed: req.body.child_price_with_bed,
            child_price_without_bed: req.body.child_price_without_bed,
            infant_price: req.body.infant_price,
            discount: req.body.discount,
            meals : req.body.meals,
            mrp : req.body.mrp,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            package_type: req.body.package_type,
            organizer: req.body.organizer,
            itinerary: req.body.itinerary,
            policies: req.body.policies,
            hotel: req.body.hotel,
            booked : req.body.booked,
            max : req.body.max,
            adminAuth : profile[0].admin
        })
        package.save()
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
}


exports.searchAllPackages = async (req,res,next) =>{
    const perPage = 15;
    const page = req.query.page - 1;
    
    // let searchKeyword = req.query.searchKeyword
    //   ? {
    //     start_date: {
    //       $regex: req.query.searchKeyword,
    //       $options: 'i',
    //     },
    //   }
    //   : {};
   let searchKeyword = req.query.searchKeyword;
    //   console.log(searchKeyword)
    let products = await Package.countDocuments({start_date :{ $gte : searchKeyword}});

    let productslen = products;
    console.log(productslen)

    let packages = await Package.find({start_date :{ $gte :searchKeyword }})
    .skip(perPage * page)
      .limit(perPage).exec();
    return res.status(200).json({
      success: true,
      count: productslen + " " + "Results found",
      data: packages,
      totalBooks: productslen,
      pages: Math.ceil(productslen / perPage)
    });
}


exports.getById = async (req, res, next) => {
    try {
        const package = await Package.findById(req.params.id).populate('airline hotel organizer adminAuth', '-password -__v');
        if (!package) {
            resourceNotFound(`NO PACKAGE FOUND WITH ID = ${req.params.id}`);
        }
        var query = {}
        var price = package.quint_price;
        query = {
            start_date : {$gte : package.start_date},
            quint_price : {price}
        }
        const similarProducts = await Package.find({start_date : {$gte : package.start_date}})
        .populate('airline' ,'airline meal_in_flight travel_class islayover isoutgoing')
        .select('name airline quint_price dept_city dest_city dual_price infant_price wishlist child_price_without_bed child_price_with_bed quad_price triple_price mrp discount start_date end_date').limit(10).skip(1);
      let simiPro =  similarProducts.map(pack =>{
            console.log(pack.wishlist)
                return  {
                    _id : pack._id,
                    name :  pack.name.toCamelCase(),
                    quint_price : pack.quint_price,
                    discount : pack.discount,
                    start_date : pack.start_date,
                    end_date : pack.end_date,
                    wishlist : pack.wishlist,
                    meals : pack.meals,
                    mrp : Math.ceil(pack.mrp),
                    airline : [{
                        _id : pack.airline[0]._id,
                        name : pack.airline[0].airline.name.toCamelCase(),
                        logo : pack.airline[0].airline.airlines_logo,
                        flight_number : pack.airline[0].airline.flight_number,
                        meal_in_flight : pack.airline[0].meal_in_flight,
                        travel_class : pack.airline[0].airline.travel_class,
                        islayover : pack.airline[0].islayover,
                        isoutgoing : pack.airline[0].isoutgoing
                    },{
                        _id : pack.airline[1]._id,
                        name : pack.airline[1].airline.name.toCamelCase(),
                        logo : pack.airline[1].airline.airlines_logo,
                        flight_number : pack.airline[1].airline.flight_number,
                        meal_in_flight : pack.airline[1].meal_in_flight,
                        travel_class : pack.airline[1].airline.travel_class,
                        islayover : pack.airline[1].islayover,
                        isoutgoing : pack.airline[1].isoutgoing
                    }]
                }
                   
            })
        res.status(200).json({
            statusCode: 200,
            message: "success",
            data: {
                package : package,
                similarProducts : simiPro
            },
        });
    } catch (err) {
        next(err);
    }
}

exports.postWish = async (req,res,next) => {     
    try {

        const package = await Package.findById(req.body.packageId);
        if (!package) {
            resourceNotFound(`no package found with ID = ${req.body.packageId}`);
        }
        console.log(package)
        package.wishlist.push({
            user: req.payload.userId
        });
        let WishedPost = await package.save();
        WishedPost = await Package.findById(WishedPost._id).populate('user', '-password');

        // using web socket
        Wishlist.find({ user: req.payload.userId, package: req.body.packageId })
        .then(result => {
            if (result.length > 0) {
                res.status(409).json({
                    message: "Product Already in Added",
                    foundProduct: result
                });
            } else {

                const wishlist = new Wishlist({
                    _id: mongoose.Types.ObjectId(),
                    package: req.body.packageId,
                    user: req.payload.userId
                });
                wishlist.save()
                    .then(result => {
                        return res.status(200).json({statusCode : 201,message: "Added To Wishlist", data: WishedPost.wishlist,packageId : req.body.packageId});
                    })
                    .catch(err => {
                       next(err)
                    });
            }
        }).catch(err => {
            next(err);
        });
        // socket_io.getIO().emit('package', {action: 'addWish', post:wishedPack});

       
    } catch (err) {
        next(err);
    }

}



exports.removeWish = async (req,res,next) => {   
    try {
        const package = await Package.findById(req.body.packageId);
        if (!package) {
            resourceNotFound(`No Package Found with ID = ${req.body.packageId}`);
        }

        
        const wishlist = await package.wishlist.id(req.params.wishId);
        
        if(wishlist == null){
            const error = new Error("Check Object Id of Wishlist");
            error.statusCode = 500;
            throw error;
        }
        // CHECK IF UNAUTHORIZED USER
        if (wishlist.user.toString() !== req.payload.userId) {
            const error = new Error("Not Authorized User");
            error.statusCode = 403;
            throw error;
        }
       

        await wishlist.remove();
        let WishPack = await package.save();
        WishPack = await Package.findById(WishPack._id).populate('user', '-password');

        Wishlist.deleteOne({ package: req.body.packageId , user : req.payload.userId }).exec()
        .then(result => {
            res.status(200).json({statusCode : 201,message: "Removed From Wishlist", data: WishPack.wishlist,packageId :req.body.packageId });
        })
        .catch(err => {
            next(err)
        });

       
    } catch (err) {
        next(err);
    }

}


//Del By ID
exports.delPackage = async (req, res, next) => {
    try {
        const package = await Package.findById(req.params.id);
        if (!package) {
            resourceNotFound(`NO PACKAGE FOUND WITH ID = ${req.params.id}`);
        }
        const deletedPackage = await Package.findByIdAndRemove(req.params.id);

        res.status(200).json({
            statusCode: 200,
            message: "Package Deleted Successfully",
            data: deletedPackage
        });
    } catch (err) {
        next(err);
    }
}

exports.getWishUser = (req,res,next) =>{
    Wishlist.find({ user: req.payload.userId }).populate('package').select('package')
        .exec()
        .then(result => {
         let package = result.map(pack => {
             return {
                 _id: pack.package._id,
                 wishListId : pack.package.wishlist.filter(x => x.user == req.payload.userId),
                 name: pack.package.name,
                 quint_price: pack.package.quint_price,
                 discount: pack.package.discount,
                 mrp : Math.ceil(pack.mrp),
                 start_date: pack.package.start_date,
                 end_date: pack.package.end_date,
                 booked: pack.package.booked,
                 max: pack.package.max,
                 adminAuth: pack.package.adminAuth
             }
            })
            res.status(200).json({
                statusCode : 200,
                message : "success",
                data: package
            });
        })
        .catch(err => {
           next(err);
        });
}


