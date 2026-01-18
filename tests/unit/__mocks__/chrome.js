global.chrome = {
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