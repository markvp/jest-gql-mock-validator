import { GraphQLSchema } from "graphql";
import path from "path";

jest.mock("graphql-config", () => ({
  loadConfig: jest.fn(),
}));

let getSchema;
let loadConfig;
const mockGetSchema = jest.fn();

describe("getSchema", () => {
  beforeEach(async () => {
    jest.resetModules();

    ({ getSchema } = await import("../getSchema.js"));
    ({ loadConfig } = await import("graphql-config"));
    loadConfig.mockResolvedValue({
      getDefault: jest.fn().mockReturnValue({
        getSchema: mockGetSchema.mockResolvedValue("mocked schema"),
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should return the schema using mocked loadConfig", async () => {
    // Call getSchema
    const schema = await getSchema();

    // Assertions
    expect(schema).toBe("mocked schema");
    expect(loadConfig).toHaveBeenCalledWith({ rootDir: process.cwd() });
  });

  it("should cache the schema after the first call", async () => {
    const schema1 = await getSchema();
    const schema2 = await getSchema();

    expect(schema1).toBe("mocked schema");
    expect(schema2).toBe("mocked schema");
    expect(mockGetSchema).toHaveBeenCalledTimes(1);
  });

  it("should load the real schema from __tests__/.graphqlrc.yml", async () => {
    jest.unmock("graphql-config");
    const { loadConfig: actualLoadConfig } = await import("graphql-config");

    const configPath = path.resolve(
      process.cwd(),
      "src/__tests__/.graphqlrc.yml"
    );
    loadConfig.mockImplementation(async (options) =>
      actualLoadConfig({ ...options, filepath: configPath })
    );

    const schema = await getSchema();

    expect(schema).toBeDefined();
  });
});
