import { GraphQLList, GraphQLNonNull } from "graphql";
const GRAPHQL_FIELD = "Field";

const getFieldType = (_type) =>
  _type instanceof GraphQLNonNull ? _type.ofType : _type;
const getFieldTypeFromPossibleList = (_type) =>
  getFieldType(_type instanceof GraphQLList ? _type.ofType : _type);

/**
 * Creates a parser function that processes GraphQL queries to identify required fields
 * based on the provided schema.
 *
 * @param {GraphQLSchema} schema - The GraphQL schema to validate against.
 * @returns {Function} A function that, when called with an array of query selections,
 *                     returns the root type and required fields for each query.
 */
export const getQueryParser = (schema) => {
  const typeMap = schema.getTypeMap();

  /**
   * Parses GraphQL query selections to determine required fields.
   *
   * @param {Object} query - An object containing the GraphQL query definitions.
   * @param {Array<Object>} query.definitions - An array of GraphQL query definitions.
   * @returns {Array<{ rootType: string, requiredFields: Record<string, boolean> }>} An array of parsed query data.
   *          Each item contains the root type and a map of required fields, where each field path is mapped to a boolean.
   */
  return ({ definitions }) =>
    Object.assign(
      {},
      ...definitions.map(({ selectionSet: rootSelections }) => {
        const checkFields = (
          typeName,
          { selections = [] } = {},
          parentPath = ""
        ) =>
          selections.reduce(
            (fields, { kind, name: { value: fieldName }, selectionSet }) => {
              if (kind !== GRAPHQL_FIELD) {
                return fields;
              }

              const {
                [fieldName]: { type: fieldType },
              } = typeMap[typeName].getFields();

              return Object.assign(
                fields,
                {
                  [parentPath ? `${parentPath}.${fieldName}` : fieldName]:
                    fieldType instanceof GraphQLNonNull,
                },
                selectionSet
                  ? checkFields(
                      getFieldTypeFromPossibleList(getFieldType(fieldType)),
                      selectionSet,
                      parentPath ? `${parentPath}.${fieldName}` : fieldName
                    )
                  : {}
              );
            },
            {}
          );

        return checkFields("Query", rootSelections);
      })
    );
};
