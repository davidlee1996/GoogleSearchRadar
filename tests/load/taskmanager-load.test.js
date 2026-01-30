const { TaskManager } = require('../../src/background/background');

describe('TaskManager Load Tests', () => {
  let taskManager;
  let mockChromeStorage;

  beforeEach(() => {
    jest.clearAllMocks();

    mockChromeStorage = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(),
    };
    global.chrome = {
      storage: {
        local: mockChromeStorage
      }
    };

    taskManager = new TaskManager();
  });

  describe('High Volume Task Operations', () => {
    it('should handle adding 1000 tasks efficiently', async () => {
      const startTime = Date.now();

      const tasks = [];
      for (let i = 0; i < 1000; i++) {
        const taskData = {
          title: `Task ${i}`,
          query: `query ${i}`,
          category: 'General',
          estimatedTime: 60
        };
        const task = await taskManager.addTask(taskData);
        tasks.push(task);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(taskManager.tasks).toHaveLength(1000);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockChromeStorage.set).toHaveBeenCalledTimes(1000);
    });

    it('should handle loading 1000 tasks from storage', async () => {
      const mockTasks = [];
      for (let i = 0; i < 1000; i++) {
        mockTasks.push({
          id: `task-${i}`,
          title: `Task ${i}`,
          query: `query ${i}`,
          category: 'General',
          estimatedTime: 60,
          createdAt: new Date().toISOString(),
          completed: false
        });
      }

      mockChromeStorage.get.mockResolvedValue({ tasks: mockTasks });

      const startTime = Date.now();
      await taskManager.loadTasks();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(taskManager.tasks).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should load within 1 second
    });

    it('should handle marking 500 tasks as completed', async () => {
      // Setup 1000 tasks
      for (let i = 0; i < 1000; i++) {
        taskManager.tasks.push({
          id: `task-${i}`,
          title: `Task ${i}`,
          completed: false
        });
      }

      const startTime = Date.now();
      for (let i = 0; i < 500; i++) {
        await taskManager.markCompleted(`task-${i}`);
      }
      const endTime = Date.now();
      const duration = endTime - startTime;

      const completedCount = taskManager.tasks.filter(task => task.completed).length;
      expect(completedCount).toBe(500);
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(mockChromeStorage.set).toHaveBeenCalledTimes(500);
    });

    it('should handle deleting 200 tasks', async () => {
      // Setup 1000 tasks
      for (let i = 0; i < 1000; i++) {
        taskManager.tasks.push({
          id: `task-${i}`,
          title: `Task ${i}`
        });
      }

      const startTime = Date.now();
      for (let i = 0; i < 200; i++) {
        await taskManager.deleteTask(`task-${i}`);
      }
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(taskManager.tasks).toHaveLength(800);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(mockChromeStorage.set).toHaveBeenCalledTimes(200);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should maintain reasonable memory usage with large task lists', async () => {
      // Add a large number of tasks with varying data sizes
      const largeTasks = [];
      for (let i = 0; i < 500; i++) {
        const taskData = {
          title: `Task ${i}`.repeat(10), // Make titles longer
          query: `query ${i}`.repeat(5), // Make queries longer
          category: 'General',
          estimatedTime: 60,
          links: Array.from({ length: 10 }, (_, j) => ({
            title: `Link ${j}`.repeat(5),
            url: `http://example.com/link${j}`.repeat(3)
          }))
        };
        const task = await taskManager.addTask(taskData);
        largeTasks.push(task);
      }

      expect(taskManager.tasks).toHaveLength(500);
      // Check that all tasks have the expected structure
      taskManager.tasks.forEach(task => {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('links');
        expect(Array.isArray(task.links)).toBe(true);
      });
    });
  });
});