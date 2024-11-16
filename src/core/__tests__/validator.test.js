import { validateMockData } from "../validator";

describe("validateMockData", () => {
  it("should pass when mock data matches field definitions", () => {
    const fieldDefinitions = {
      getUser: true,
      "getUser.id": true,
      "getUser.username": true,
      "getUser.email": false,
      "getUser.profile": false,
      "getUser.profile.age": true,
      "getUser.profile.addresses": true,
      "getUser.profile.addresses.street": true,
    };

    const response = {
      getUser: {
        id: "123",
        username: "test_user",
        profile: {
          age: 30,
          addresses: [
            {
              street: "123 Main St",
            },
          ],
        },
      },
    };

    const errors = validateMockData(fieldDefinitions, response);
    expect(errors).toEqual([]);
  });

  it("should fail when required fields are missing", () => {
    const fieldDefinitions = {
      getUser: true,
      "getUser.id": true,
      "getUser.username": true,
      "getUser.profile": true,
      "getUser.profile.age": true,
    };

    const response = {
      getUser: {
        username: "test_user",
      },
    };

    const errors = validateMockData(fieldDefinitions, response);
    expect(errors).toEqual([
      'Missing required field "getUser.id" in mock data',
      'Missing required field "getUser.profile" in mock data',
    ]);
  });

  it("should fail when unexpected fields are present", () => {
    const fieldDefinitions = {
      getUser: true,
      "getUser.id": true,
      "getUser.username": true,
    };

    const response = {
      getUser: {
        id: "123",
        username: "test_user",
        extraField: "unexpected",
      },
    };

    const errors = validateMockData(fieldDefinitions, response);
    expect(errors).toEqual([
      'Unexpected field "getUser.extraField" in mock data',
    ]);
  });

  it("should handle multiple queries correctly", () => {
    const fieldDefinitions = {
      getUsers: true,
      "getUsers.id": true,
      "getUsers.username": true,
      getTeams: true,
      "getTeams.id": true,
      "getTeams.location": false,
    };

    const response = {
      getUsers: {
        id: "123",
        username: "test_user",
      },
      getTeams: {
        id: "team123",
      },
    };

    const errors = validateMockData(fieldDefinitions, response);
    expect(errors).toEqual([]); // No validation errors
  });

  it("should detect missing fields and unexpected fields in multiple queries", () => {
    const fieldDefinitions = {
      getUsers: true,
      "getUsers.id": true,
      "getUsers.username": true,
      getTeams: true,
      "getTeams.id": true,
      "getTeams.location": false,
    };

    const response = {
      getUsers: {
        username: "test_user",
        extraField: "unexpected",
      },
      getTeams: {
        location: "NY",
      },
    };

    const errors = validateMockData(fieldDefinitions, response);
    expect(errors).toEqual([
      'Unexpected field "getUsers.extraField" in mock data',
      'Missing required field "getUsers.id" in mock data',
      'Missing required field "getTeams.id" in mock data',
    ]);
  });

  it("should allow missing required fields of optional objects", () => {
    const fieldDefinitions = {
      getUser: true,
      "getUser.id": true,
      "getUser.profile": false,
      "getUser.profile.bio": true,
    };
    const response = {
      getUser: {
        id: "2",
      },
    };

    expect(validateMockData(fieldDefinitions, response)).toEqual([]);
  });

  it("should fail when required array entries are missing", () => {
    const fieldDefinitions = {
      getUser: true,
      "getUser.profile": true,
      "getUser.profile.bio": false,
      "getUser.profile.addresses": true,
      "getUser.profile.addresses.street": true,
      "getUser.profile.addresses.city": false,
    };
    const response = {
      getUser: {
        profile: {
          bio: "Amazing",
        },
      },
    };

    expect(validateMockData(fieldDefinitions, response)).toEqual([
      'Missing required field "getUser.profile.addresses" in mock data',
    ]);
  });

  it("should fail when required array entries are missing required fields", () => {
    const fieldDefinitions = {
      getUser: true,
      "getUser.profile": true,
      "getUser.profile.addresses": true,
      "getUser.profile.addresses.street": true,
      "getUser.profile.addresses.city": false,
    };
    const response = {
      getUser: {
        profile: {
          addresses: [{ city: "New York" }, { street: "456 Elm St" }],
        },
      },
    };

    expect(validateMockData(fieldDefinitions, response)).toEqual([
      'Array item validation failed at "getUser.profile.addresses[0]" -> Missing required field "street" in mock data',
    ]);
  });

  it("should fail when optional array contains invalid objects", () => {
    const fieldDefinitions = {
      getUser: true,
      "getUser.id": true,
      "getUser.username": true,
      "getUser.profile": true,
      "getUser.profile.age": true,
      "getUser.profile.addresses": false,
      "getUser.profile.addresses.street": true,
      "getUser.profile.addresses.city": false,
    };
    const response = {
      getUser: {
        id: "123",
        username: "test_user",
        profile: {
          age: 30,
          addresses: [{ city: "New York" }],
        },
      },
    };

    expect(validateMockData(fieldDefinitions, response)).toEqual([
      'Array item validation failed at "getUser.profile.addresses[0]" -> Missing required field "street" in mock data',
    ]);
  });

  it("should allow when array with required fields is empty", () => {
    const fieldDefinitions = {
      getUser: true,
      "getUser.id": true,
      "getUser.username": true,
      "getUser.profile": true,
      "getUser.profile.age": true,
      "getUser.profile.addresses": true,
      "getUser.profile.addresses.street": true,
    };
    const response = {
      getUser: {
        id: "123",
        username: "test_user",
        profile: {
          age: 30,
          addresses: [],
        },
      },
    };

    expect(validateMockData(fieldDefinitions, response)).toEqual([]);
  });
});
