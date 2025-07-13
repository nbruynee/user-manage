const axios = require('axios');
const { auditLogsRepo } = require('../data/mockData');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8082/send';

const notificationSender = {
    sendNotification: async (userId, type, message, email = null, phone = null, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`[Backend Main] Attempt ${i + 1} to send ${type} notification to user ${userId}.`);
                await axios.post(NOTIFICATION_SERVICE_URL, { userId, type, message, email, phone });
                console.log(`[Backend Main] Notification sent successfully for user ${userId}.`);
                return;
            } catch (err) {
                console.error(`[Backend Main] Failed to send ${type} notification for user ${userId} (Attempt ${i + 1}/${retries}): ${err.message}`);
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error(`[Backend Main] Max retries reached for ${type} notification to user ${userId}. Giving up.`);
                    await auditLogsRepo.addLog({
                        userId,
                        action: `notification_failed_${type}`,
                        status: 'failed',
                        requestMeta: { message: `Failed to send ${type} notification after ${retries} attempts`, error: err.message }
                    });
                }
            }
        }
    }
}
module.exports = notificationSender;