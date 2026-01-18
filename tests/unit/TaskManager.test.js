const { TaskManager } = require('../../src/background/background');

describe('TaskManager', () => {
  let taskManager;
  let mockChromeStorage;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock chrome.storage.local
    mockChromeStorage = {
      get: jest.fn(),
      set: jest.fn(),
    };
    global.chrome.storage.local = mockChromeStorage;

    taskManager = new TaskManager();
  });

  describe('constructor', () => {
    it('should initialize with empty tasks array', () => {
      expect(taskManager.tasks).toEqual([]);
    });
  });

  describe('loadTasks', () => {
    it('should load tasks from storage', async () => {
      const mockTasks = [{ id: '1', title: 'Test Task' }];
      mockChromeStorage.get.mockResolvedValue({ tasks: mockTasks });

      await taskManager.loadTasks();

      expect(mockChromeStorage.get).toHaveBeenCalledWith(['tasks']);
      expect(taskManager.tasks).toEqual(mockTasks);
    });

    it('should handle empty storage', async () => {
      mockChromeStorage.get.mockResolvedValue({});

      await taskManager.loadTasks();

      expect(taskManager.tasks).toEqual([]);
    });
  });

  describe('saveTasks', () => {
    it('should save tasks to storage', async () => {
      taskManager.tasks = [{ id: '1', title: 'Test Task' }];

      await taskManager.saveTasks();

      expect(mockChromeStorage.set).toHaveBeenCalledWith({
        tasks: [{ id: '1', title: 'Test Task' }]
      });
    });
  });

  describe('addTask', () => {
    beforeEach(() => {
      mockChromeStorage.set.mockResolvedValue();
    });

    it('should add a new task with generated id and defaults', async () => {
      const taskData = { title: 'Test Task', query: 'test query' };
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z');

      const result = await taskManager.addTask(taskData);

      expect(result).toEqual({
        id: '1234567890',
        title: 'Test Task',
        query: 'test query',
        links: [],
        estimatedTime: 60,
        category: 'general',
        createdAt: '2023-01-01T00:00:00.000Z',
        completed: false
      });
      expect(taskManager.tasks).toHaveLength(1);
      expect(mockChromeStorage.set).toHaveBeenCalled();

      Date.now.mockRestore();
      Date.prototype.toISOString.mockRestore();
    });

    it('should use provided links, estimatedTime, and category', async () => {
      const taskData = {
        title: 'Test Task',
        query: 'test query',
        links: [{ title: 'Link', url: 'http://example.com' }],
        estimatedTime: 120,
        category: 'custom'
      };

      const result = await taskManager.addTask(taskData);

      expect(result.links).toEqual([{ title: 'Link', url: 'http://example.com' }]);
      expect(result.estimatedTime).toBe(120);
      expect(result.category).toBe('custom');
    });
  });

  describe('markCompleted', () => {
    beforeEach(() => {
      mockChromeStorage.set.mockResolvedValue();
      taskManager.tasks = [
        { id: '1', title: 'Task 1', completed: false },
        { id: '2', title: 'Task 2', completed: false }
      ];
    });

    it('should mark task as completed', async () => {
      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z');

      await taskManager.markCompleted('1');

      expect(taskManager.tasks[0].completed).toBe(true);
      expect(taskManager.tasks[0].completedAt).toBe('2023-01-01T00:00:00.000Z');
      expect(mockChromeStorage.set).toHaveBeenCalled();

      Date.prototype.toISOString.mockRestore();
    });

    it('should do nothing if task not found', async () => {
      await taskManager.markCompleted('999');

      expect(taskManager.tasks[0].completed).toBe(false);
      expect(mockChromeStorage.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      mockChromeStorage.set.mockResolvedValue();
      taskManager.tasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' }
      ];
    });

    it('should delete task by id', async () => {
      await taskManager.deleteTask('1');

      expect(taskManager.tasks).toHaveLength(1);
      expect(taskManager.tasks[0].id).toBe('2');
      expect(mockChromeStorage.set).toHaveBeenCalled();
    });

    it('should do nothing if task not found', async () => {
      await taskManager.deleteTask('999');

      expect(taskManager.tasks).toHaveLength(2);
      expect(mockChromeStorage.set).toHaveBeenCalled();
    });
  });

  describe('getTasks', () => {
    it('should return all tasks', () => {
      const mockTasks = [{ id: '1', title: 'Task 1' }];
      taskManager.tasks = mockTasks;

      const result = taskManager.getTasks();

      expect(result).toEqual(mockTasks);
    });
  });
});