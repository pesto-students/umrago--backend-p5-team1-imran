const express = require('express');
const multer = require('../middleware/upload-image');
const validObjectId = require('../middleware/validObjectId');
const packageController = require('../controllers/packageController');
const router = express.Router();
const { verifyAccessToken } = require('../helpers/jwt_helper');
const uploadImage = require('../middleware/upload-image');


//PACKAGE ROUTES
router.post('/all', packageController.getAll);

router.post('/',packageController.postPackage);

router.get('/:id' ,packageController.getById);

router.delete('/:id',packageController.delPackage);

router.post('/all/admin', verifyAccessToken , packageController.getAllPackAdmin);

router.get('/all/search',packageController.searchAllPackages);

router.post('/wishlist' , verifyAccessToken ,packageController.postWish);

router.get('/wish/user',verifyAccessToken,packageController.getWishUser);
// router.post('/uploadimages', uploadImage.array('images',10),packageController.uploadImage);

router.post('/remove/wishlist/:wishId' , verifyAccessToken , packageController.removeWish);

module.exports = router;