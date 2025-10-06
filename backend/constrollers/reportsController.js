const ReportNotification = require('../models/reportModule');
const { notificationSchedulerService } = require('../utils/hourlyCsvService');
const emailService = require('../utils/emailService');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

class ReportsController {
  
  /**
   * GET /reports
   * Fetch all report notifications
   */
  async getReports(req, res) {
    try {
      const userId = req.accountID;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const notifications = await ReportNotification.find({createdBy:userId})
      res.json(notifications);

    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report notifications',
        error: error.message
      });
    }
  }

  /**
   * POST /reports-add
   * Create new report notification
   */
  async createReport(req, res) {
    try {
      const userId = req.accountID;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const {
        name,
        frequency,
        time,
        timeZone,
        dayOfWeek,
        dayOfMonth,
        channels,
        recipients,
        filters,
        active,
        recipientCount
      } = req.body;

      // Validation
      if (!name || !frequency) {
        return res.status(400).json({
          success: false,
          message: 'Name and frequency are required'
        });
      }

      // Create new notification
      const notification = new ReportNotification({
        name,
        frequency,
        time: time || '09:00',
        dayOfWeek,
        dayOfMonth,
        timeZone: timeZone || 'America/Toronto',
        channels: {
          email: channels?.email || false,
          whatsapp: channels?.whatsapp || false
        },
        recipients: {
          super_admin: recipients?.super_admin || false,
          owner: recipients?.owner || false,
          district_manager: recipients?.district_manager || false,
          general_manager: recipients?.general_manager || false,
          employee: recipients?.employee || false
        },
        filters: {
          restaurants: filters?.restaurants || 'all',
          sections: filters?.sections || 'all',
          dateRange: filters?.dateRange || 7,
          selectedRestaurants: filters?.selectedRestaurants || [],
          selectedSections: filters?.selectedSections || []
        },
        active: active !== undefined ? active : true,
        recipientCount: recipientCount || 0,
        createdBy: userId,
        updatedBy: userId
      });

      const savedNotification = await notification.save();

      // Schedule the notification if it's active
      if (savedNotification.active) {
        await notificationSchedulerService.addOrUpdateNotification(savedNotification);
      }

      res.status(201).json(savedNotification);

    } catch (error) {
      console.error('Error creating report:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create report notification',
        error: error.message
      });
    }
  }

  /**
   * PUT /reports-add
   * Update existing report notification
   */
  async updateReport(req, res) {
    try {
      const userId = req.accountID;
      const userRole = req.userRole;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const {
        id,
        name,
        frequency,
        time,
        timeZone,
        dayOfWeek,
        dayOfMonth,
        channels,
        recipients,
        filters,
        active,
        recipientCount
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Notification ID is required'
        });
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        });
      }

      // Find existing notification
      const notification = await ReportNotification.findById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      // Check permissions
      if (userRole !== 'superadmin' && notification.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      // Update notification
      const updateData = {
        updatedBy: userId
      };

      if (name !== undefined) updateData.name = name;
      if (frequency !== undefined) updateData.frequency = frequency;
      if (time !== undefined) updateData.time = time;
      if (timeZone !== undefined) updateData.timeZone = timeZone;
      if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
      if (dayOfMonth !== undefined) updateData.dayOfMonth = dayOfMonth;
      if (active !== undefined) updateData.active = active;
      if (recipientCount !== undefined) updateData.recipientCount = recipientCount;

      if (channels) {
        updateData.channels = {
          email: channels.email !== undefined ? channels.email : notification.channels.email,
          whatsapp: channels.whatsapp !== undefined ? channels.whatsapp : notification.channels.whatsapp
        };
      }

      if (recipients) {
        updateData.recipients = {
          super_admin: recipients.super_admin !== undefined ? recipients.super_admin : notification.recipients.super_admin,
          owner: recipients.owner !== undefined ? recipients.owner : notification.recipients.owner,
          district_manager: recipients.district_manager !== undefined ? recipients.district_manager : notification.recipients.district_manager,
          general_manager: recipients.general_manager !== undefined ? recipients.general_manager : notification.recipients.general_manager,
          employee: recipients.employee !== undefined ? recipients.employee : notification.recipients.employee
        };
      }

      if (filters) {
        updateData.filters = {
          restaurants: filters.restaurants || notification.filters.restaurants,
          sections: filters.sections || notification.filters.sections,
          dateRange: filters.dateRange || notification.filters.dateRange,
          selectedRestaurants: filters.selectedRestaurants || notification.filters.selectedRestaurants,
          selectedSections: filters.selectedSections || notification.filters.selectedSections
        };
      }

      const updatedNotification = await ReportNotification.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      // Update the notification schedule
      await notificationSchedulerService.addOrUpdateNotification(updatedNotification);

      res.json(updatedNotification);

    } catch (error) {
      console.error('Error updating report:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update report notification',
        error: error.message
      });
    }
  }

  /**
   * DELETE /reports-add
   * Delete report notification
   */
  async deleteReport(req, res) {
    try {
      const userId = req.accountID;
      const userRole = req.userRole;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Notification ID is required'
        });
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        });
      }

      // Find existing notification
      const notification = await ReportNotification.findById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      // Check permissions
      if (userRole !== 'superadmin' && notification.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      // Stop the notification job
      notificationSchedulerService.stopNotificationJob(id);

      // Delete notification
      await ReportNotification.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete report notification',
        error: error.message
      });
    }
  }

  /**
   * POST /test-notification
   * Send test notification
   */
  async testNotification(req, res) {
    try {
      const userId = req.accountID;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Notification ID is required'
        });
      }

      // Find notification
      const notification = await ReportNotification.findById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      // Trigger the notification manually
      const result = await notificationSchedulerService.triggerNotificationManually(id);

      if (result.success) {
        res.json({
          success: true,
          message: 'Test notification sent successfully',
          notification: {
            name: notification.name,
            channels: notification.channels,
            recipientCount: notification.recipientCount
          },
          results: result.results || []
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error || result.message || 'Failed to send test notification',
          notification: {
            name: notification.name,
            channels: notification.channels
          }
        });
      }

    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message
      });
    }
  }
/**
 * POST /trigger-csv-manual
 * Manually trigger CSV generation with optional webhook
 */
  async triggerCsvManual (req, res) {
    try {
        const { sendWebhook = false } = req.body;
        
        console.log(`Manual CSV trigger requested (webhook: ${sendWebhook})`);
        
        const result = await notificationSchedulerService.generateCsvManually(sendWebhook);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                data: {
                    csvUrl: result.csvUrl,
                    filename: result.filename,
                    recordCount: result.recordCount,
                    generatedAt: result.generatedAt,
                    webhookSent: result.webhookSent,
                    webhookUrl: result.webhookurl
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: result.message || result.error,
                recordCount: result.recordCount || 0
            });
        }
        
    } catch (error) {
        console.error('Error in manual CSV trigger:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate CSV manually',
            error: error.message
        });
    }
}
/**
 * GET /csv-status
 * Get the status of the CSV service and scheduled notifications
 */
async csvStatus (req, res){
    try {
        const csvServiceStatus = notificationSchedulerService.getStatus();
        const notificationServiceStatus = notificationSchedulerService.getStatus();
        
        // Get active notifications count
        const activeNotificationsCount = await ReportNotification.countDocuments({ active: true });
        
        res.json({
            success: true,
            csvService: csvServiceStatus,
            notificationService: notificationServiceStatus,
            statistics: {
                activeNotifications: activeNotificationsCount,
                scheduledJobs: notificationServiceStatus.scheduledNotifications
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting CSV status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get service status',
            error: error.message
        });
    }
};
/**
 * POST /generate-csv-now
 * Generate CSV immediately and return download link (no webhook)
 */
async generatecsvnow (req, res) {
    try {
        console.log('Immediate CSV generation requested');
        
        // Get filters from request body if provided
        const { filters } = req.body;
        
        const result = await notificationSchedulerService.generateCsvManually(false, filters);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.isEmpty ? 'Empty CSV generated successfully' : 'CSV generated successfully',
                csvUrl: result.csvUrl,
                filename: result.filename,
                downloadLink: result.csvUrl,
                recordCount: result.recordCount,
                isEmpty: result.isEmpty || false,
                generatedAt: result.generatedAt
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.message || result.error,
                recordCount: 0
            });
        }
        
    } catch (error) {
        console.error('Error generating CSV now:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate CSV',
            error: error.message
        });
    }
};
/**
 * GET /csv/download/:filename
 * Download a specific CSV file
 */
async csvdownloadfilename (req, res) {
    try {
        const { filename } = req.params;
        
        // Validate filename to prevent directory traversal
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename'
            });
        }
        
        // Check if it's a CSV file
        if (!filename.endsWith('.csv')) {
            return res.status(400).json({
                success: false,
                message: 'Only CSV files are allowed'
            });
        }
        
        // Try both inspections and reports folders
        const reportsFilePath = path.join(__dirname, '../reports', filename);
        
        let filePath = null;
        
        // Check which file exists
        if (fs.existsSync(reportsFilePath)) {
            filePath = reportsFilePath;
        }
        
        if (!filePath) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        
        console.log(`Serving CSV file: ${filename}`);
        
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        
        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error reading file'
                });
            }
        });
        
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('Error downloading CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file',
            error: error.message
        });
    }
};

/**
 * POST /trigger-notification-manual/:id
 * Manually trigger a specific notification
 */
async triggernotificationmanualid (req, res) {
    try {
        const { id } = req.params;
        
        // Validate notification exists
        const notification = await ReportNotification.findById(id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        console.log(`Manual notification trigger requested for: ${notification.name}`);
        
        const result = await notificationSchedulerService.triggerNotificationManually(id);
        
        if (result.success) {
            res.json({
                success: true,
                message: `Notification "${notification.name}" executed successfully`,
                notificationName: notification.name,
                results: result.results
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.error || 'Failed to execute notification',
                notificationName: notification.name
            });
        }
        
    } catch (error) {
        console.error('Error triggering notification manually:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to trigger notification',
            error: error.message
        });
    }
};

/**
 * POST /refresh-schedules
 * Refresh all notification schedules (useful after database updates)
 */
async refreshSchedules (req, res) {
    try {
        console.log('Refreshing all notification schedules...');
        
        // Stop all current jobs
        notificationSchedulerService.stopAll();
        
        // Reload and reschedule all active notifications
        await notificationSchedulerService.loadAndScheduleNotifications();
        
        const status = notificationSchedulerService.getStatus();
        
        res.json({
            success: true,
            message: 'All schedules refreshed successfully',
            scheduledNotifications: status.scheduledNotifications,
            activeJobs: status.activeJobs
        });
        
    } catch (error) {
        console.error('Error refreshing schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh schedules',
            error: error.message
        });
    }
};

/**
 * GET /list-files
 * List all available CSV files for download
 */
async listFiles (req, res) {
    try {
        const inspectionsFolder = path.join(__dirname, '../inspections');
        const reportsFolder = path.join(__dirname, '../reports');
        
        let files = [];
        
        // Get files from inspections folder
        if (fs.existsSync(inspectionsFolder)) {
            const inspectionFiles = fs.readdirSync(inspectionsFolder)
                .filter(file => file.endsWith('.csv'))
                .map(file => ({
                    filename: file,
                    type: 'inspection',
                    url: `${process.env.BASE_URL || 'http://localhost:3200'}/api/notifications/csv/download/${file}`,
                    size: fs.statSync(path.join(inspectionsFolder, file)).size,
                    created: fs.statSync(path.join(inspectionsFolder, file)).birthtime
                }));
            files = files.concat(inspectionFiles);
        }
        
        // Get files from reports folder
        if (fs.existsSync(reportsFolder)) {
            const reportFiles = fs.readdirSync(reportsFolder)
                .filter(file => file.endsWith('.csv'))
                .map(file => ({
                    filename: file,
                    type: 'report',
                    url: `${process.env.BASE_URL || 'http://localhost:3200'}/api/notifications/csv/download/${file}`,
                    size: fs.statSync(path.join(reportsFolder, file)).size,
                    created: fs.statSync(path.join(reportsFolder, file)).birthtime
                }));
            files = files.concat(reportFiles);
        }
        
        // Sort by creation date (newest first)
        files.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        res.json({
            success: true,
            files: files,
            totalFiles: files.length
        });
        
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list files',
            error: error.message
        });
    }
};

    /**
     * GET /email-config
     * Check email service configuration status
     */
    async checkEmailConfig(req, res) {
        try {
            const configStatus = emailService.getConfigurationStatus();
            const connectionTest = await emailService.testConnection();
            
            res.json({
                success: true,
                configuration: configStatus,
                connection: connectionTest,
                instructions: {
                    setup: [
                        '1. Set NODE_CODE_SENDING_EMAIL_ADDRESS in your .env file',
                        '2. Set NODE_CODE_SENDING_EMAIL_PASSWORD in your .env file (use App Password for Gmail)',
                        '3. Restart the server after setting environment variables',
                        '4. For Gmail: Enable 2FA and generate an App Password'
                    ],
                    example: {
                        NODE_CODE_SENDING_EMAIL_ADDRESS: 'your-email@gmail.com',
                        NODE_CODE_SENDING_EMAIL_PASSWORD: 'your-app-password'
                    }
                }
            });
            
        } catch (error) {
            console.error('Error checking email config:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check email configuration',
                error: error.message
            });
        }
    }
};

module.exports = new ReportsController();