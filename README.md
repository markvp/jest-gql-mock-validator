
# Jest GraphQL Mock Validator

A Jest utility for validating GraphQL mocks against your schema and simplifying GraphQL API testing by providing mockable query functionality.

## Installation

To install the library, use npm or yarn:

```bash
npm install jest-gql-mock-validator --save-dev
```

or

```bash
yarn add jest-gql-mock-validator --dev
```

---

## Setup

To enable the library in your Jest environment, you need to extend Jest with the custom matchers and mocks provided by `jest-gql-mock-validator`.

### 1. Configure Jest to use jest-gql-mock-validator
Update your `jest.config.js` to include the setup file:

```javascript
module.exports = {
  setupFilesAfterEnv: ["jest-qgl-mock-validator"],
};
```

### 2. Configure schema via GraphQL-Config

This library uses [graphql-config](https://graphql-config.com/) to manage and load your GraphQL schema. Ensure you have a valid `graphql-config` configuration file in your project root.

#### Supported Configuration Files

- `.graphqlrc`
- `.graphqlrc.json`
- `.graphqlrc.yaml` or `.graphqlrc.yml`
- `graphql.config.js`

#### Example `.graphqlrc.yml`

Create a `.graphqlrc.yml` file in your project root to specify the schema location:

```yaml
schema: ./schema.graphql
```

#### Documentation

For more details on how to configure `graphql-config`, refer to the [graphql-config documentation](https://graphql-config.com/docs).


---

## Usage

The library provides utilities for:

1. Validating the JSON response against the provided GraphQL query when mocking a response.
2. Independently validating a JSON object against a provided GraphQL query.

### 1. Validate mocked query or mutation responses

Use `mockGqlQuery()` to construct a mock in lieu of `jest.fn()` to allow the use of `.mockResolvedGqlOnce()` to validate the response against the provided GraphQL queries or mutations:

```javascript
import { mockGqlQuery } from "jest-gql-mock-validator";
import { getUsers } from "./queries";

// construct a mock that enables .mockResolvedGqlOnce below
const mockSendQuery = mockGqlQuery();

// validate that the JSON response being provided to the user is valid for the provided gql query or mutation
mockSendQuery.mockResolvedGqlOnce(getUsers, {
  getUsers: [
    { id: "1", username: "Alice" },
    { id: "2", username: "Bob" },
  ],
});
```

### 2. Validate a JSON object against a gql query or mutation

Use the custom matcher `expect().toMatchGqlMock()` to validate a JSON object against the GraphQL query or mutation:

```javascript
expect(response).toMatchGqlMock(query);
```

For example:

```javascript
import { toMatchGqlMock } from "jest-gql-mock-validator";
import { getUsers } from "./queries";

const mockResponse = {
  getUsers: [
    { id: "1", username: "Alice" },
    { id: "2", username: "Bob" },
  ],
};

expect(mockResponse).toMatchGqlMock(getUsers);
```

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add feature"`).
4. Push to your branch (`git push origin feature-name`).
5. Open a pull request.

---

## License

This library is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---
