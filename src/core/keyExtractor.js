/**
 * Recursively flattens the keys of a nested object into dot notation.
 *
 * For example, given the input `{ user: { name: "Alice", address: { city: "Wonderland" } } }`,
 * it would return `["user.name", "user.address.city"]`.
 *
 * @param {Object} obj - The object to flatten.
 * @param {string} [parent=""] - The base path for recursion, used internally.
 * @returns {string[]} An array of strings representing the flattened keys.
 */
export const getKeys = (obj, parent = "") =>
  !obj || typeof obj !== "object"
    ? [parent].filter(Boolean)
    : [
        ...new Set(
          Object.entries(obj).flatMap(([key, value]) =>
            Array.isArray(value)
              ? [
                  parent ? `${parent}.${key}` : key,
                  ...value.flatMap((item) =>
                    getKeys(item, parent ? `${parent}.${key}` : key)
                  ),
                ]
              : [
                  parent ? `${parent}.${key}` : key,
                  ...getKeys(value, parent ? `${parent}.${key}` : key),
                ]
          )
        ),
      ];
