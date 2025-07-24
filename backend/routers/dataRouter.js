const express = require('express');
const { identifier } = require('../middlewares/identification');
const dataController = require('../constrollers/dataController');
const upload = require('../middlewares/multer');


const router = express.Router();

router.get('/webhook',dataController.getWebhook)

router.get('/dashboard',identifier,dataController.fetchdata)
router.get('/getnotification',identifier,dataController.getNotifications)
router.post('/inspection',dataController.inspectionRec)
router.post('/notification',identifier,dataController.createNotification)
router.post('/addrestaurant',identifier,upload.single('image'),dataController.addRestaurant)
router.post('/addemployee',identifier,dataController.addrecipient)
router.post('/addsection',identifier,dataController.addSection)
router.post('/trigger-notification',dataController.triggerNotification)
router.patch('/addquestion',identifier,dataController.addquestions)
router.patch('/updatequestion',identifier,dataController.updatequestion)
router.patch('/updateemployee',identifier,dataController.updateEmployee)
router.delete('/notification/:id',identifier,dataController.deleteNotification)
router.delete('/deleteEmployee',identifier,dataController.deleteEmployee)
router.delete('/deleteSection',identifier,dataController.deleteSection)
router.delete('/deleteQuestion',identifier,dataController.deleteQuestion)


module.exports = router;