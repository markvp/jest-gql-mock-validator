import { getKeys } from "./keyExtractor";

/**
 * Validates that the mock data matches the required fields structure.
 *
 * @param {Object} fieldDefinitions - The parsed structure of required fields from getQueryParser.
 * @param {Object} response - The mock response data object to validate.
 * @returns {Array<string>} - An array of error messages, empty if validation passes.
 */
export const validateMockData = (
  fieldDefinitions,
  response,
  ignoreUnexpected = false
) => {
  const errors = [];
  const responseFields = getKeys(response);

  if (!ignoreUnexpected) {
    for (const responseField of responseFields) {
      if (!Object.keys(fieldDefinitions).includes(responseField)) {
        errors.push(`Unexpected field "${responseField}" in mock data`);
      }
    }
  }

  for (const [keyPath, isRequired] of Object.entries(fieldDefinitions)) {
    if (!isRequired) {
      continue;
    }

    const keys = keyPath.split(".");
    let current = response;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (current[key] === undefined || current[key] === null) {
        if (!fieldDefinitions[keys.slice(0, i + 1).join(".")]) {
          break;
        }
        if (i === keys.length - 1) {
          errors.push(`Missing required field "${keyPath}" in mock data`);
        }
        break;
      }

      // Handle arrays
      if (Array.isArray(current[key])) {
        if (i === keys.length - 1) {
          // Array itself is required but no sub-properties specified
          break;
        }

        // Validate sub-properties for each array element
        const remainingPath = keys.slice(i + 1).join(".");
        current[key].forEach((item, index) => {
          const subErrors = validateMockData(
            { [remainingPath]: true },
            item,
            true
          );

          // Add errors with indexed paths
          errors.push(
            ...subErrors.map(
              (error) =>
                `Array item validation failed at "${keys
                  .slice(0, i + 1)
                  .join(".")}[${index}]" -> ${error}`
            )
          );
        });

        break;
      }

      // Traverse into the next level for nested objects
      current = current[key];
    }
  }

  return errors;
};
