import path from "path";
import { parseQuery } from "../parseQuery";
import mutateUser from "./gql/mutateUser.gql";
import queryUser from "./gql/queryUser.gql";
import queryUserWithFragment from "./gql/queryUserWithFragment.gql";
import queryUsers from "./gql/queryUsers.gql";
import queryAliasedUsers from "./gql/queryAliasedUsers.gql";
import queryUsersAndTeams from "./gql/queryUsersAndTeams.gql";
import { loadConfig } from "graphql-config";

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

describe("parseQuery", () => {
  it("identifies required and non-required fields for single user query", async () => {
    const result = await parseQuery(queryUser);
    expect(result).toEqual({
      getUser: false,
      "getUser.id": true,
      "getUser.username": true,
      "getUser.email": false,
      "getUser.profile": false,
      "getUser.profile.age": true,
      "getUser.profile.bio": false,
      "getUser.profile.addresses": true,
      "getUser.profile.addresses.street": true,
      "getUser.profile.addresses.city": false,
      "getUser.profile.addresses.zipCode": false,
    });
  });


  it("identifies required and non-required fields for single user query", async () => {
    const result = await parseQuery(queryUserWithFragment);
    expect(result).toEqual({
      getUser: false,
      "getUser.id": true,
      "getUser.username": true,
      "getUser.email": false,
      "getUser.profile": false,
      "getUser.profile.age": true,
      "getUser.profile.bio": false,
      "getUser.profile.addresses": true,
      "getUser.profile.addresses.street": true,
      "getUser.profile.addresses.city": false,
      "getUser.profile.addresses.zipCode": false,
    });
  });


  it("identifies required fields with nested arrays and optional nested fields", async () => {
    const result = await parseQuery(queryUsers);
    expect(result).toEqual({
      getUsers: true,
      "getUsers.id": true,
      "getUsers.username": true,
      "getUsers.tags": false,
      "getUsers.profile": false,
      "getUsers.profile.addresses": true,
      "getUsers.profile.addresses.street": true,
      "getUsers.profile.addresses.city": false,
      "getUsers.profile.addresses.zipCode": false,
    });
  });

  it("identifies aliased queries", async () => {
    const result = await parseQuery(queryAliasedUsers);
    expect(result).toEqual({
      users: true,
      "users.id": true,
      "users.username": true,
      "users.tags": false,
      "users.profile": false,
      "users.profile.addresses": true,
      "users.profile.addresses.street": true,
      "users.profile.addresses.city": false,
      "users.profile.addresses.zipCode": false,
    });
  });

  it("handles multiple queries", async () => {
    const result = await parseQuery(queryUsersAndTeams);
    expect(result).toEqual({
      getUsers: true,
      "getUsers.id": true,
      "getUsers.username": true,
      "getUsers.tags": false,
      "getUsers.profile": false,
      "getUsers.profile.addresses": true,
      "getUsers.profile.addresses.street": true,
      "getUsers.profile.addresses.city": false,
      "getUsers.profile.addresses.zipCode": false,
      getTeams: true,
      "getTeams.id": true,
      "getTeams.location": false,
    });
  });

  it("parses the deleteUser mutation", async () => {
    const result = await parseQuery(mutateUser);

    expect(result).toEqual({
      deleteUser: false,
      "deleteUser.id": true,
      "deleteUser.username": true,
      "deleteUser.email": false,
    });
  });
});
