const {Router} = require('express');
const {createUser, login, verifyMe, getAllUsers, updateSocketId, updatePublicKey, getUserSecret} = require('../controllers/users.controller');
const verify = require('../middleware/verify.middleware');

const userRouter = Router();

userRouter.post('/user/create', createUser);

userRouter.post('/user/login', login);

userRouter.get('/user/verify', verify, verifyMe);

userRouter.get('/users', getAllUsers);

userRouter.post('/user/edit/socket', verify, updateSocketId);

userRouter.post('/user/edit/publickey', verify, updatePublicKey);

userRouter.get('/user/secret/:id', verify, getUserSecret);

module.exports = userRouter;