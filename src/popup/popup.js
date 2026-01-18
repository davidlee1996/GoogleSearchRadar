class TaskRadarPopup {
  constructor() {
    this.tasks = [];
    this.init();
  }

  async init() {
    await this.loadTasks();
    this.renderTasks();
    this.setupEventListeners();
  }

  async loadTasks() {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TASKS' });
    this.tasks = response || [];
  }

  renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    const emptyState = document.getElementById('empty-state');
    const totalTasks = document.getElementById('total-tasks');
    const pendingTasks = document.getElementById('pending-tasks');
    
    // Update stats
    totalTasks.textContent = this.tasks.length;
    const pendingCount = this.tasks.filter(task => !task.completed).length;
    pendingTasks.textContent = pendingCount;
    
    // Clear existing tasks
    tasksList.innerHTML = '';
    
    if (this.tasks.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort tasks: pending first, then by creation date
    const sortedTasks = [...this.tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Render each task
    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      tasksList.appendChild(taskElement);
    });
  }

  createTaskElement(task) {
    const element = document.createElement('div');
    element.className = `task-item ${task.completed ? 'task-completed' : ''}`;
    
    // Format date
    const date = new Date(task.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    // Format time
    const hours = Math.floor(task.estimatedTime / 60);
    const minutes = task.estimatedTime % 60;
    let timeText = '';
    if (hours > 0) {
      timeText += `${hours}h `;
    }
    if (minutes > 0) {
      timeText += `${minutes}m`;
    }
    
    element.innerHTML = `
      <div class="task-header">
        <div class="task-title">${task.title}</div>
        <div class="task-category">${task.category}</div>
      </div>
      <div class="task-details">
        <div>${task.query}</div>
        <div class="task-time">
          <span>⏱️ ${timeText}</span>
          <span>•</span>
          <span>📅 ${formattedDate}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn task-btn-complete" data-task-id="${task.id}">
          ${task.completed ? 'Undo' : 'Complete'}
        </button>
        <button class="task-btn task-btn-delete" data-task-id="${task.id}">
          Delete
        </button>
      </div>
    `;
    
    // Add event listeners to buttons
    element.querySelector('.task-btn-complete').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTaskCompletion(task.id);
    });
    
    element.querySelector('.task-btn-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteTask(task.id);
    });
    
    // Click on task to view details (future enhancement)
    element.addEventListener('click', () => {
      this.viewTaskDetails(task);
    });
    
    return element;
  }

  async toggleTaskCompletion(taskId) {
    await chrome.runtime.sendMessage({
      type: 'COMPLETE_TASK',
      taskId: taskId
    });
    await this.loadTasks();
    this.renderTasks();
  }

  async deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      await chrome.runtime.sendMessage({
        type: 'DELETE_TASK',
        taskId: taskId
      });
      await this.loadTasks();
      this.renderTasks();
    }
  }

  viewTaskDetails(task) {
    // Future enhancement: Show detailed modal
    console.log('View task details:', task);
    // For now, just log to console
  }

  setupEventListeners() {
    // Clear completed tasks
    document.getElementById('clear-completed').addEventListener('click', async () => {
      if (confirm('Clear all completed tasks?')) {
        const completedTasks = this.tasks.filter(task => task.completed);
        for (const task of completedTasks) {
          await chrome.runtime.sendMessage({
            type: 'DELETE_TASK',
            taskId: task.id
          });
        }
        await this.loadTasks();
        this.renderTasks();
      }
    });
    
    // Export tasks
    document.getElementById('export-tasks').addEventListener('click', () => {
      this.exportTasks();
    });
  }

  exportTasks() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', () => {
  new TaskRadarPopup();
});