import { parseQuery } from "./parseQuery";
import { validateMockData } from "./validateMockData";

/**
 * Custom matcher to validate JSON data against a GraphQL query file.
 *
 * @param {Object} received - The actual mock JSON data to validate.
 * @param {Object} gql - The parsed GraphQL query file (imported as .gql).
 * @returns {Object} Jest result object with pass/fail status and messages.
 */
export const toMatchGqlMock = async (received, gql) => {
  const fieldDefinitions = await parseQuery(gql);
  const errors = validateMockData(fieldDefinitions, received);

  return {
    pass: errors.length === 0,
    message:
      errors.length === 0
        ? () =>
            `Expected data to match the GraphQL query structure, but it does not.`
        : () => `Mock data validation failed:\n\n${errors.join("\n")}`,
  };
};
