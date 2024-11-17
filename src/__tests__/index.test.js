import { setupJestExtensions, mockGqlQuery } from "../index.js";
import { toMatchGqlMock } from "../core/toMatchGqlMock.js";

jest.mock("../core/toMatchGqlMock", () => ({
  toMatchGqlMock: jest.fn(),
}));

describe("index.js", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sets up Jest matchers if Jest is available", () => {
    const extendSpy = jest.spyOn(expect, "extend");
    const warnSpy = jest.spyOn(console, "warn");

    setupJestExtensions();

    expect(extendSpy).toHaveBeenCalledWith({ toMatchGqlMock });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("exports mockGqlQuery", () => {
    expect(typeof mockGqlQuery).toBe("function");
  });
});
