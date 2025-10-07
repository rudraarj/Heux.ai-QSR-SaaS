const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv')
dotenv.config()

class EmailService {
    constructor() {
        // Check if email credentials are available
        this.isConfigured = !!(process.env.NODE_CODE_SENDING_EMAIL_ADDRESS && process.env.NODE_CODE_SENDING_EMAIL_PASSWORD);
        
        if (this.isConfigured) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
                    pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
                },
            });
        } else {
            console.warn('Email service not configured: Missing NODE_CODE_SENDING_EMAIL_ADDRESS or NODE_CODE_SENDING_EMAIL_PASSWORD');
        }
    }

    // Send report notification email
    async sendReportNotification(notification, reportResult, recipientEmails) {
        try {
            if (!this.isConfigured) {
                throw new Error('Email service not configured. Please set NODE_CODE_SENDING_EMAIL_ADDRESS and NODE_CODE_SENDING_EMAIL_PASSWORD environment variables.');
            }

            if (!recipientEmails || recipientEmails.length === 0) {
                throw new Error('No email recipients provided');
            }

        const emailTemplate = this.generateEmailTemplate(notification, reportResult);
        
        const mailOptions = {
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: recipientEmails.join(', '),
            subject: `📊 ${notification.name} - Inspection Report${reportResult.isEmpty ? ' (Empty)' : ''}`,
            html: emailTemplate,
            attachments: reportResult.filePath ? [
                {
                    filename: reportResult.filename,
                    path: reportResult.filePath,
                    contentType: 'text/csv'
                }
            ] : []
        };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent successfully: ${result.messageId}`);
            
            return {
                success: true,
                messageId: result.messageId,
                recipientCount: recipientEmails.length
            };

        } catch (error) {
            console.error('Error sending email notification:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate HTML email template
    generateEmailTemplate(notification, reportResult) {
        const currentDate = new Date().toLocaleString();
        const dateRange = notification.filters.dateRange;
        const restaurantInfo = notification.filters.restaurants === 'all' 
            ? 'All Restaurants' 
            : `${notification.filters.selectedRestaurants.length} specific restaurants`;
        const sectionInfo = notification.filters.sections === 'all' 
            ? 'All Sections' 
            : `${notification.filters.selectedSections.length} specific sections`;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inspection Report - ${notification.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
        }
        .report-info {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #4a5568;
        }
        .info-value {
            color: #2d3748;
        }
        .download-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #e6fffa;
            border-radius: 8px;
            border: 2px solid #38b2ac;
        }
        .download-btn {
            display: inline-block;
            background-color: #38b2ac;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px;
            transition: background-color 0.3s;
        }
        .download-btn:hover {
            background-color: #319795;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #666;
            font-size: 14px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background-color: #3b82f6;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ${notification.name}</h1>
            <p>Automated Inspection Report</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${reportResult.recordCount}</div>
                <div class="stat-label">Total Records</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${dateRange}</div>
                <div class="stat-label">Days Covered</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${notification.frequency}</div>
                <div class="stat-label">Frequency</div>
            </div>
            <div class="stat-card" style="background-color: #10b981;">
                <div class="stat-number">${reportResult.passedCount ?? 0}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card" style="background-color: #f59e0b;">
                <div class="stat-number">${reportResult.attentionCount ?? 0}</div>
                <div class="stat-label">Needs Attention</div>
            </div>
        </div>
        
        ${reportResult.isEmpty ? `
        <div class="empty-report" style="background-color: #fef3cd; border: 1px solid #f6d55c; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ No Data Found</h3>
            <p style="color: #856404; margin: 0;">No inspection data was found for the selected criteria. This could be due to:</p>
            <ul style="color: #856404; text-align: left; margin: 10px 0;">
                <li>No inspections conducted in the selected date range</li>
                <li>No inspections for the selected restaurants/sections</li>
                <li>Data not yet available for the specified period</li>
            </ul>
        </div>
        ` : ''}

        <div class="report-info">
            <h3 style="margin-top: 0; color: #3b82f6;">📋 Report Details</h3>
            <div class="info-row">
                <span class="info-label">Report Name:</span>
                <span class="info-value">${notification.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Generated:</span>
                <span class="info-value">${currentDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date Range:</span>
                <span class="info-value">Last ${dateRange} days</span>
            </div>
            <div class="info-row">
                <span class="info-label">Restaurants:</span>
                <span class="info-value">${restaurantInfo}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Sections:</span>
                <span class="info-value">${sectionInfo}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Total Records:</span>
                <span class="info-value">${reportResult.recordCount} inspections</span>
            </div>
            <div class="info-row">
                <span class="info-label">Passed:</span>
                <span class="info-value">${reportResult.passedCount ?? 0}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Needs Attention:</span>
                <span class="info-value">${reportResult.attentionCount ?? 0}</span>
            </div>
        </div>

        ${reportResult.filePath ? `
        <div class="download-section">
            <h3 style="margin-top: 0; color: #2d3748;">📁 Download Report</h3>
            <p>Click the button below to download the complete inspection report in CSV format:</p>
            <a href="${reportResult.csvUrl}" class="download-btn">
                📥 Download CSV Report
            </a>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                File: ${reportResult.filename}
            </p>
        </div>
        ` : `
        <div class="download-section" style="background-color: #f8f9fa; border: 1px solid #dee2e6;">
            <h3 style="margin-top: 0; color: #6c757d;">📁 No Report Available</h3>
            <p style="color: #6c757d;">No CSV file was generated as no inspection data was found for the selected criteria.</p>
        </div>
        `}

        <div class="footer">
            <p>This is an automated report generated by the ProInspection system.</p>
            <p>If you have any questions, please contact your system administrator.</p>
            <p style="font-size: 12px; color: #999;">
                Generated on ${currentDate}
            </p>
        </div>
    </div>
</body>
</html>
        `;
    }

    // Send simple text email (fallback)
    async sendSimpleEmail(recipientEmails, subject, text) {
        try {
            const mailOptions = {
                from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
                to: recipientEmails.join(', '),
                subject: subject,
                text: text
            };

            const result = await this.transporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: result.messageId
            };
        } catch (error) {
            console.error('Error sending simple email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Test email configuration
    async testConnection() {
        try {
            if (!this.isConfigured) {
                return { 
                    success: false, 
                    error: 'Email service not configured. Please set NODE_CODE_SENDING_EMAIL_ADDRESS and NODE_CODE_SENDING_EMAIL_PASSWORD environment variables.' 
                };
            }
            
            await this.transporter.verify();
            console.log('Email service connection verified');
            return { success: true };
        } catch (error) {
            console.error('Email service connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Get configuration status
    getConfigurationStatus() {
        return {
            isConfigured: this.isConfigured,
            hasEmailAddress: !!process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            hasPassword: !!process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
            emailAddress: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS ? 
                process.env.NODE_CODE_SENDING_EMAIL_ADDRESS.replace(/(.{2}).*(@.*)/, '$1***$2') : 'Not set'
        };
    }
}

module.exports = new EmailService();
