const {Router} = require('express');
const {createUser, login, verifyMe, getAllUsers, updateSocketId, updatePublicKey, getUserSecret, editProfile, editLastmsg, logout, checkUsernameEmail} = require('../controllers/users.controller');
const verify = require('../middleware/verify.middleware');

const userRouter = Router();

userRouter.post('/user/create', createUser);

userRouter.post('/user/login', login);

userRouter.post('/user/check', checkUsernameEmail);

userRouter.get('/user/verify', verify, verifyMe);

userRouter.get('/users',verify, getAllUsers);

userRouter.post('/user/edit/socket', verify, updateSocketId);

userRouter.post('/user/edit/publickey', verify, updatePublicKey);

userRouter.get('/user/secret/:id', verify, getUserSecret);

userRouter.post('/user/edit/profile', verify, editProfile);

userRouter.post('/user/edit/lastmsg/:id', verify, editLastmsg);

userRouter.get('/user/logout', verify, logout);

module.exports = userRouter;