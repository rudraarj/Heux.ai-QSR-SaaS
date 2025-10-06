// notificationScheduler.js - Updated with hourly CSV service integration
const cron = require('node-cron');
const notificationModule = require('../models/notificationModule');

class NotificationScheduler {
    constructor() {
        this.scheduledJobs = new Map();
        this.initialized = false;
        this.triggerNotificationFn = null;
    }

    // Initialize the scheduler with the trigger function
    async init(triggerNotificationFunction = null) {
        if (this.initialized) return;
        
        try {
            console.log('Initializing notification scheduler...');
            
            // Set the trigger function if provided
            if (triggerNotificationFunction) {
                this.triggerNotificationFn = triggerNotificationFunction;
            }
            
            // Initialize the hourly CSV service
            
            await this.loadActiveNotifications();
            this.initialized = true;
            console.log('Notification scheduler initialized successfully');
        } catch (error) {
            console.error('Error initializing notification scheduler:', error);
            throw error;
        }
    }

    // Set the trigger function after initialization
    setTriggerFunction(triggerNotificationFunction) {
        this.triggerNotificationFn = triggerNotificationFunction;
    }

    // Ensure initialization before any operation
    async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
    }

    // Load all active notifications from database and schedule them
    async loadActiveNotifications() {
        try {
            const activeNotifications = await notificationModule.find({ isActive: true });
            console.log(`Loading ${activeNotifications.length} active notifications`);
            
            for (const notification of activeNotifications) {
                this.scheduleNotification(notification);
            }
        } catch (error) {
            console.error('Error loading active notifications:', error);
        }
    }

    // Schedule a single notification
    scheduleNotification(notification) {
        try {
            const cronExpression = this.generateCronExpression(notification);
            
            if (this.scheduledJobs.has(notification.id)) {
                // If job already exists, destroy it first
                this.cancelNotification(notification.id);
            }

            const job = cron.schedule(cronExpression, async () => {
                console.log(`Executing scheduled notification: ${notification.id}`);
                await this.executeNotification(notification);
            }, {
                scheduled: true,
                timezone: notification.timeZone || 'America/Toronto'
            });

            this.scheduledJobs.set(notification.id, job);
            console.log(`Scheduled notification ${notification.id} with cron: ${cronExpression} in timezone: ${notification.timeZone}`);
            
        } catch (error) {
            console.error(`Error scheduling notification ${notification.id}:`, error);
        }
    }

    // Generate cron expression based on notification settings
    generateCronExpression(notification) {
        const [hours, minutes] = notification.time.split(':').map(Number);
        
        if (notification.frequency === 'daily') {
            // Daily: run every day at specified time
            return `${minutes} ${hours} * * *`;
        } else if (notification.frequency === 'alternate') {
            // Alternate days: run every other day at specified time
            return `${minutes} ${hours} */2 * *`;
        }
        
        throw new Error(`Unsupported frequency: ${notification.frequency}`);
    }

    // Execute the notification
    async executeNotification(notification) {
        try {
            console.log(`Triggering notification for section: ${notification.sectionId}`);
            
            if (!this.triggerNotificationFn) {
                console.warn('triggerNotification function not available, skipping execution');
                return;
            }
            
            // Create a mock request object for the existing triggerNotification function
            const mockReq = {
                body: {
                    restaurantId: notification.restaurantId,
                    sectionId: notification.sectionId
                },
                userId: notification.userId
            };

            const mockRes = {
                status: (code) => ({
                    json: (data) => {
                        console.log(`Notification response [${code}]:`, data);
                        return data;
                    }
                })
            };

            // Call the triggerNotification function
            await this.triggerNotificationFn(mockReq, mockRes);
            
            // Update last triggered time in database
            await this.updateLastTriggered(notification.id);
            
        } catch (error) {
            console.error(`Error executing notification ${notification.id}:`, error);
        }
    }

    // Update last triggered time
    async updateLastTriggered(notificationId) {
        try {
            await notificationModule.findOneAndUpdate(
                { id: notificationId },
                { 
                    lastTriggered: new Date(),
                    updatedAt: new Date()
                }
            );
        } catch (error) {
            console.error(`Error updating last triggered time for ${notificationId}:`, error);
        }
    }

    // Cancel a scheduled notification
    cancelNotification(notificationId) {
        const job = this.scheduledJobs.get(notificationId);
        if (job) {
            job.destroy();
            this.scheduledJobs.delete(notificationId);
            console.log(`Cancelled notification: ${notificationId}`);
            return true;
        }
        return false;
    }

    // Add a new notification to the scheduler
    async addNotification(notificationData) {
        await this.ensureInitialized();
        
        try {
            console.log('Adding notification with data:', notificationData);
            
            // Create new notification instance
            const notification = new notificationModule(notificationData);
            
            // Save to database
            const savedNotification = await notification.save();
            console.log('Notification saved successfully:', savedNotification);
            
            // Schedule if active
            if (savedNotification.isActive) {
                this.scheduleNotification(savedNotification);
            }
            
            return savedNotification;
        } catch (error) {
            console.error('Error adding notification:', error);
            throw error;
        }
    }

    // Delete a notification
    async deleteNotification(notificationId) {
        await this.ensureInitialized();
        
        try {
            console.log(`Deleting notification: ${notificationId}`);
            
            // Cancel scheduled job
            this.cancelNotification(notificationId);
            
            // Delete from database
            const result = await notificationModule.findOneAndDelete({ id: notificationId });
            console.log('Notification deleted from database:', result ? 'Success' : 'Not found');
            
            return result;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
}

// Create singleton instance
const scheduler = new NotificationScheduler();

// Export both the class and initialized instance
module.exports = {
    NotificationScheduler,
    scheduler,
    // For backward compatibility, export the instance as default
    default: scheduler
};