import { toMatchGqlMock } from "./core/toMatchGqlMock";

export { mockGqlQuery } from "./core/mockGqlQuery";

/**
 * Sets up Jest matchers.
 * @returns {Promise<void>}
 */
export const setupJestExtensions = () => {
  if (typeof jest === "undefined") {
    console.warn(
      "Jest is not available in the global context. Skipping configuration."
    );
    return;
  }

  expect.extend({ toMatchGqlMock });
};

setupJestExtensions();
