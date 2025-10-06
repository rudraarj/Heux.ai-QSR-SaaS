const express = require('express')
const { identifier } = require('../middlewares/identification');
const reportsController = require('../constrollers/reportsController')

const router = express.Router();

router.get('/reports',identifier, reportsController.getReports);

/**
 * @route   POST /reports-add
 * @desc    Create a new report notification
 * @access  Private
 */
router.post('/reports-add',identifier, reportsController.createReport);

/**
 * @route   PUT /reports-add
 * @desc    Update an existing report notification
 * @access  Private
 */
router.put('/reports-add',identifier, reportsController.updateReport);

/**
 * @route   DELETE /reports-add
 * @desc    Delete a report notification
 * @access  Private
 */
router.delete('/reports-add',identifier, reportsController.deleteReport);

router.post('/test-notification', identifier, reportsController.testNotification)
router.post('/trigger-csv-manual',reportsController.triggerCsvManual)
router.get('/csv-status',reportsController.csvStatus)
router.post('/generate-csv-now',reportsController.generatecsvnow)
router.get('/csv/download/:filename',reportsController.csvdownloadfilename)
router.post('/trigger-notification-manual/:id',reportsController.triggernotificationmanualid)
router.post('/refresh-schedules', identifier, reportsController.refreshSchedules)
router.get('/list-files', reportsController.listFiles)
router.get('/email-config', reportsController.checkEmailConfig)


module.exports = router;