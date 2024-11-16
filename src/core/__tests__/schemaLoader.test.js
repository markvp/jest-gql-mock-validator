import { loadSchema } from "../schemaLoader";
import { buildSchema } from "graphql";
import fs from "fs";
import path from "path";

// Mock fs to simulate file system operations
jest.mock("fs");

describe("loadSchema", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should load and parse a valid GraphQL schema file (absolute path)", () => {
    const schemaString = `
      type Query {
        getUser(id: ID!): User
      }
      type User {
        id: ID!
        username: String!
        email: String
      }
    `;

    const absolutePath = "/absolute/path/to/schema.graphql";
    fs.readFileSync.mockReturnValue(schemaString);

    const schema = loadSchema(absolutePath);

    // Validate the schema using GraphQL's buildSchema function
    const expectedSchema = buildSchema(schemaString);

    expect(fs.readFileSync).toHaveBeenCalledWith(absolutePath, "utf-8");
    expect(schema).toEqual(expectedSchema);
  });

  it("should resolve relative paths to absolute paths and load the schema", () => {
    const schemaString = `
      type Query {
        getUser(id: ID!): User
      }
      type User {
        id: ID!
        username: String!
        email: String
      }
    `;

    const relativePath = "schema.graphql";
    const absolutePath = path.resolve(process.cwd(), relativePath);
    fs.readFileSync.mockReturnValue(schemaString);

    const schema = loadSchema(relativePath);

    const expectedSchema = buildSchema(schemaString);

    expect(fs.readFileSync).toHaveBeenCalledWith(absolutePath, "utf-8");
    expect(schema).toEqual(expectedSchema);
  });

  it("should throw an error if no schema path is provided", () => {
    expect(() => loadSchema()).toThrowError(
      "No schema path provided. Please specify a valid path to the GraphQL schema file."
    );
  });

  it("should throw an error if the schema file does not exist", () => {
    const relativePath = "nonexistent.graphql";
    const absolutePath = path.resolve(process.cwd(), relativePath);

    fs.readFileSync.mockImplementation(() => {
      throw new Error("File not found");
    });

    expect(() => loadSchema(relativePath)).toThrowError(
      `Failed to load schema from path: ${absolutePath}`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(absolutePath, "utf-8");
  });

  it("should throw an error if the schema file is not a valid GraphQL schema", () => {
    const invalidSchemaString = `
      type Query {
        invalid: @NotAValidSchema
      }
    `;

    const relativePath = "invalidSchema.graphql";
    const absolutePath = path.resolve(process.cwd(), relativePath);

    fs.readFileSync.mockReturnValue(invalidSchemaString);

    expect(() => loadSchema(relativePath)).toThrowError(
      `Failed to parse GraphQL schema: Syntax Error: Expected Name, found @`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(absolutePath, "utf-8");
  });

  it("should throw an error if the file format is not supported", () => {
    const unsupportedPath = "schema.json";

    expect(() => loadSchema(unsupportedPath)).toThrowError(
      `Unsupported schema file format: ${unsupportedPath}`
    );
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  it("should handle an empty schema file gracefully", () => {
    const relativePath = "emptySchema.graphql";
    const absolutePath = path.resolve(process.cwd(), relativePath);

    fs.readFileSync.mockReturnValue("");

    expect(() => loadSchema(relativePath)).toThrowError(
      `Failed to parse GraphQL schema: Syntax Error: Unexpected <EOF>`
    );
    expect(fs.readFileSync).toHaveBeenCalledWith(absolutePath, "utf-8");
  });
});
