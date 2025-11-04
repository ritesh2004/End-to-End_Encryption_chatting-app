const { Router } = require('express');
const verify = require('../middleware/verify.middleware');
const axios = require('axios');

const notificationRouter = Router();

notificationRouter.post('/notification/upload-token', verify, async (req, res)=>{
    try {
        const { data } = await axios.post(`${process.env.NOTIFICATION_SERVER_API_URL}/upload-token`, req.body)
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

notificationRouter.post('/notification/delete-token', verify, async (req, res)=>{
    try {
        const { data } = await axios.post(`${process.env.NOTIFICATION_SERVER_API_URL}/delete-token`, req.body)
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

notificationRouter.post('/notification/send-notification', verify, async (req, res)=>{
    try {
        const { data } = await axios.post(`${process.env.NOTIFICATION_SERVER_API_URL}/send-notification`, req.body)
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

module.exports = notificationRouter;