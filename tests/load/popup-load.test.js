const { TaskRadarPopup } = require('../../src/popup/popup');

describe('TaskRadarPopup Load Tests', () => {
  let popup;
  let mockChrome;
  let mockElements;

  beforeEach(() => {
    jest.clearAllMocks();

    mockChrome = {
      runtime: {
        sendMessage: jest.fn()
      }
    };
    global.chrome = mockChrome;

    // Mock DOM elements
    mockElements = {
      totalTasks: { textContent: '0' },
      pendingTasks: { textContent: '0' },
      emptyState: { style: { display: 'block' } },
      tasksList: { innerHTML: '', appendChild: jest.fn() }
    };

    // Spy on document methods
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      switch (id) {
        case 'total-tasks': return mockElements.totalTasks;
        case 'pending-tasks': return mockElements.pendingTasks;
        case 'empty-state': return mockElements.emptyState;
        case 'tasks-list': return mockElements.tasksList;
        default: return null;
      }
    });

    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'div') return {
        className: '',
        innerHTML: '',
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        querySelector: jest.fn(() => ({
          addEventListener: jest.fn()
        }))
      };
      if (tag === 'a') return {
        setAttribute: jest.fn(),
        click: jest.fn()
      };
      return {};
    });

    popup = new TaskRadarPopup();
  });

  describe('Large Task List Rendering', () => {
    it('should render 500 tasks efficiently', () => {
      // Generate 500 mock tasks
      const mockTasks = [];
      for (let i = 0; i < 500; i++) {
        mockTasks.push({
          id: `task-${i}`,
          title: `Task ${i}`,
          query: `query ${i}`,
          category: 'General',
          estimatedTime: 60,
          createdAt: new Date().toISOString(),
          completed: i % 2 === 0 // Alternate completed status
        });
      }

      popup.tasks = mockTasks;

      const startTime = Date.now();
      popup.renderTasks();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(mockElements.totalTasks.textContent).toBe(500);
      expect(mockElements.pendingTasks.textContent).toBe(250); // Half completed
      expect(mockElements.emptyState.style.display).toBe('none');
      expect(mockElements.tasksList.appendChild).toHaveBeenCalledTimes(500);
      expect(duration).toBeLessThan(2000); // Should render within 2 seconds
    });

    it('should handle 1000 tasks without crashing', () => {
      // Generate 1000 mock tasks
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

      popup.tasks = mockTasks;

      const startTime = Date.now();
      popup.renderTasks();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(mockElements.totalTasks.textContent).toBe(1000);
      expect(mockElements.pendingTasks.textContent).toBe(1000);
      expect(mockElements.tasksList.appendChild).toHaveBeenCalledTimes(1000);
      expect(duration).toBeLessThan(5000); // Should render within 5 seconds
    });
  });

  describe('Task Element Creation Performance', () => {
    it('should create 1000 task elements efficiently', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        const task = {
          id: `task-${i}`,
          title: `Task ${i}`,
          query: `query ${i}`,
          category: 'General',
          estimatedTime: 90,
          createdAt: new Date().toISOString(),
          completed: false
        };

        const element = popup.createTaskElement(task);
        expect(element.className).toBe('task-item ');
        expect(element.innerHTML).toContain(`Task ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should create within 1 second
    });
  });

  describe('Export Performance', () => {
    it('should export 1000 tasks efficiently', () => {
      // Generate 1000 tasks
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

      popup.tasks = mockTasks;

      const startTime = Date.now();
      popup.exportTasks();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should export quickly
    });
  });

  describe('Memory Usage with Large Lists', () => {
    it('should handle large task lists without memory issues', () => {
      // Create tasks with large data
      const mockTasks = [];
      for (let i = 0; i < 200; i++) {
        mockTasks.push({
          id: `task-${i}`,
          title: `Task ${i}`.repeat(20), // Very long titles
          query: `query ${i}`.repeat(10), // Very long queries
          category: 'General',
          estimatedTime: 60,
          createdAt: new Date().toISOString(),
          completed: false,
          links: Array.from({ length: 50 }, (_, j) => ({
            title: `Link ${j}`.repeat(10),
            url: `http://example.com/link${j}`.repeat(5)
          }))
        });
      }

      popup.tasks = mockTasks;

      const startTime = Date.now();
      popup.renderTasks();
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(mockElements.tasksList.appendChild).toHaveBeenCalledTimes(200);
      expect(duration).toBeLessThan(3000); // Should handle within 3 seconds
    });
  });
});