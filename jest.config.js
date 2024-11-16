export default {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.(gql|graphql)$": "jest-transform-graphql",
  },
};
