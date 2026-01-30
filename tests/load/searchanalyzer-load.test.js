const { SearchAnalyzer } = require('../../src/content/content');

describe('SearchAnalyzer Load Tests', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new SearchAnalyzer();
  });

  describe('High Volume Search Analysis', () => {
    const searchQueries = [
      'how to fix a leaky faucet',
      'best way to cook pasta',
      'research quantum computing',
      'plan a trip to japan',
      'learn javascript programming',
      'compare smartphones 2024',
      'home repair drywall',
      'gardening tips for beginners',
      'investment strategies',
      'healthy meal prep ideas',
      'weather today',
      'sports scores',
      'news headlines',
      'social media trends',
      'movie reviews'
    ];

    it('should analyze 1000 search queries efficiently', () => {
      // Mock window.location for each query
      delete global.window.location;
      global.window.location = {
        href: '',
        pathname: '/search',
        search: ''
      };

      const startTime = Date.now();

      let taskCount = 0;
      for (let i = 0; i < 1000; i++) {
        const query = searchQueries[i % searchQueries.length];
        global.window.location.href = `https://google.com/search?q=${encodeURIComponent(query)}`;
        global.window.location.search = `?q=${encodeURIComponent(query)}`;

        const result = analyzer.analyzeSearch();
        if (result) {
          taskCount++;
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(taskCount).toBeGreaterThan(0); // Should detect some tasks
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle concurrent search analysis', () => {
      const startTime = Date.now();

      const results = [];
      for (let i = 0; i < 500; i++) {
        // Simulate different search contexts
        const mockLocation = {
          href: `https://google.com/search?q=query${i}`,
          pathname: '/search',
          search: `?q=query${i}`
        };

        // Temporarily override window.location
        const originalLocation = global.window.location;
        global.window.location = mockLocation;

        const result = analyzer.analyzeSearch();
        results.push(result);

        // Restore
        global.window.location = originalLocation;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.length).toBe(500);
      expect(duration).toBeLessThan(1500); // Should complete within 1.5 seconds
    });
  });

  describe('Time Estimation Load Tests', () => {
    it('should estimate time for 1000 different queries efficiently', () => {
      const queries = [
        'fix leak',
        'research topic',
        'learn programming',
        'plan trip',
        'unknown query'
      ];

      const categories = ['Home Repair', 'Research', 'Learning', 'Planning', 'Unknown'];

      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        const query = queries[i % queries.length];
        const category = categories[i % categories.length];
        const time = analyzer.estimateTimeForTask(query, category);
        expect(typeof time).toBe('number');
        expect(time).toBeGreaterThan(0);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should be very fast
    });
  });

  describe('Result Extraction Load Tests', () => {
    it('should extract results from complex DOM structures efficiently', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        // Mock complex DOM with many elements
        const mockElements = [];
        for (let j = 0; j < 20; j++) {
          mockElements.push({
            querySelector: jest.fn((selector) => {
              if (selector === 'a') return { href: `http://example${j}.com` };
              if (selector === 'h3') return { textContent: `Title ${j}` };
              if (selector === '.VwiC3b') return { textContent: `Snippet ${j}` };
              return null;
            })
          });
        }

        document.querySelectorAll = jest.fn().mockReturnValue(mockElements);

        const results = analyzer.extractTopResults();

        expect(results.length).toBeLessThanOrEqual(3); // Should limit to top 3
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});