import path from "path";
import { mockGqlQuery } from "../mockGqlQuery.js";
import { toMatchGqlMock } from "../toMatchGqlMock.js";
import queryUser from "./gql/queryUser.gql";
import { loadConfig } from "graphql-config";

expect.extend({ toMatchGqlMock });

const actualGraphqlConfig = jest.requireActual("graphql-config");

jest.mock("graphql-config", () => ({
  loadConfig: jest.fn(),
}));

beforeAll(() => {
  loadConfig.mockResolvedValue(
    actualGraphqlConfig.loadConfig({
      filepath: path.resolve(__dirname, "../../__tests__/.graphqlrc.yml"),
    })
  );
});

describe("mockGqlQuery", () => {
  it("sets up a mocked GraphQL query with a valid response", async () => {
    const mockFn = mockGqlQuery();
    const mockResponse = {
      getUser: {
        id: "123",
        username: "testUser",
        email: "test@example.com",
      },
    };

    await mockFn.mockResolvedGqlOnce(queryUser, mockResponse);

    const result = await mockFn();

    expect(result).toEqual(mockResponse);
  });

  it("throws an error when the response does not match the query", async () => {
    const mockFn = mockGqlQuery();
    const invalidResponse = {
      getUser: {
        username: "testUser",
      },
    };

    await expect(
      mockFn.mockResolvedGqlOnce(queryUser, invalidResponse)
    ).rejects.toThrow(/Mock data validation failed/);
  });

  it("allows multiple mocked queries with different responses", async () => {
    const mockFn = mockGqlQuery();

    const firstResponse = {
      getUser: {
        id: "123",
        username: "firstUser",
      },
    };

    const secondResponse = {
      getUser: {
        id: "456",
        username: "secondUser",
      },
    };

    await mockFn.mockResolvedGqlOnce(queryUser, firstResponse);
    await mockFn.mockResolvedGqlOnce(queryUser, secondResponse);

    const result1 = await mockFn();
    const result2 = await mockFn();

    expect(result1).toEqual(firstResponse);
    expect(result2).toEqual(secondResponse);
  });
});
