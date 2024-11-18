import { loadConfig } from "graphql-config";
import path from "path";
import { toMatchGqlMock } from "../toMatchGqlMock.js";
import queryUser from "./gql/queryUser.gql";
import queryUsers from "./gql/queryUsers.gql";

const actualGraphqlConfig = jest.requireActual("graphql-config");

jest.mock("graphql-config", () => ({
  loadConfig: jest.fn(),
}));

beforeAll(() => {
  // Mock loadConfig to point to the test .graphqlrc.yml
  loadConfig.mockResolvedValue(
    actualGraphqlConfig.loadConfig({
      filepath: path.resolve(__dirname, "../../__tests__/.graphqlrc.yml"),
    })
  );
});

describe("toMatchGqlMock", () => {
  it("validates mock data against a simple query", async () => {
    const mockData = {
      getUser: {
        id: "123",
        username: "testUser",
        email: "test@example.com",
        profile: {
          age: 30,
          bio: "Software developer",
          addresses: [
            {
              street: "123 Main St",
              city: "Sample City",
              zipCode: "12345",
            },
          ],
        },
      },
    };

    const result = await toMatchGqlMock(mockData, queryUser);

    // Assertions
    expect(result.pass).toBe(true);
    expect(result.message()).toContain(
      "Expected data to match the GraphQL query structure"
    );
  });

  it("fails validation when mock data is missing required fields", async () => {
    const mockData = {
      getUser: {
        username: "testUser",
        email: "test@example.com",
      },
    };

    const result = await toMatchGqlMock(mockData, queryUser);

    // Assertions
    expect(result.pass).toBe(false);
    expect(result.message()).toContain("Mock data validation failed");
    expect(result.message()).toContain(
      'Missing required field "getUser.id" in mock data'
    );
  });

  it("validates mock data with nested arrays", async () => {
    const mockData = {
      getUsers: [
        {
          id: "123",
          username: "user1",
          profile: {
            addresses: [
              { street: "123 Main St", city: "Sample City" },
              { street: "456 Side St", city: "Other City" },
            ],
          },
        },
        {
          id: "456",
          username: "user2",
          profile: {
            addresses: [{ street: "789 Another Rd", city: "Another City" }],
          },
        },
      ],
    };

    const result = await toMatchGqlMock(mockData, queryUsers);

    // Assertions
    expect(result.pass).toBe(true);
  });

  it("fails validation with invalid nested fields", async () => {
    const mockData = {
      getUsers: [
        {
          id: "123",
          username: "user1",
          profile: {
            addresses: [{ city: "New York" }],
          },
        },
      ],
    };

    const result = await toMatchGqlMock(mockData, queryUsers);

    // Assertions
    expect(result.pass).toBe(false);
    expect(result.message()).toContain("Mock data validation failed");
    expect(result.message()).toContain(
      'Array item validation failed at "profile.addresses[0]"'
    );
    expect(result.message()).toContain(
      'Missing required field "street" in mock data'
    );
  });
});
