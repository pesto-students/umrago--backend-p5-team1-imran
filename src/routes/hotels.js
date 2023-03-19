const express = require('express');
const multer = require('../middleware/upload-image');
const validObjectId = require('../middleware/validObjectId');
const hotelController = require('../controllers/hotelController');
const router = express.Router();

//HOTEL ROUTES
router.get('/', hotelController.getAll);

router.post('/',hotelController.postHotel)

router.get('/:id',hotelController.getById);

router.delete('/:id',hotelController.delHotel);

module.exports = router;