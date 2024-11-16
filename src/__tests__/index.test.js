import { setupJestExtensions } from "../index";
import { getQueryParser } from "../core/queryParser";
import { loadSchema } from "../core/schemaLoader";
import { readConfig } from "jest-config";
import { validateMockData } from "../core/validator";

// Mock dependencies
jest.mock("../core/queryParser");
jest.mock("../core/schemaLoader");
jest.mock("jest-config");
jest.mock("../core/validator");

describe("setupJestExtensions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
  it("should test mockResolvedGqlOnce correctly", async () => {
    const gqlMock = {}; // Mock parsed GraphQL query
    const response = { id: "123", username: "test_user" };

    // Mock parseQuery behavior
    const mockParseQuery = jest.fn().mockReturnValue({
      id: true,
      username: true,
    });

    // Mock validateMockData to simulate no validation errors
    const mockValidateMockData = jest.fn().mockReturnValue([]);
    validateMockData.mockImplementation(mockValidateMockData);

    // Mock getQueryParser to return mockParseQuery
    getQueryParser.mockReturnValue(mockParseQuery);

    // Mock loadSchema
    loadSchema.mockReturnValue({}); // Mock schema object

    // Run setupJestExtensions to set up Jest matchers
    await setupJestExtensions();

    // Create a mock function
    const mockFn = jest.fn();

    // Extend the mock function with mockResolvedGqlOnce
    mockFn.mockResolvedGqlOnce = function (query, response) {
      expect(response).toMatchGqlMock(query);
      return this.mockResolvedValueOnce(response);
    };

    // Use mockResolvedGqlOnce
    mockFn.mockResolvedGqlOnce(gqlMock, response);

    // Validate that mockResolvedGqlOnce calls validateMockData
    expect(mockValidateMockData).toHaveBeenCalledWith(
      mockParseQuery(gqlMock),
      response
    );
  });

  it("should fall back to the default schema path if Jest configuration is missing", async () => {
    const mockSchema = {};
    readConfig.mockRejectedValue(new Error("Configuration not found"));
    loadSchema.mockReturnValue(mockSchema);

    await setupJestExtensions();

    // Verify fallback schema path
    expect(loadSchema).toHaveBeenCalledWith("./schema.graphql");
  });

  it("should throw an error when mock data does not match the GraphQL query structure", async () => {
    const mockSchema = {};
    const mockParseQuery = jest.fn();
    const mockValidateMockData = jest
      .fn()
      .mockReturnValue(['Missing required field "username"']);
    const mockConfig = { graphqlSchemaPath: "./mock-schema.graphql" };

    // Mock implementations
    readConfig.mockResolvedValue({ config: mockConfig });
    loadSchema.mockReturnValue(mockSchema);
    getQueryParser.mockReturnValue(mockParseQuery);
    validateMockData.mockImplementation(mockValidateMockData);

    await setupJestExtensions();

    const gqlMock = {}; // Mock parsed GraphQL query
    const response = { id: "123" }; // Missing `username`

    expect(() => {
      expect(response).toMatchGqlMock(gqlMock);
    }).toThrow(
      /Mock data validation failed:\n\nMissing required field "username"/
    );
  });
});
