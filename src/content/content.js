// Content script that runs on Google search pages
class SearchAnalyzer {
  constructor() {
    this.taskPatterns = {
      homeRepair: [
        /how (to|do I) (fix|repair|install)/i,
        /best (way|method) to (fix|repair)/i,
        /(faucet|pipe|leak|plumbing|electrical|drywall)/i
      ],
      research: [
        /research (about|on)/i,
        /best (product|service|tool) for/i,
        /compare (.*) vs (.*)/i
      ],
      learning: [
        /how to learn/i,
        /tutorial (for|on)/i,
        /course (for|on)/i,
        /study (guide|material)/i
      ],
      planning: [
        /plan (for|a|my)/i,
        /schedule (for|a)/i,
        /itinerary (for|to)/i,
        /prepare (for|to)/i
      ]
    };
    
    this.categories = {
      homeRepair: 'Home Repair',
      research: 'Research',
      learning: 'Learning',
      planning: 'Planning',
      general: 'General Task'
    };
  }

  analyzeSearch() {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    const query = searchParams.get('q') || '';
    
    if (!query) return null;
    
    // Check if this is a search results page
    if (!url.pathname.includes('/search')) return null;
    
    // Analyze query against patterns
    let detectedCategory = null;
    let confidence = 0;
    
    for (const [category, patterns] of Object.entries(this.taskPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          detectedCategory = category;
          confidence = 0.8;
          break;
        }
      }
      if (detectedCategory) break;
    }
    
    if (!detectedCategory) {
      // Check for common task keywords
      const taskKeywords = [
        'how to', 'tutorial', 'guide', 'fix', 'repair', 
        'install', 'learn', 'study', 'plan', 'schedule',
        'buy', 'purchase', 'find', 'research'
      ];
      
      if (taskKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
        detectedCategory = 'general';
        confidence = 0.5;
      }
    }
    
    if (detectedCategory) {
      return {
        query,
        category: this.categories[detectedCategory],
        confidence,
        searchUrl: window.location.href
      };
    }
    
    return null;
  }

  extractTopResults() {
    // Extract top 3 search results
    const results = [];
    const resultElements = document.querySelectorAll('div.g');
    
    for (let i = 0; i < Math.min(3, resultElements.length); i++) {
      const element = resultElements[i];
      const linkElement = element.querySelector('a');
      const titleElement = element.querySelector('h3');
      
      if (linkElement && titleElement) {
        results.push({
          title: titleElement.textContent,
          url: linkElement.href,
          snippet: element.querySelector('.VwiC3b')?.textContent || ''
        });
      }
    }
    
    return results;
  }

  estimateTimeForTask(query, category) {
    // Simple time estimation based on category and query
    const timeEstimates = {
      'Home Repair': {
        'leak': 120,
        'fix': 90,
        'install': 180,
        'repair': 120,
        default: 60
      },
      'Research': {
        'research': 45,
        'compare': 30,
        'best': 20,
        default: 30
      },
      'Learning': {
        'learn': 120,
        'tutorial': 60,
        'course': 180,
        default: 90
      },
      'Planning': {
        'plan': 60,
        'schedule': 30,
        'itinerary': 45,
        default: 45
      },
      'General Task': {
        default: 60
      }
    };
    
    const categoryEstimates = timeEstimates[category] || timeEstimates['General Task'];
    const queryLower = query.toLowerCase();
    
    for (const [keyword, minutes] of Object.entries(categoryEstimates)) {
      if (keyword !== 'default' && queryLower.includes(keyword)) {
        return minutes;
      }
    }
    
    return categoryEstimates.default || 60;
  }
}

// Main content script logic
class TaskRadarContent {
  constructor() {
    this.analyzer = new SearchAnalyzer();
    this.uiCreated = false;
    if (typeof module === 'undefined' || !module.exports) {
      this.init();
    }
  }

  async init() {
    // Wait for page to load
    setTimeout(() => {
      this.analyzeCurrentSearch();
    }, 1000);
    
    // Listen for search changes (Google does AJAX navigation)
    this.setupMutationObserver();
  }

  analyzeCurrentSearch() {
    const searchAnalysis = this.analyzer.analyzeSearch();
    
    if (searchAnalysis && searchAnalysis.confidence > 0.4) {
      // Extract top results
      const topResults = this.analyzer.extractTopResults();
      const estimatedTime = this.analyzer.estimateTimeForTask(
        searchAnalysis.query, 
        searchAnalysis.category
      );
      
      // Send to background script
      chrome.runtime.sendMessage({
        type: 'DETECTED_SEARCH',
        data: {
          query: searchAnalysis.query,
          category: searchAnalysis.category,
          confidence: searchAnalysis.confidence,
          topResults: topResults.slice(0, 3),
          estimatedTime,
          searchUrl: searchAnalysis.searchUrl
        }
      });
      
      // Show UI notification
      this.showTaskPrompt(searchAnalysis, topResults, estimatedTime);
    }
  }

  showTaskPrompt(searchAnalysis, topResults, estimatedTime) {
    if (this.uiCreated) return;
    
    // Create prompt UI
    const prompt = document.createElement('div');
    prompt.id = 'task-radar-prompt';
    prompt.innerHTML = `
      <div class="task-radar-container">
        <div class="task-radar-header">
          <span class="task-radar-icon">📋</span>
          <h3>Is this search for a task?</h3>
          <button class="task-radar-close">&times;</button>
        </div>
        <div class="task-radar-content">
          <p class="task-radar-query">"${searchAnalysis.query}"</p>
          <p class="task-radar-category">Category: ${searchAnalysis.category}</p>
          <p class="task-radar-estimate">Estimated time: ${estimatedTime} minutes</p>
          <div class="task-radar-buttons">
            <button class="task-radar-btn task-radar-yes">Yes, add to tasks</button>
            <button class="task-radar-btn task-radar-no">Not a task</button>
            <button class="task-radar-btn task-radar-later">Ask me later</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(prompt);
    this.uiCreated = true;
    
    // Add event listeners
    prompt.querySelector('.task-radar-close').addEventListener('click', () => {
      prompt.remove();
      this.uiCreated = false;
    });
    
    prompt.querySelector('.task-radar-yes').addEventListener('click', async () => {
      await this.createTaskFromSearch(searchAnalysis, topResults, estimatedTime);
      prompt.remove();
      this.uiCreated = false;
      this.showSuccessMessage();
    });
    
    prompt.querySelector('.task-radar-no').addEventListener('click', () => {
      prompt.remove();
      this.uiCreated = false;
    });
    
    prompt.querySelector('.task-radar-later').addEventListener('click', () => {
      prompt.remove();
      this.uiCreated = false;
      // Could implement "snooze" functionality here
    });
  }

  async createTaskFromSearch(searchAnalysis, topResults, estimatedTime) {
    // Generate task title from query
    const taskTitle = this.generateTaskTitle(searchAnalysis.query);
    
    // Send to background to create task
    const response = await chrome.runtime.sendMessage({
      type: 'CREATE_TASK',
      data: {
        title: taskTitle,
        query: searchAnalysis.query,
        links: topResults,
        estimatedTime: estimatedTime,
        category: searchAnalysis.category
      }
    });
    
    return response;
  }

  generateTaskTitle(query) {
    // Simple title generation
    const words = query.toLowerCase().split(' ');
    const removeWords = ['how', 'to', 'do', 'i', 'the', 'a', 'an', 'my', 'your'];
    
    const filteredWords = words.filter(word => 
      !removeWords.includes(word) && word.length > 2
    );
    
    if (filteredWords.length > 0) {
      // Capitalize first letter of each word
      const title = filteredWords
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return title;
    }
    
    // Fallback: just capitalize first letter of query
    return query.charAt(0).toUpperCase() + query.slice(1);
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.id = 'task-radar-success';
    message.innerHTML = `
      <div class="task-radar-success-container">
        <span class="task-radar-success-icon">✅</span>
        <span>Task added successfully!</span>
      </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  setupMutationObserver() {
    // Watch for Google's AJAX page updates
    const observer = new MutationObserver((mutations) => {
      if (this.uiCreated) return;
      
      // Check if search results have changed
      const hasSearchResults = document.querySelector('div#search') !== null;
      const hasResultsChanged = mutations.some(mutation => 
        mutation.target.id === 'search' || 
        mutation.target.classList.contains('g')
      );
      
      if (hasSearchResults && hasResultsChanged) {
        setTimeout(() => {
          this.analyzeCurrentSearch();
        }, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize when page loads
if (typeof module === 'undefined' || !module.exports) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new TaskRadarContent();
    });
  } else {
    new TaskRadarContent();
  }
}

// Expose for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchAnalyzer, TaskRadarContent };
}