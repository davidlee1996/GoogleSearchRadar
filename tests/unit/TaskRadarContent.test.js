const { TaskRadarContent } = require('../../src/content/content');

describe('TaskRadarContent', () => {
  let contentScript;
  let mockChrome;
  let addEventListenerMock;
  let mutationCallback;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock chrome
    mockChrome = {
      runtime: {
        sendMessage: jest.fn()
      }
    };
    global.chrome = mockChrome;

    // Mock MutationObserver
    mutationCallback = null;
    global.MutationObserver = jest.fn((callback) => {
      mutationCallback = callback;
      return {
        observe: jest.fn()
      };
    });

    // Spy on document methods
    jest.spyOn(document, 'addEventListener').mockImplementation(() => {});
    jest.spyOn(document, 'createElement').mockReturnValue({
      id: '',
      innerHTML: '',
      querySelector: jest.fn(() => ({
        addEventListener: jest.fn()
      }))
    });
    jest.spyOn(document, 'querySelector').mockReturnValue(null);
    jest.spyOn(document, 'querySelectorAll').mockReturnValue([]);
    document.readyState = 'complete';

    // Spy on window
    jest.spyOn(window, 'setTimeout').mockImplementation(() => {});

    contentScript = new TaskRadarContent();
  });

  describe('setupMutationObserver', () => {
    it('should setup observer and call analyze on mutation', () => {
      contentScript.setupMutationObserver();

      expect(MutationObserver).toHaveBeenCalled();
      const observerInstance = MutationObserver.mock.results[0].value;
      expect(observerInstance.observe).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true
      });

      // Mock for triggering callback
      document.querySelector.mockReturnValue({}); // has search results
      const mutations = [{ target: { id: 'search' } }];

      mutationCallback(mutations);

      expect(window.setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    });

    it('should not analyze if no search results', () => {
      contentScript.setupMutationObserver();

      document.querySelector.mockReturnValue(null);
      const mutations = [{ target: { id: 'search' } }];

      mutationCallback(mutations);

      expect(window.setTimeout).not.toHaveBeenCalled();
    });
  });

  describe('analyzeCurrentSearch', () => {
    it('should send message if analysis succeeds', () => {
      // Mock analyzer
      contentScript.analyzer.analyzeSearch = jest.fn().mockReturnValue({
        query: 'test query',
        category: 'General Task',
        confidence: 0.6,
        searchUrl: 'https://google.com/search?q=test'
      });
      contentScript.analyzer.extractTopResults = jest.fn().mockReturnValue([]);
      contentScript.analyzer.estimateTimeForTask = jest.fn().mockReturnValue(60);
      contentScript.showTaskPrompt = jest.fn();

      contentScript.analyzeCurrentSearch();

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'DETECTED_SEARCH',
        data: {
          query: 'test query',
          category: 'General Task',
          confidence: 0.6,
          topResults: [],
          estimatedTime: 60,
          searchUrl: 'https://google.com/search?q=test'
        }
      });
      expect(contentScript.showTaskPrompt).toHaveBeenCalled();
    });

    it('should do nothing if confidence too low', () => {
      contentScript.analyzer.analyzeSearch = jest.fn().mockReturnValue({
        query: 'test',
        category: 'General Task',
        confidence: 0.3,
        searchUrl: 'https://google.com/search?q=test'
      });

      contentScript.analyzeCurrentSearch();

      expect(mockChrome.runtime.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('generateTaskTitle', () => {
    it('should generate title from query', () => {
      expect(contentScript.generateTaskTitle('how to fix a leak')).toBe('Fix Leak');
      expect(contentScript.generateTaskTitle('best way to cook pasta')).toBe('Best Way Cook Pasta');
      expect(contentScript.generateTaskTitle('how do I learn programming')).toBe('Learn Programming');
    });

    it('should capitalize first letter if no filtered words', () => {
      expect(contentScript.generateTaskTitle('xyz')).toBe('Xyz');
    });
  });

  // Note: DOM manipulation tests would require jsdom setup for full coverage
  // This covers the core logic
});