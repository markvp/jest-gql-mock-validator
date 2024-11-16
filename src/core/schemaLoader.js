import { buildSchema } from 'graphql';
import fs from 'fs';
import path from 'path';

/**
 * Loads and parses a GraphQL schema from a specified file.
 *
 * @param {string} schemaPath - Path to the GraphQL schema file.
 * @returns {GraphQLSchema} - Parsed GraphQL schema.
 * @throws {Error} - If the schema cannot be loaded or parsed.
 */
export const loadSchema = (schemaPath) => {
  if (!schemaPath) {
    throw new Error(
      'No schema path provided. Please specify a valid path to the GraphQL schema file.'
    );
  }

  if (!schemaPath.endsWith('.graphql')) {
    throw new Error(`Unsupported schema file format: ${schemaPath}`);
  }

  const absolutePath = path.isAbsolute(schemaPath)
    ? schemaPath
    : path.resolve(process.cwd(), schemaPath);

  try {
    const schemaString = fs.readFileSync(absolutePath, 'utf-8');
    return buildSchema(schemaString);
  } catch (error) {
    if (error.message.includes('Syntax Error')) {
      throw new Error(`Failed to parse GraphQL schema: ${error.message}`);
    }
    throw new Error(`Failed to load schema from path: ${absolutePath}`);
  }
};
