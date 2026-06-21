let notifications = [];

export const notificationService = {
  getNotifications: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Return sorted by newest first
        const sorted = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(sorted);
      }, 200);
    });
  },

  addNotification: (notificationData) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notificationData
    };
    notifications.push(newNotification);
    return newNotification;
  },

  markAsRead: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = notifications.findIndex(n => n.id === parseInt(id));
        if (index !== -1) {
          notifications[index].read = true;
          resolve(notifications[index]);
        } else {
          reject(new Error('Notification not found'));
        }
      }, 100);
    });
  },

  markAllAsRead: async () => {
    return new Promise(resolve => {
      setTimeout(() => {
        notifications = notifications.map(n => ({ ...n, read: true }));
        resolve(notifications);
      }, 300);
    });
  }
};
