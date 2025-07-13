const { notificationLogRepo } = require("../../src/data/mockData");

const notificationController = {
    sendNotification: async (req, res) => {
        const { userId, type, message, email, phone } = req.body;
        console.log(`[Notification Service] Received request to send ${type} to user ${userId || 'N/A'} : ${message} `);
        
        const simulateFailureRate = parseFloat(process.env.SIMULATE_FAILURE_RATE || '0');
        if (Math.random() < simulateFailureRate) {
            console.warn(`[Notification Service] Simulating failure for ${type} to ${userId}.`);
            await notificationLogRepo.addNotification({
                userId, type, message, status: 'failed', error: 'Simulated failure'    
            });
            return res.status(500).json({status: 'failed', message: `Simulated failure for ${type} notification`});
        }

        try {
            await notificationLogRepo.addNotification({
                userId, type, message, status: 'success', email, phone
            })
            console.log(`[Notification Service] Successfully processed ${type} for user ${userId}.`);
            res.status(200).json({status: 'success', message: `${type} notification sent successfully (mock).`})
        }catch (err) {
            console.error(`[Notification Service] Error logging notification: ${err.message}`);
            res.status(500).json({status: 'failed', message: `Internal error logging notification: ${err.message}.`})
        }
    }
}

module.exports = notificationController;