const express = require('express');
const validObjectId = require('../middleware/validObjectId');
const travellerController = require('../controllers/travellerController');
const router = express.Router();
const {verifyAccessToken} = require('../helpers/jwt_helper');

//TRAVELLER ROUTES
router.get('/all', travellerController.getAllTravellers);

router.post('/',verifyAccessToken,travellerController.postTravellers);

router.get('/userTraveller', verifyAccessToken, travellerController.getAllUserTravellers);

router.put('/edit/:id',travellerController.editTraveller);

router.delete('/delete/:id',travellerController.delById);

module.exports = router;