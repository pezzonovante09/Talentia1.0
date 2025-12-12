// Analytics system for tracking errors and performance

const ANALYTICS_KEY = "talentia_analytics";

/**
 * Save error record to analytics
 * @param {object} errorRecord - { task, taskType, correctAnswer, userAnswer, islandId, timestamp }
 */
export function saveErrorRecord(errorRecord) {
  try {
    const analytics = loadAnalytics();
    analytics.errorHistory = analytics.errorHistory || [];
    
    // Add new error record
    analytics.errorHistory.push({
      ...errorRecord,
      timestamp: errorRecord.timestamp || new Date().toISOString()
    });
    
    // Keep only last 100 errors
    if (analytics.errorHistory.length > 100) {
      analytics.errorHistory = analytics.errorHistory.slice(-100);
    }
    
    // Update task type statistics
    analytics.taskTypeStats = analytics.taskTypeStats || {};
    const taskType = errorRecord.taskType || "unknown";
    if (!analytics.taskTypeStats[taskType]) {
      analytics.taskTypeStats[taskType] = { total: 0, errors: 0 };
    }
    analytics.taskTypeStats[taskType].total += 1;
    analytics.taskTypeStats[taskType].errors += 1;
    
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (e) {
    console.error("Error saving analytics:", e);
  }
}

/**
 * Save successful task completion
 * @param {object} taskRecord - { task, taskType, correctAnswer, islandId, timestamp }
 */
export function saveSuccessRecord(taskRecord) {
  try {
    const analytics = loadAnalytics();
    
    // Update task type statistics
    analytics.taskTypeStats = analytics.taskTypeStats || {};
    const taskType = taskRecord.taskType || "unknown";
    if (!analytics.taskTypeStats[taskType]) {
      analytics.taskTypeStats[taskType] = { total: 0, errors: 0 };
    }
    analytics.taskTypeStats[taskType].total += 1;
    
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (e) {
    console.error("Error saving analytics:", e);
  }
}

/**
 * Load analytics data
 */
export function loadAnalytics() {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) {
      return {
        errorHistory: [],
        taskTypeStats: {},
        sessionHistory: []
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading analytics:", e);
    return {
      errorHistory: [],
      taskTypeStats: {},
      sessionHistory: []
    };
  }
}

/**
 * Save session summary
 * @param {object} sessionData - { islandId, mistakes, tasksCompleted, timestamp }
 */
export function saveSessionSummary(sessionData) {
  try {
    const analytics = loadAnalytics();
    analytics.sessionHistory = analytics.sessionHistory || [];
    
    analytics.sessionHistory.push({
      ...sessionData,
      timestamp: sessionData.timestamp || new Date().toISOString()
    });
    
    // Keep only last 50 sessions
    if (analytics.sessionHistory.length > 50) {
      analytics.sessionHistory = analytics.sessionHistory.slice(-50);
    }
    
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (e) {
    console.error("Error saving session:", e);
  }
}

/**
 * Get error rate by task type
 */
export function getErrorRateByType() {
  const analytics = loadAnalytics();
  const stats = analytics.taskTypeStats || {};
  const result = {};
  
  for (const [type, data] of Object.entries(stats)) {
    if (data.total > 0) {
      result[type] = {
        errorRate: (data.errors / data.total) * 100,
        total: data.total,
        errors: data.errors
      };
    }
  }
  
  return result;
}

/**
 * Get recent errors (last N)
 */
export function getRecentErrors(limit = 20) {
  const analytics = loadAnalytics();
  const errors = analytics.errorHistory || [];
  return errors.slice(-limit).reverse();
}

/**
 * Reset all analytics data
 */
export function resetAnalytics() {
  try {
    const defaultAnalytics = {
      errorHistory: [],
      taskTypeStats: {},
      sessionHistory: []
    };
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(defaultAnalytics));
  } catch (e) {
    console.error("Error resetting analytics:", e);
  }
}

