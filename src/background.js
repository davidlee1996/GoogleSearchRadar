// Task database and core logic
class TaskManager {
  constructor() {
    this.tasks = [];
    this.loadTasks();
  }

  async loadTasks() {
    const data = await chrome.storage.local.get(['tasks']);
    this.tasks = data.tasks || [];
  }

  async saveTasks() {
    await chrome.storage.local.set({ tasks: this.tasks });
  }

  async addTask(taskData) {
    const task = {
      id: Date.now().toString(),
      title: taskData.title,
      query: taskData.query,
      links: taskData.links || [],
      estimatedTime: taskData.estimatedTime || 60, // minutes
      category: taskData.category || 'general',
      createdAt: new Date().toISOString(),
      completed: false
    };
    
    this.tasks.push(task);
    await this.saveTasks();
    return task;
  }

  async markCompleted(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
      task.completedAt = new Date().toISOString();
      await this.saveTasks();
    }
  }

  async deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    await this.saveTasks();
  }

  getTasks() {
    return this.tasks;
  }
}

// Initialize task manager
const taskManager = new TaskManager();

// Communication with content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'DETECTED_SEARCH':
      handleDetectedSearch(request.data, sender.tab.id);
      break;
    case 'CREATE_TASK':
      createTask(request.data, sendResponse);
      return true; // Required for async response
    case 'GET_TASKS':
      sendResponse(taskManager.getTasks());
      break;
    case 'COMPLETE_TASK':
      taskManager.markCompleted(request.taskId);
      sendResponse({ success: true });
      break;
    case 'DELETE_TASK':
      taskManager.deleteTask(request.taskId);
      sendResponse({ success: true });
      break;
  }
});

async function createTask(data, sendResponse) {
  const task = await taskManager.addTask(data);
  sendResponse({ success: true, task });
}

async function handleDetectedSearch(searchData, tabId) {
  // Store the detected search for this tab
  await chrome.storage.session.set({
    [`pendingTask_${tabId}`]: {
      ...searchData,
      timestamp: Date.now()
    }
  });
  
  // Show notification to user
  await chrome.action.setBadgeText({
    text: '!',
    tabId: tabId
  });
  await chrome.action.setBadgeBackgroundColor({
    color: '#4285f4',
    tabId: tabId
  });
}