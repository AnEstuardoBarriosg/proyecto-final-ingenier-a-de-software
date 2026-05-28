module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "src/services/auth.service.js",
    "src/services/products.service.js",
    "src/services/cart.service.js",
    "src/services/orders.service.js",
    "src/middlewares/auth.middleware.js",
    "src/middlewares/role.middleware.js",
  ],
  coverageThreshold: {
    global: {
      lines: 60,
      functions: 60,
      branches: 60,
      statements: 60,
    },
  },
  testMatch: ["**/__tests__/**/*.test.js"],
  testTimeout: 10000,
};
