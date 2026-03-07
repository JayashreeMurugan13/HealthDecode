// Client-side data storage for user-specific data
export const clientData = {
  // Get current user ID
  getCurrentUserId: () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  // Store user reports
  saveReport: (reportData: any) => {
    const userId = clientData.getCurrentUserId();
    if (!userId) return false;

    const key = `reports_${userId}`;
    const reports = JSON.parse(localStorage.getItem(key) || '[]');
    
    const newReport = {
      ...reportData,
      id: Date.now().toString(),
      userId,
      uploadDate: new Date().toISOString()
    };
    
    reports.push(newReport);
    localStorage.setItem(key, JSON.stringify(reports));
    return newReport;
  },

  // Get user reports
  getReports: () => {
    const userId = clientData.getCurrentUserId();
    if (!userId) return [];

    const key = `reports_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  // Delete report
  deleteReport: (reportId: string) => {
    const userId = clientData.getCurrentUserId();
    if (!userId) return false;

    const key = `reports_${userId}`;
    const reports = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = reports.filter((r: any) => r.id !== reportId);
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  },

  // Store health metrics
  saveHealthMetric: (metricData: any) => {
    const userId = clientData.getCurrentUserId();
    if (!userId) return false;

    const key = `health_metrics_${userId}`;
    const metrics = JSON.parse(localStorage.getItem(key) || '[]');
    
    const newMetric = {
      ...metricData,
      id: Date.now().toString(),
      userId,
      date: new Date().toISOString()
    };
    
    metrics.push(newMetric);
    localStorage.setItem(key, JSON.stringify(metrics));
    return newMetric;
  },

  // Get health metrics
  getHealthMetrics: (type?: string) => {
    const userId = clientData.getCurrentUserId();
    if (!userId) return [];

    const key = `health_metrics_${userId}`;
    const metrics = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (type) {
      return metrics.filter((m: any) => m.type === type);
    }
    return metrics;
  },

  // Store chat messages
  saveChatMessage: (message: any) => {
    const userId = clientData.getCurrentUserId();
    if (!userId) return false;

    const key = `chat_messages_${userId}`;
    const messages = JSON.parse(localStorage.getItem(key) || '[]');
    
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      userId,
      createdAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    localStorage.setItem(key, JSON.stringify(messages));
    return newMessage;
  },

  // Get chat messages
  getChatMessages: () => {
    const userId = clientData.getCurrentUserId();
    if (!userId) return [];

    const key = `chat_messages_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
};