const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verifyAccessToken } = require('../helpers/jwt_helper');
const validObjectId = require('../middleware/validObjectId');

router.get('/', userController.getAllUsers);

router.get('/:id', validObjectId,userController.getById);

router.patch('/changePhoto',verifyAccessToken,userController.changeUserphoto);

router.put('/edit' ,verifyAccessToken , userController.editUser);

module.exports = router;