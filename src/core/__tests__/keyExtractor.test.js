import { getKeys } from "../keyExtractor";

describe("getKeys", () => {
  it("flattens a simple object with no nesting", () => {
    const input = { name: "Alice", age: 30 };
    const result = getKeys(input);
    expect(result).toEqual(["name", "age"]);
  });

  it("flattens a nested object with dot notation", () => {
    const input = { user: { name: "Alice", address: { city: "Wonderland" } } };
    const result = getKeys(input);
    expect(result).toEqual([
      "user",
      "user.name",
      "user.address",
      "user.address.city",
    ]);
  });

  it("ignores arrays and treats them as values", () => {
    const input = { user: { name: "Alice", hobbies: ["reading", "chess"] } };
    const result = getKeys(input);
    expect(result).toEqual(["user", "user.name", "user.hobbies"]);
  });

  it("handles deeply nested objects", () => {
    const input = { level1: { level2: { level3: { level4: "deepValue" } } } };
    const result = getKeys(input);
    expect(result).toEqual([
      "level1",
      "level1.level2",
      "level1.level2.level3",
      "level1.level2.level3.level4",
    ]);
  });

  it("handles an empty object", () => {
    const input = {};
    const result = getKeys(input);
    expect(result).toEqual([]);
  });

  it("handles a complex object with mixed types", () => {
    const input = {
      user: {
        name: "Alice",
        age: 30,
        address: { city: "Wonderland", postalCode: "12345" },
        active: true,
        tags: ["admin", "editor"],
      },
      settings: {
        theme: "dark",
        notifications: { email: true, sms: false },
      },
    };
    const result = getKeys(input);
    expect(result).toEqual([
      "user",
      "user.name",
      "user.age",
      "user.address",
      "user.address.city",
      "user.address.postalCode",
      "user.active",
      "user.tags",
      "settings",
      "settings.theme",
      "settings.notifications",
      "settings.notifications.email",
      "settings.notifications.sms",
    ]);
  });

  it("returns a consistent set of keys when all sub-objects match in structure", () => {
    const input = {
      users: [
        { id: 1, name: "Alice", address: { city: "Wonderland", zip: "12345" } },
        { id: 2, name: "Bob", address: { city: "Builderland", zip: "67890" } },
      ],
      active: true,
    };

    const result = getKeys(input);

    expect(result).toEqual([
      "users",
      "users.id",
      "users.name",
      "users.address",
      "users.address.city",
      "users.address.zip",
      "active",
    ]);
  });

  it("collates all unique keys when sub-objects have missing fields", () => {
    const input = {
      users: [
        { id: 1, name: "Alice", address: { city: "Wonderland" } }, // Missing zip
        { id: 2, age: 30, address: { country: "Wonderland" } }, // Different fields in address
      ],
      active: true,
    };

    const result = getKeys(input);

    expect(result).toEqual([
      "users",
      "users.id",
      "users.name",
      "users.address",
      "users.address.city",
      "users.age",
      "users.address.country",
      "active",
    ]);
  });
});
