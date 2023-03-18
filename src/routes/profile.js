const express = require('express');
const validObjectId = require('../middleware/validObjectId');
const profileController = require('../controllers/profileController');
const router = express.Router();
const {verifyAccessToken} = require('../helpers/jwt_helper');

//PROFILE ROUTES
router.post('/', verifyAccessToken ,profileController.postProfile);

router.get('/', verifyAccessToken, profileController.getProfile);

router.get('/all/list',profileController.getAll);

router.put('/edit',verifyAccessToken,profileController.editProfile);


module.exports = router;