const { SearchAnalyzer } = require('../../src/content/content');

describe('SearchAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new SearchAnalyzer();
  });

  describe('analyzeSearch', () => {
    beforeEach(() => {
      // Mock window.location
      delete global.window.location;
      global.window.location = {
        href: '',
        pathname: '',
        search: ''
      };
    });

    it('should return null for non-search pages', () => {
      global.window.location.href = 'https://google.com';
      global.window.location.pathname = '/';
      global.window.location.search = '';

      const result = analyzer.analyzeSearch();

      expect(result).toBeNull();
    });

    it('should return null if no query', () => {
      global.window.location.href = 'https://google.com/search';
      global.window.location.pathname = '/search';
      global.window.location.search = '';

      const result = analyzer.analyzeSearch();

      expect(result).toBeNull();
    });

    it('should detect home repair task', () => {
      global.window.location.href = 'https://google.com/search?q=how+to+fix+a+leaky+faucet';
      global.window.location.pathname = '/search';
      global.window.location.search = '?q=how+to+fix+a+leaky+faucet';

      const result = analyzer.analyzeSearch();

      expect(result).toEqual({
        query: 'how to fix a leaky faucet',
        category: 'Home Repair',
        confidence: 0.8,
        searchUrl: 'https://google.com/search?q=how+to+fix+a+leaky+faucet'
      });
    });

    it('should detect research task', () => {
      global.window.location.href = 'https://google.com/search?q=best+product+for+gardening';
      global.window.location.pathname = '/search';
      global.window.location.search = '?q=best+product+for+gardening';

      const result = analyzer.analyzeSearch();

      expect(result).toEqual({
        query: 'best product for gardening',
        category: 'Research',
        confidence: 0.8,
        searchUrl: 'https://google.com/search?q=best+product+for+gardening'
      });
    });

    it('should detect general task with keywords', () => {
      global.window.location.href = 'https://google.com/search?q=how+to+cook+pasta';
      global.window.location.pathname = '/search';
      global.window.location.search = '?q=how+to+cook+pasta';

      const result = analyzer.analyzeSearch();

      expect(result).toEqual({
        query: 'how to cook pasta',
        category: 'General Task',
        confidence: 0.5,
        searchUrl: 'https://google.com/search?q=how+to+cook+pasta'
      });
    });

    it('should return null for non-task searches', () => {
      global.window.location.href = 'https://google.com/search?q=weather+today';
      global.window.location.pathname = '/search';
      global.window.location.search = '?q=weather+today';

      const result = analyzer.analyzeSearch();

      expect(result).toBeNull();
    });
  });

  describe('extractTopResults', () => {
    it('should extract top 3 results', () => {
      const mockElements = [
        {
          querySelector: jest.fn((selector) => {
            if (selector === 'a') return { href: 'http://example1.com' };
            if (selector === 'h3') return { textContent: 'Title 1' };
            if (selector === '.VwiC3b') return { textContent: 'Snippet 1' };
          })
        },
        {
          querySelector: jest.fn((selector) => {
            if (selector === 'a') return { href: 'http://example2.com' };
            if (selector === 'h3') return { textContent: 'Title 2' };
            if (selector === '.VwiC3b') return { textContent: 'Snippet 2' };
          })
        }
      ];
      document.querySelectorAll = jest.fn().mockReturnValue(mockElements);

      const result = analyzer.extractTopResults();

      expect(result).toEqual([
        {
          title: 'Title 1',
          url: 'http://example1.com',
          snippet: 'Snippet 1'
        },
        {
          title: 'Title 2',
          url: 'http://example2.com',
          snippet: 'Snippet 2'
        }
      ]);
    });

    it('should handle missing elements', () => {
      const mockElements = [
        {
          querySelector: jest.fn(() => null)
        }
      ];
      document.querySelectorAll = jest.fn().mockReturnValue(mockElements);

      const result = analyzer.extractTopResults();

      expect(result).toEqual([]);
    });
  });

  describe('estimateTimeForTask', () => {
    it('should estimate time for Home Repair category', () => {
      expect(analyzer.estimateTimeForTask('fix leak', 'Home Repair')).toBe(120);
      expect(analyzer.estimateTimeForTask('install faucet', 'Home Repair')).toBe(180);
      expect(analyzer.estimateTimeForTask('repair something', 'Home Repair')).toBe(120);
      expect(analyzer.estimateTimeForTask('unknown', 'Home Repair')).toBe(60);
    });

    it('should estimate time for Research category', () => {
      expect(analyzer.estimateTimeForTask('research topic', 'Research')).toBe(45);
      expect(analyzer.estimateTimeForTask('compare options', 'Research')).toBe(30);
      expect(analyzer.estimateTimeForTask('best product', 'Research')).toBe(20);
      expect(analyzer.estimateTimeForTask('unknown', 'Research')).toBe(30);
    });

    it('should estimate time for Learning category', () => {
      expect(analyzer.estimateTimeForTask('learn programming', 'Learning')).toBe(120);
      expect(analyzer.estimateTimeForTask('tutorial', 'Learning')).toBe(60);
      expect(analyzer.estimateTimeForTask('course', 'Learning')).toBe(180);
      expect(analyzer.estimateTimeForTask('unknown', 'Learning')).toBe(90);
    });

    it('should estimate time for Planning category', () => {
      expect(analyzer.estimateTimeForTask('plan trip', 'Planning')).toBe(60);
      expect(analyzer.estimateTimeForTask('schedule meeting', 'Planning')).toBe(30);
      expect(analyzer.estimateTimeForTask('itinerary', 'Planning')).toBe(45);
      expect(analyzer.estimateTimeForTask('unknown', 'Planning')).toBe(45);
    });

    it('should use default for unknown category', () => {
      expect(analyzer.estimateTimeForTask('any query', 'Unknown')).toBe(60);
    });
  });
});