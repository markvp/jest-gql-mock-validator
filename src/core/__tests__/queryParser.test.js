import { getQueryParser } from "../queryParser";
import schemaAST from "./schema.graphql";
import queryUser from "./gql/queryUser.gql";
import queryUsers from "./gql/queryUsers.gql";
import queryUsersAndTeams from "./gql/queryUsersAndTeams.gql";
import { buildASTSchema } from "graphql";

const schema = buildASTSchema(schemaAST);
// Build schema from .graphql string
const parseQuery = getQueryParser(schema);

describe("getQueryParser", () => {
  it("identifies required and non-required fields for single user query", () => {
    const result = parseQuery(queryUser);
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

  it("identifies required fields with nested arrays and optional nested fields", () => {
    const result = parseQuery(queryUsers);
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

  it("handles multiple queries", () => {
    const result = parseQuery(queryUsersAndTeams);
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
});
