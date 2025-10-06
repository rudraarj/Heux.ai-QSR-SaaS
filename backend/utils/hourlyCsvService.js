// notificationSchedulerService.js
const cron = require('node-cron');
const ReportNotification = require('../models/reportModule');
const inspectionModule = require('../models/inspectionsModule');
const employeesModule = require('../models/employeesModule');
const restaurantModule = require('../models/restaurantModule'); // Adjust path as needed
const sectionModule = require('../models/sectionModule'); // Adjust path as needed
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const emailService = require('./emailService');
const { sendMessage } = require('./whatsAppHooks');
const dotenv = require('dotenv')
dotenv.config()


class NotificationSchedulerService {
    constructor() {
        this.scheduledJobs = new Map();
        this.initialized = false;
        this.reportsFolder = path.join(__dirname, '../reports');
        this.baseUrl = process.env.BASE_URL || 'http://localhost:8080';
        this.emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL || 'https://hook.eu2.make.com/email-webhook';
        this.whatsappWebhookUrl = process.env.WHATSAPP_WEBHOOK_URL || 'https://hook.eu2.make.com/99vl1p15i80vmwhoj1sc2pzfafhau6fq';
    }

    // Format a Date into { date: YYYY-MM-DD, time: HH:mm:ss } in a given IANA timezone
    // Example timeZone: 'America/Toronto' (Eastern Time), 'America/Winnipeg' (Central), etc.
    formatDateTimeParts(date, timeZone) {
        if (!date) {
            return { date: '', time: '' };
        }
        try {
            const dateStr = new Intl.DateTimeFormat('en-CA', {
                timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(date);

            const timeStr = new Intl.DateTimeFormat('en-GB', {
                timeZone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(date);

            // en-CA gives YYYY-MM-DD already; en-GB time is HH:mm:ss
            return { date: dateStr, time: timeStr };
        } catch (_) {
            // Fallback to UTC if timezone invalid
            const d = new Date(date);
            const dateStr = d.toISOString().split('T')[0];
            const timeStr = d.toISOString().split('T')[1].split('.')[0];
            return { date: dateStr, time: timeStr };
        }
    }

    // Initialize the service
    async init() {
        if (this.initialized) return;
        
        try {
            console.log('Initializing Notification Scheduler Service...');
            
            // Create reports folder if it doesn't exist
            await this.ensureReportsFolder();
            
            // Load and schedule all active notifications
            await this.loadAndScheduleNotifications();
            
            this.initialized = true;
            console.log('Notification Scheduler Service initialized successfully');
        } catch (error) {
            console.error('Error initializing Notification Scheduler Service:', error);
            throw error;
        }
    }

    // Ensure reports folder exists
    async ensureReportsFolder() {
        try {
            await fs.access(this.reportsFolder);
            console.log('Reports folder exists');
        } catch (error) {
            console.log('Creating reports folder...');
            await fs.mkdir(this.reportsFolder, { recursive: true });
            console.log('Reports folder created');
        }
    }

    // Load all active notifications and schedule them
    async loadAndScheduleNotifications() {
        try {
            const activeNotifications = await ReportNotification.find({ active: true });
            console.log(`Found ${activeNotifications.length} active notifications to schedule`);

            for (const notification of activeNotifications) {
                await this.scheduleNotification(notification);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            throw error;
        }
    }

    // Schedule a single notification
    async scheduleNotification(notification) {
        try {
            const cronPattern = this.getCronPattern(notification);
            console.log(`Scheduling notification "${notification.name}" with pattern: ${cronPattern}`);

            // Stop existing job if it exists
            this.stopNotificationJob(notification._id);

            // Create new cron job
            const job = cron.schedule(cronPattern, async () => {
                console.log(`Executing scheduled notification: ${notification.name}`);
                await this.executeNotification(notification._id);
            }, {
                scheduled: true,
                timezone: notification.timeZone || 'America/Toronto'
            });

            // Store job reference
            this.scheduledJobs.set(notification._id.toString(), job);
            
            console.log(`Notification "${notification.name}" scheduled successfully`);
        } catch (error) {
            console.error(`Error scheduling notification "${notification.name}":`, error);
        }
    }

    // Get cron pattern from notification settings
    getCronPattern(notification) {
        const [hours, minutes] = notification.time.split(':').map(Number);

        switch (notification.frequency) {
            case 'daily':
                return `${minutes} ${hours} * * *`;
            
            case 'weekly':
                const dayMap = {
                    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
                    'thursday': 4, 'friday': 5, 'saturday': 6
                };
                const dayNumber = dayMap[notification.dayOfWeek.toLowerCase()];
                return `${minutes} ${hours} * * ${dayNumber}`;
            
            case 'monthly':
                return `${minutes} ${hours} ${notification.dayOfMonth} * *`;
            
            default:
                throw new Error(`Invalid frequency: ${notification.frequency}`);
        }
    }

    // Execute a notification (generate report and send)
    async executeNotification(notificationId) {
        try {
            // Fetch the latest notification data
            const notification = await ReportNotification.findById(notificationId);
            if (!notification || !notification.active) {
                console.log(`Notification ${notificationId} is inactive or not found, skipping`);
                return;
            }

            console.log(`Executing notification: ${notification.name}`);

            // Generate report
            const reportResult = await this.generateReport(notification);
            
            if (!reportResult.success) {
                console.log(`Failed to generate report for notification "${notification.name}"`);
                return { 
                    success: false, 
                    message: reportResult.message || 'Failed to generate report',
                    results: []
                };
            }

            // Check if report is empty
            if (reportResult.isEmpty || reportResult.recordCount === 0) {
                console.log(`Empty report generated for notification "${notification.name}"`);
            }

            // Send notifications via enabled channels
            const results = [];
            // derive accountId from notification.createdBy user if available
            let accountId = null;
            try {
                const userModule = require('../models/usersModel');
                const creator = await userModule.findById(notification.createdBy).select('accountID');
                // accountId = creator?.accountID || null;
                accountId = notification.createdBy || null;
            } catch (_) {}

            if (notification.channels.email) {
                const emailResult = await this.sendEmailNotification(notification, reportResult, accountId);
                results.push({ channel: 'email', ...emailResult });
            }

            if (notification.channels.whatsapp) {
                const whatsappResult = await this.sendWhatsappNotification(notification, reportResult, accountId);
                results.push({ channel: 'whatsapp', ...whatsappResult });
            }

            // Update notification's lastSent and calculate next send
            await ReportNotification.findByIdAndUpdate(notificationId, {
                lastSent: new Date(),
                nextSend: notification.calculateNextSend()
            });

            console.log(`Notification "${notification.name}" executed successfully`);
            return { success: true, results };

        } catch (error) {
            console.error(`Error executing notification ${notificationId}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Generate report based on notification settings
    async generateReport(notification) {
        try {
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - (notification.filters.dateRange * 24 * 60 * 60 * 1000));

            console.log(`Generating report for "${notification.name}" from ${startDate.toISOString()} to ${endDate.toISOString()}`);

            // Build query based on filters
            let query = {
                date: {
                    $gte: startDate,
                    $lt: endDate
                }
            };

            // Compute allowed sectionIds based on restaurant and section filters
            let allowedSectionIds = null;
            if (notification.filters && notification.filters.restaurants === 'specific' && Array.isArray(notification.filters.selectedRestaurants) && notification.filters.selectedRestaurants.length > 0) {
                // Find sections that belong to the selected restaurants
                const restaurantSectionDocs = await sectionModule.find({
                    restaurantId: { $in: notification.filters.selectedRestaurants }
                }).select('id restaurantId');

                const sectionIdsForRestaurants = restaurantSectionDocs.map(s => s.id);
                allowedSectionIds = new Set(sectionIdsForRestaurants);
                console.log(`Derived ${sectionIdsForRestaurants.length} section(s) from selected restaurant(s)`);
            }

            if (notification.filters && notification.filters.sections === 'specific' && Array.isArray(notification.filters.selectedSections) && notification.filters.selectedSections.length > 0) {
                // If restaurants also filtered, intersect; otherwise, use selected sections directly
                if (allowedSectionIds) {
                    const intersected = notification.filters.selectedSections.filter(secId => allowedSectionIds.has(secId));
                    allowedSectionIds = new Set(intersected);
                } else {
                    allowedSectionIds = new Set(notification.filters.selectedSections);
                }
                console.log(`Filtering by selected section(s): ${notification.filters.selectedSections.join(', ')}`);
            }

            if (allowedSectionIds) {
                query.sectionId = { $in: Array.from(allowedSectionIds) };
                console.log(`Final section filter count: ${Array.from(allowedSectionIds).length}`);
            }

            console.log(`Query:`, JSON.stringify(query, null, 2));

            // Fetch inspection data
            const inspections = await inspectionModule.find(query).sort({ date: -1 });
            console.log(`Found ${inspections.length} inspections matching the criteria`);

            // Always generate CSV, even if no data found
            if (inspections.length === 0) {
                console.log('No inspections found, generating empty report');
                // Generate empty CSV with headers only
                const csvResult = await this.generateCsvContent([], {}, {}, {}, {}, {}, notification);
                return {
                    success: true,
                    ...csvResult,
                    recordCount: 0,
                    isEmpty: true
                };
            }

            // Get employee details
            const employeeIds = [...new Set(inspections.map(inspection => inspection.employeeId))];
            const employees = await employeesModule.find({
                id: { $in: employeeIds }
            }).select('id name');

            // Get section details first (need restaurantId mapping)
            const sectionIds = [...new Set(inspections.map(inspection => inspection.sectionId))];
            const sections = await sectionModule.find({
                id: { $in: sectionIds }
            }).select('id name questions restaurantId');

            // Derive restaurant IDs from sections.restaurantId
            const restaurantIds = [...new Set(sections.map(sec => sec.restaurantId).filter(Boolean))];
            const restaurants = await restaurantModule.find({
                id: { $in: restaurantIds }
            }).select('id name');

            // Create lookup maps
            const employeeMap = {};
            employees.forEach(emp => { employeeMap[emp.id] = emp.name; });

            const restaurantMap = {};
            restaurants.forEach(rest => { restaurantMap[rest.id] = rest.name; });

            const sectionMap = {};
            const sectionRestaurantMap = {};
            const questionTextById = {};
            sections.forEach(sec => {
                sectionMap[sec.id] = sec.name;
                if (sec.restaurantId) sectionRestaurantMap[sec.id] = sec.restaurantId;
                if (Array.isArray(sec.questions)) {
                    sec.questions.forEach(q => { questionTextById[q.id] = q.text; });
                }
            });

            // Generate CSV content
            const csvResult = await this.generateCsvContent(
                inspections,
                employeeMap,
                restaurantMap,
                sectionMap,
                questionTextById,
                sectionRestaurantMap,
                notification
            );
            
            return {
                success: true,
                ...csvResult,
                recordCount: inspections.length
            };

        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }

    // Generate CSV content
    async generateCsvContent(inspections, employeeMap, restaurantMap, sectionMap, questionTextById = {}, sectionRestaurantMap = {}, notification) {
        try {
            // Generate filename
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T').join('_').split('.')[0];
            const filename = `${(notification?.name || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`;
            const filePath = path.join(this.reportsFolder, filename);

            // Determine timezone for formatting
            const timeZone = (notification && notification.timeZone) || process.env.REPORTS_TIMEZONE || 'America/Toronto';

            // CSV headers per request
            const headers = [
                'Employee',
                'SentDate',
                'SendTime',
                'DoneDate',
                'DoneTime',
                'Restaurant',
                'Section',
                'Status',
                'Responses'
            ];

            // Convert data to CSV format
            const csvRows = [headers.join(',')];

            inspections.forEach(inspection => {
                const employeeName = (employeeMap && employeeMap[inspection.employeeId]) || 'Unknown Employee';
                const restaurantIdForSection = sectionRestaurantMap && sectionRestaurantMap[inspection.sectionId];
                const restaurantName = (restaurantMap && restaurantMap[restaurantIdForSection]) || 
                                     (restaurantMap && restaurantMap[inspection.userId]) || 'Unknown Restaurant';
                const sectionName = (sectionMap && sectionMap[inspection.sectionId]) || 'Unknown Section';

                const sentAt = inspection.createdAt ? new Date(inspection.createdAt) : null;
                const doneAt = inspection.date ? new Date(inspection.date) : (inspection.updatedAt ? new Date(inspection.updatedAt) : null);

                const { date: sentDate, time: sentTime } = this.formatDateTimeParts(sentAt, timeZone);
                const { date: doneDate, time: doneTime } = this.formatDateTimeParts(doneAt, timeZone);

                // Build human-readable responses with question texts
                let responsesText = '';
                if (Array.isArray(inspection.responses) && inspection.responses.length > 0) {
                    const parts = inspection.responses.map(r => {
                        const qText = (questionTextById && questionTextById[r.questionId]) || `Question ${r.questionId}`;
                        const status = r.passed === true ? 'Passed' : r.passed === false ? 'Failed' : 'N/A';
                        const comment = r.comment ? ` (${String(r.comment).replace(/\s+/g, ' ').trim()})` : '';
                        return `${qText}: ${status}${comment}`;
                    });
                    responsesText = parts.join(' | ');
                }

                const row = {
                    Employee: employeeName,
                    SentDate: sentDate,
                    SendTime: sentTime,
                    DoneDate: doneDate,
                    DoneTime: doneTime,
                    Restaurant: restaurantName,
                    Section: sectionName,
                    Status: inspection.status || 'Unknown',
                    Responses: responsesText
                };

                const values = headers.map(header => {
                    const value = row[header] || '';
                    const escaped = String(value).replace(/"/g, '""');
                    return `"${escaped}"`;
                });
                csvRows.push(values.join(','));
            });

            const csvContent = csvRows.join('\n');

            // Write CSV file
            await fs.writeFile(filePath, csvContent, 'utf8');
            console.log(`CSV file generated: ${filename}`);

            const csvUrl = `${this.baseUrl}/api/notifications/csv/download/${filename}`;

            return {
                filePath,
                filename,
                csvUrl,
                csvContent
            };

        } catch (error) {
            console.error('Error generating CSV content:', error);
            throw error;
        }
    }

    // Send email notification
    async sendEmailNotification(notification, reportResult, accountId = null) {
        try {
            const recipientEmails = await this.getRecipientEmails(notification.recipients, accountId);
            
            if (recipientEmails.length === 0) {
                console.log(`No email recipients found for notification "${notification.name}"`);
                return { success: false, error: 'No email recipients found' };
            }

            // Try email service first, fallback to webhook if not configured
            try {
                const emailResult = await emailService.sendReportNotification(notification, reportResult, recipientEmails);
                
                if (emailResult.success) {
                    console.log(`Email notification sent for "${notification.name}" to ${recipientEmails.length} recipients via email service`);
                    return { 
                        success: true, 
                        method: 'email_service',
                        messageId: emailResult.messageId,
                        recipientCount: recipientEmails.length 
                    };
                } else {
                    console.log(`Email service failed, trying webhook: ${emailResult.error}`);
                }
            } catch (emailError) {
                console.log(`Email service error, trying webhook: ${emailError.message}`);
            }

            // Fallback to webhook if email service fails or is not configured
            try {
                const payload = {
                    notificationName: notification.name,
                    recipients: recipientEmails,
                    csvUrl: reportResult.csvUrl,
                    filename: reportResult.filename,
                    recordCount: reportResult.recordCount,
                    generatedAt: new Date().toISOString(),
                    frequency: notification.frequency,
                    csvContent: reportResult.csvContent,
                    dateRange: notification.filters.dateRange,
                    restaurants: notification.filters.restaurants === 'all' ? 'All Restaurants' : 
                               `${notification.filters.selectedRestaurants.length} specific restaurants`,
                    sections: notification.filters.sections === 'all' ? 'All Sections' : 
                             `${notification.filters.selectedSections.length} specific sections`
                };

                const response = await axios.post(this.emailWebhookUrl, payload, {
                    timeout: 30000
                });

                console.log(`Email notification sent for "${notification.name}" to ${recipientEmails.length} recipients via webhook`);
                return { success: true, method: 'webhook', response: response.status, recipientCount: recipientEmails.length };
            } catch (webhookError) {
                console.error(`Webhook also failed: ${webhookError.message}`);
                return { 
                    success: false, 
                    error: `Both email service and webhook failed. Email: ${emailError?.message || 'unknown'}, Webhook: ${webhookError.message}`,
                    recipientCount: recipientEmails.length 
                };
            }

        } catch (error) {
            console.error(`Email notification failed for "${notification.name}":`, error.message);
            return { success: false, error: error.message };
        }
    }

    // Send WhatsApp notification
    async sendWhatsappNotification(notification, reportResult, accountId = null) {
        try {
            const recipientPhones = await this.getRecipientPhones(notification.recipients, accountId);
            
            if (recipientPhones.length === 0) {
                console.log(`No WhatsApp recipients found for notification "${notification.name}"`);
                return { success: false, error: 'No WhatsApp recipients found' };
            }

            const message = `📊 *${notification.name}*\n\n` +
                          `📁 Records: ${reportResult.recordCount}\n` +
                          `📅 Date Range: Last ${notification.filters.dateRange} days\n` +
                          `🏪 Restaurants: ${notification.filters.restaurants === 'all' ? 'All' : notification.filters.selectedRestaurants.length + ' specific'}\n` +
                          `📋 Sections: ${notification.filters.sections === 'all' ? 'All' : notification.filters.selectedSections.length + ' specific'}\n\n` +
                          `🔗 Download Report: ${reportResult.csvUrl}\n\n` +
                          `Generated: ${new Date().toLocaleString()}`;

            // Try to send via WhatsApp API first
            let successCount = 0;
            let errors = [];

            for (const phone of recipientPhones) {
                try {
                    await sendMessage(phone, message);
                    successCount++;
                    console.log(`WhatsApp message sent to ${phone}`);
                } catch (phoneError) {
                    console.error(`Failed to send WhatsApp message to ${phone}:`, phoneError.message);
                    errors.push({ phone, error: phoneError.message });
                }
            }

            if (successCount > 0) {
                console.log(`WhatsApp notification sent for "${notification.name}" to ${successCount}/${recipientPhones.length} recipients`);
                return { 
                    success: true, 
                    method: 'whatsapp_api',
                    recipientCount: successCount,
                    totalRecipients: recipientPhones.length,
                    errors: errors.length > 0 ? errors : undefined
                };
            } else {
                // Fallback to webhook if all direct sends fail
                const payload = {
                    notificationName: notification.name,
                    recipients: recipientPhones,
                    csvUrl: reportResult.csvUrl,
                    filename: reportResult.filename,
                    recordCount: reportResult.recordCount,
                    generatedAt: new Date().toISOString(),
                    frequency: notification.frequency,
                    message: message
                };
                console.log(this.whatsappWebhookUrl)


                const response = await axios.post(this.whatsappWebhookUrl, payload, {
                    timeout: 3000
                });
                console.log(`WhatsApp notification sent for "${notification.name}" to ${recipientPhones.length} recipients via webhook`);
                return { success: true, method: 'webhook', response: response.status, recipientCount: recipientPhones.length };
            }

        } catch (error) {
            console.error(`WhatsApp notification failed for "${notification.name}":`, error.message);
            return { success: false, error: error.message };
        }
    }

    async generateCsvManually(sendWebhook = false, filters = null) {
    try {
        console.log(`Generating CSV manually (sendWebhook: ${sendWebhook})`);

        // Create a default notification configuration for manual generation
        const defaultNotification = {
            name: 'inspection_report',
            filters: filters || {
                dateRange: 30, // Last 30 days by default
                restaurants: 'all',
                sections: 'all',
                selectedRestaurants: [],
                selectedSections: []
            },
            channels: {
                email: sendWebhook,
                whatsapp: false
            },
            recipients: {
                super_admin: sendWebhook,
                owner: false,
                district_manager: false,
                general_manager: false,
                employee: false
            }
        };

        // Generate the report
        const reportResult = await this.generateReport(defaultNotification);

        if (!reportResult.success) {
            return {
                success: false,
                message: reportResult.message || 'No data found for the specified criteria',
                recordCount: 0
            };
        }

        let webhookSent = false;
        let webhookUrl = null;

        // Send webhook notifications if requested
        if (sendWebhook) {
            try {
                if (defaultNotification.channels.email) {
                    const emailResult = await this.sendEmailNotification(defaultNotification, reportResult);
                    webhookSent = emailResult.success;
                    webhookUrl = this.emailWebhookUrl;
                }
            } catch (webhookError) {
                console.error('Error sending webhook:', webhookError);
                // Don't fail the entire operation if webhook fails
            }
        }

        return {
            success: true,
            message: 'CSV generated successfully',
            csvUrl: reportResult.csvUrl,
            filename: reportResult.filename,
            recordCount: reportResult.recordCount,
            generatedAt: new Date().toISOString(),
            webhookSent,
            webhookUrl
        };

    } catch (error) {
        console.error('Error generating CSV manually:', error);
        return {
            success: false,
            error: error.message,
            message: 'Failed to generate CSV manually'
        };
    }
}

    // Get recipient emails from actual user data
    async getRecipientEmails(recipients, accountId) {
        try {
            const userModule = require('../models/usersModel');
            const emails = [];
            
            // Get users by role
            for (const [role, selected] of Object.entries(recipients)) {
                if (selected) {
                    // map report roles to user.role values
                    const roleMap = {
                        super_admin: 'superadmin',
                        owner: 'owner',
                        district_manager: 'districtmanager',
                        general_manager: 'generalmanager',
                        employee: 'employee' // if exists
                    };
                    const userRole = roleMap[role] || role;
                    const criteria = { role: userRole,
                                       accountID: accountId  };
                    // if (accountId) {
                    //     criteria.accountID = accountId;
                    // }
                    const users = await userModule.find(criteria).select('email');
                    users.forEach(user => {
                        if (user.email) emails.push(user.email);
                    });
                }
            }
            
            return emails;
        } catch (error) {
            console.error('Error getting recipient emails:', error);
            // Fallback to mock data if database query fails
            const emails = [];
            if (recipients.super_admin) emails.push('superadmin@company.com');
            if (recipients.owner) emails.push('owner@company.com');
            if (recipients.district_manager) emails.push('dm@company.com');
            if (recipients.general_manager) emails.push('gm@company.com');
            if (recipients.employee) emails.push('employee@company.com');
            return emails;
        }
    }

    // Get recipient phone numbers from actual user data
    async getRecipientPhones(recipients, accountId) {
        try {
            const userModule = require('../models/usersModel');
            const phones = [];
            
            // Get users by role
            for (const [role, selected] of Object.entries(recipients)) {
                if (selected) {
                    const roleMap = {
                        super_admin: 'superadmin',
                        owner: 'owner',
                        district_manager: 'districtmanager',
                        general_manager: 'generalmanager',
                        employee: 'employee'
                    };
                    const userRole = roleMap[role] || role;
                    const criteria = { role: userRole };
                    if (accountId) {
                        criteria.accountID = accountId;
                    }
                    const users = await userModule.find(criteria).select('phone');
                    users.forEach(user => {
                        if (user.phone) phones.push(user.phone);
                    });
                }
            }
            
            return phones;
        } catch (error) {
            console.error('Error getting recipient phones:', error);
            // Fallback to mock data if database query fails
            const phones = [];
            if (recipients.super_admin) phones.push('+1234567890');
            if (recipients.owner) phones.push('+1234567891');
            if (recipients.district_manager) phones.push('+1234567892');
            if (recipients.general_manager) phones.push('+1234567893');
            if (recipients.employee) phones.push('+1234567894');
            return phones;
        }
    }

    // Add or update a notification schedule
    async addOrUpdateNotification(notification) {
        try {
            if (notification.active) {
                await this.scheduleNotification(notification);
            } else {
                this.stopNotificationJob(notification._id);
            }
            console.log(`Notification "${notification.name}" ${notification.active ? 'scheduled' : 'stopped'}`);
        } catch (error) {
            console.error(`Error updating notification "${notification.name}":`, error);
        }
    }

    // Remove a notification schedule
    stopNotificationJob(notificationId) {
        const jobId = notificationId.toString();
        if (this.scheduledJobs.has(jobId)) {
            this.scheduledJobs.get(jobId).destroy();
            this.scheduledJobs.delete(jobId);
            console.log(`Stopped notification job: ${jobId}`);
        }
    }

    // Manually trigger a notification
    async triggerNotificationManually(notificationId) {
        try {
            console.log(`Manually triggering notification: ${notificationId}`);
            const result = await this.executeNotification(notificationId);
            return result;
        } catch (error) {
            console.error(`Error manually triggering notification ${notificationId}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Get service status
    async csvStatus (req, res){
    try {
        const serviceStatus = notificationSchedulerService.getStatus();
        
        // Get active notifications count
        const activeNotificationsCount = await ReportNotification.countDocuments({ active: true });
        
        res.json({
            success: true,
            service: serviceStatus,
            statistics: {
                activeNotifications: activeNotificationsCount,
                scheduledJobs: serviceStatus.scheduledNotifications
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
    getStatus() {
        return {
            initialized: this.initialized,
            scheduledNotifications: this.scheduledJobs.size,
            reportsFolder: this.reportsFolder,
            baseUrl: this.baseUrl,
            emailWebhookUrl: this.emailWebhookUrl,
            whatsappWebhookUrl: this.whatsappWebhookUrl,
            activeJobs: Array.from(this.scheduledJobs.keys())
        };
    }

    // Stop all scheduled jobs
    stopAll() {
        for (const [jobId, job] of this.scheduledJobs) {
            job.destroy();
        }
        this.scheduledJobs.clear();
        console.log('All notification jobs stopped');
    }
}

// Create singleton instance
const notificationSchedulerService = new NotificationSchedulerService();

module.exports = {
    NotificationSchedulerService,
    notificationSchedulerService,
    default: notificationSchedulerService
};