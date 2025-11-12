const express = require('express');
const { identifier } = require('../middlewares/identification');
const dataController = require('../constrollers/dataController');
const upload = require('../middlewares/multer');


const router = express.Router();

router.get('/webhook',dataController.getWebhook)
router.post('/webhook',dataController.postWebhook)

router.get('/dashboard',identifier,dataController.fetchdata)
router.get('/getnotification',identifier,dataController.getNotifications)

router.post('/inspection',dataController.inspectionRec)
router.post('/notification',identifier,dataController.createNotification)
router.post('/reportsadd',identifier,dataController.createNotification)
router.post('/addrestaurant',identifier,upload.single('image'),dataController.addRestaurant)
router.post('/addemployee',identifier,dataController.addrecipient)
router.post('/addsection',identifier,dataController.addSection)
router.post('/trigger-notification',dataController.triggerNotification)
router.post('/inspection/image',dataController.addInspectionImage)
router.patch('/addquestion',identifier,dataController.addquestions)
router.patch('/updatequestion',identifier,dataController.updatequestion)
router.patch('/updateemployee',identifier,dataController.updateEmployee)
router.patch('/assign-employees',identifier,dataController.assignEmployeesToRestaurant)
router.delete('/notification/:id',identifier,dataController.deleteNotification)
router.delete('/deleteEmployee',identifier,dataController.deleteEmployee)
router.delete('/deleteSection',identifier,dataController.deleteSection)
router.delete('/deleteQuestion',identifier,dataController.deleteQuestion)

router.post('/trigger-csv-manual', dataController.csvNotification);
router.get('/csv-status', dataController.getCsvStatus);
router.get('/generate-csv-now', dataController.listCsvFiles);
router.get('/csv/download/:filename', dataController.downloadCsv);
module.exports = router;