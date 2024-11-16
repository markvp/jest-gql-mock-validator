import { getQueryParser } from "./core/queryParser";
import { loadSchema } from "./core/schemaLoader";
import { readConfig } from "jest-config";
import { validateMockData } from "./core/validator";

/**
 * Sets up Jest matchers and custom mock functions.
 * @returns {Promise<void>}
 */
export const setupJestExtensions = async () => {
  if (typeof jest === "undefined") {
    console.warn(
      "Jest is not available in the global context. Skipping configuration."
    );
    return;
  }

  let jestConfig;

  try {
    jestConfig = await readConfig({}, process.cwd());
  } catch (error) {
    console.warn(
      `Warning: Failed to read Jest configuration. Falling back to default schema path. Error: ${
        error.message || error
      }`
    );
    jestConfig = { config: {} };
  }

  const graphqlSchemaPath =
    jestConfig?.config?.graphqlSchemaPath ?? "./schema.graphql";
  const schema = loadSchema(graphqlSchemaPath);
  const parseQuery = getQueryParser(schema);

  /**
   * Custom matcher to validate JSON data against a GraphQL query file.
   *
   * @param {Object} received - The actual mock JSON data to validate.
   * @param {Object} gql - The parsed GraphQL query file (imported as .gql).
   * @returns {Object} Jest result object with pass/fail status and messages.
   */
  const toMatchGqlMock = (received, gql) => {
    const errors = validateMockData(parseQuery(gql), received);

    return {
      pass: errors.length === 0,
      message:
        errors.length === 0
          ? () =>
              `Expected data to match the GraphQL query structure, but it does not.`
          : () => `Mock data validation failed:\n\n${errors.join("\n")}`,
    };
  };

  expect.extend({ toMatchGqlMock });

  jest.fn().mockResolvedGqlOnce = (query, response) => {
    expect(response).toMatchGqlMock(query);

    return this.mockResolvedValueOnce(response);
  };
};

setupJestExtensions();
