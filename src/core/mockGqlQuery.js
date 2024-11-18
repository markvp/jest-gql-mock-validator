export const mockGqlQuery = () => {
  const internalMock = jest.fn();

  internalMock.mockResolvedGqlOnce = async (query, response) => {
    await expect(response).toMatchGqlMock(query);

    internalMock.mockResolvedValueOnce(response);
  };

  return internalMock;
};
