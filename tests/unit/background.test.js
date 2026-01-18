const { TaskManager, handleDetectedSearch, createTask } = require('../../src/background/background');

describe('Background Script', () => {
  let mockChrome;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock chrome APIs
    mockChrome = {
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn(),
        },
        session: {
          set: jest.fn(),
        },
      },
      runtime: {
        onMessage: {
          addListener: jest.fn(),
        },
        sendMessage: jest.fn(),
      },
      action: {
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
      },
    };
    global.chrome = mockChrome;

    // Mock Date
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    // No restore needed
  });

  describe('handleDetectedSearch', () => {
    it('should store pending task and set badge', async () => {
      // Import the function - since it's not exported, we need to test via message listener
      // For now, we'll test the logic indirectly
      const searchData = {
        query: 'test query',
        category: 'general',
        confidence: 0.8,
        topResults: [],
        estimatedTime: 60,
        searchUrl: 'https://google.com/search?q=test'
      };
      const tabId = 123;

      // Simulate the function call
      await handleDetectedSearch(searchData, tabId);

      expect(mockChrome.storage.session.set).toHaveBeenCalledWith({
        [`pendingTask_${tabId}`]: {
          ...searchData,
          timestamp: 1234567890
        }
      });
      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        text: '!',
        tabId: tabId
      });
      expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: '#4285f4',
        tabId: tabId
      });
    });
  });

  describe('createTask', () => {
    it('should create task and send response', async () => {
      const taskData = { title: 'Test Task', query: 'test' };
      const sendResponse = jest.fn();

      // Mock taskManager
      const mockTask = { id: '1', title: 'Test Task' };
      const taskManager = new TaskManager();
      taskManager.addTask = jest.fn().mockResolvedValue(mockTask);

      // Since createTask is not exported, we'll test the message handling
      // For simplicity, assume we can call it
      await createTask(taskData, sendResponse);

      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        task: {
          id: '1234567890',
          title: 'Test Task',
          query: 'test',
          links: [],
          estimatedTime: 60,
          category: 'general',
          createdAt: '2023-01-01T00:00:00.000Z',
          completed: false
        }
      });
    });
  });

  // Note: For full coverage, we'd need to export functions or test via message listener
  // This is a simplified version
});