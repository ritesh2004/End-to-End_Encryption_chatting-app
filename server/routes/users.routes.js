const {Router} = require('express');
const {createUser, login, verifyMe, getAllUsers} = require('../controllers/users.controller');
const verify = require('../middleware/verify.middleware');

const userRouter = Router();

userRouter.post('/user/create', createUser);

userRouter.post('/user/login', login);

userRouter.get('/user/verify', verify, verifyMe);

userRouter.get('/users', getAllUsers);

module.exports = userRouter;