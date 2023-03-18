const express = require('express');
const multer = require('../middleware/upload-image');
const validObjectId = require('../middleware/validObjectId');
const airlineController = require('../controllers/airlineController');
const router = express.Router();
const {verifyAccessToken} = require('../helpers/jwt_helper');
//AIRLINE ROUTES

router.get('/',verifyAccessToken, airlineController.getAll);

router.post('/',verifyAccessToken,multer.single('airlines_logo'),airlineController.CreateAirline);

router.get('/:id',validObjectId,airlineController.getById);

router.delete('/:id',validObjectId, airlineController.delById);

module.exports = router;