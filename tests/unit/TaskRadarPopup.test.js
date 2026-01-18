const { TaskRadarPopup } = require('../../src/popup/popup');

describe('TaskRadarPopup', () => {
  let popup;
  let mockChrome;
  let totalTasksElement;
  let pendingTasksElement;
  let emptyStateElement;
  let tasksListElement;
  let mockElement;
  let mockLink;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock chrome
    mockChrome = {
      runtime: {
        sendMessage: jest.fn()
      }
    };
    global.chrome = mockChrome;

    // Mock elements
    totalTasksElement = { textContent: '0' };
    pendingTasksElement = { textContent: '0' };
    emptyStateElement = { style: { display: 'block' } };
    tasksListElement = { innerHTML: '', appendChild: jest.fn() };
    mockElement = {
      className: '',
      innerHTML: '',
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      querySelector: jest.fn(() => ({
        addEventListener: jest.fn()
      }))
    };
    mockLink = {
      setAttribute: jest.fn(),
      click: jest.fn()
    };

    // Spy on document methods
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'total-tasks') return totalTasksElement;
      if (id === 'pending-tasks') return pendingTasksElement;
      if (id === 'empty-state') return emptyStateElement;
      if (id === 'tasks-list') return tasksListElement;
      return null;
    });
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'div') return mockElement;
      if (tag === 'a') return mockLink;
      return {};
    });

    popup = new TaskRadarPopup();
  });

  describe('constructor', () => {
    it('should initialize with empty tasks', () => {
      expect(popup.tasks).toEqual([]);
    });

    it('should initialize with empty tasks', () => {
      expect(popup.tasks).toEqual([]);
    });
  });

  describe('loadTasks', () => {
    it('should load tasks from runtime', async () => {
      const mockTasks = [{ id: '1', title: 'Test Task' }];
      mockChrome.runtime.sendMessage.mockResolvedValue(mockTasks);

      await popup.loadTasks();

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({ type: 'GET_TASKS' });
      expect(popup.tasks).toEqual(mockTasks);
    });
  });

  describe('renderTasks', () => {
    beforeEach(() => {
      popup.tasks = [
        {
          id: '1',
          title: 'Test Task',
          query: 'test query',
          category: 'General',
          estimatedTime: 60,
          createdAt: '2023-01-01T00:00:00.000Z',
          completed: false
        },
        {
          id: '2',
          title: 'Completed Task',
          query: 'completed query',
          category: 'General',
          estimatedTime: 30,
          createdAt: '2023-01-02T00:00:00.000Z',
          completed: true
        }
      ];
    });

    it('should render tasks correctly', () => {
      popup.renderTasks();

      expect(totalTasksElement.textContent).toBe(2);
      expect(pendingTasksElement.textContent).toBe(1);
      expect(emptyStateElement.style.display).toBe('none');
      expect(tasksListElement.appendChild).toHaveBeenCalledTimes(2);
    });

    it('should show empty state when no tasks', () => {
      popup.tasks = [];

      popup.renderTasks();

      expect(emptyStateElement.style.display).toBe('block');
    });
  });

  describe('createTaskElement', () => {
    it('should create task element with correct structure', () => {
      const task = {
        id: '1',
        title: 'Test Task',
        query: 'test query',
        category: 'General',
        estimatedTime: 90,
        createdAt: '2023-01-01T00:00:00.000Z',
        completed: false
      };

      const result = popup.createTaskElement(task);

      expect(result.className).toBe('task-item ');
      expect(result.innerHTML).toContain('Test Task');
      expect(result.innerHTML).toContain('General');
      expect(result.innerHTML).toContain('1h 30m');
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should toggle completion and refresh', async () => {
      mockChrome.runtime.sendMessage.mockResolvedValue();
      popup.loadTasks = jest.fn();
      popup.renderTasks = jest.fn();

      await popup.toggleTaskCompletion('1');

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'COMPLETE_TASK',
        taskId: '1'
      });
      expect(popup.loadTasks).toHaveBeenCalled();
      expect(popup.renderTasks).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      global.confirm = jest.fn();
    });

    it('should delete task if confirmed', async () => {
      global.confirm.mockReturnValue(true);
      mockChrome.runtime.sendMessage.mockResolvedValue();
      popup.loadTasks = jest.fn();
      popup.renderTasks = jest.fn();

      await popup.deleteTask('1');

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'DELETE_TASK',
        taskId: '1'
      });
      expect(popup.loadTasks).toHaveBeenCalled();
      expect(popup.renderTasks).toHaveBeenCalled();
    });

    it('should not delete if not confirmed', async () => {
      global.confirm.mockReturnValue(false);

      await popup.deleteTask('1');

      expect(mockChrome.runtime.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('exportTasks', () => {
    it('should create download link with JSON data', () => {
      popup.tasks = [{ id: '1', title: 'Test' }];

      popup.exportTasks();

      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', expect.stringContaining('data:application/json'));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/tasks-\d{4}-\d{2}-\d{2}\.json/));
      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});