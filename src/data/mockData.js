const bcrypt = require('bcrypt');

const { v4: uuidv4 } = require("uuid");

let users = [];
let auditLogs = [];
let notificationLog = [];

const initMockData = async () => {
    users = [];
    auditLogs = [];
    notificationLog = [];

    const adminPasswordHash = await bcrypt.hash('123456789', 10);
    const userPasswordHash = await bcrypt.hash('123456789', 10);

    users.push({
        id: '1',
        email: 'admin@example.com',
        password: adminPasswordHash,
        role: 'admin',
        profile: { name: 'Admin User', phone: '+1234567890' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    users.push({
        id: '2',
        email: 'user@example.com',
        password: userPasswordHash,
        role: 'user',
        profile: { name: 'Normal User', phone: '+1987654321' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    auditLogs.push(
        {
            userId: '1',
            action: 'login',
            timestamp: new Date().toISOString(),
            status: 'success',
            requestMeta: {}
        }
    );

    notificationLog.push(
        {
            userId: '2',
            type: 'email',
            message: 'Welcome!',
            timestamp: new Date().toISOString()
        }
    );

    console.log("Mock data initialized");
};

const userRepo = {
    findAll: async () => {
        return await users.map(user => ({ ...user }))
    },

    findById: async (id) => {
        const user = await users.find(u => u.id === id);
        return user ? { ...user } : null;
    },

    findByEmail: async (email) => {
        const user = await users.find(e => e.email === email);
        return user ? { ...user } : null;
    },

    create: async (userData) => {
        const newUser = {
            id: uuidv4(),
            ...userData,
            role: userData.role || 'user',
            profile: userData.profile || { name: '', phone: '' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        users.push(newUser);
        return { ...newUser };
    },

    findByIdAndUpdate: async (id, updateFields) => {
        let userIndex = await users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return null;
        };

        const userToUpdate = users[userIndex];
        const updatedUser = {
            ...userToUpdate,
            profile: {
                ...userToUpdate.profile,
                ...updateFields.profile
            },
            updatedAt: new Date().toISOString(),
        };

        if (updateFields.password) {
            updatedUser.password = updateFields.password;
        }

        if (updateFields.role) {
            updatedUser.role = updateFields.role;
        }

        users[userIndex] = updatedUser;
        return { ...updatedUser };
    },

    findByIdAndDelete: async (id) => {
        const initLength = users.length;
        const userToDelete = users.find(u => u.id === id);
        users = users.filter(u => u.id !== id);
        if (users.length < initLength) {
            return userToDelete ? { email: userToDelete.email } : { email: 'deleted_user_email' };
        }
        return null;
    }
};

const auditLogsRepo = {
    addLog: async (logEntry) => {
        const fullLogEntry = { ...logEntry, timestamp: new Date().toISOString() };
        auditLogs.push(fullLogEntry);
        console.log("Audit Log Added: ", fullLogEntry);
        return fullLogEntry;
    },

    getAllLog: async () => {
        return auditLogs.map(log => ({ ...log }));
    }
}

const notificationLogRepo = {
    addNotification: async (notificationEntry) => {
        const fullNotificationEntry = { ...notificationEntry, timestamp: new Date().toISOString() }
        notificationLog.push(fullNotificationEntry);
        console.log("Notification Log Added: ", fullNotificationEntry);
        return fullNotificationEntry;
    },

    getAllNotifications: async () => {
        return notificationLog.map(notif => ({ ...notif }));
    }
}

module.exports = {
    initMockData, userRepo,
    auditLogsRepo, notificationLogRepo
}