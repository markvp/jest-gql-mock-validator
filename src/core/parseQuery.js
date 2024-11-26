import { GraphQLList, GraphQLNonNull } from "graphql";
import { getSchema } from "./getSchema";

const GRAPHQL_FIELD = "Field";
const GRAPHQL_FRAGMENT_SPREAD = "FragmentSpread";
const GRAPHQL_ROOT_SOURCE_BY_OPERATION = {
  query: "Query",
  mutation: "Mutation",
};

const getFieldType = (_type) =>
  _type instanceof GraphQLNonNull ? _type.ofType : _type;
const getFieldTypeFromPossibleList = (_type) =>
  getFieldType(_type instanceof GraphQLList ? _type.ofType : _type);

/**
 * Parses GraphQL query selections to determine required fields.
 *
 * @param {Object} query - An object containing the GraphQL query definitions.
 * @param {Array<Object>} query.definitions - An array of GraphQL query definitions.
 * @returns {Array<{ rootType: string, requiredFields: Record<string, boolean> }>} An array of parsed query data.
 *          Each item contains the root type and a map of required fields, where each field path is mapped to a boolean.
 */
export const parseQuery = async ({ definitions }) => {
  const schema = await getSchema();
  const typeMap = schema.getTypeMap();

  const {
    FragmentDefinition: fragments = [],
    OperationDefinition: operations = [],
  } = definitions.reduce(
    (result, { kind, ...definition }) => (
      (result[kind] ??= []).push(definition), result
    ),
    {}
  );

  const fragmentSelectionsByName = Object.fromEntries(
    fragments.map(({ name: { value }, selectionSet }) => [value, selectionSet])
  );

  return Object.assign(
    {},
    ...operations.map(({ operation, selectionSet: rootSelections }) => {
      const checkFields = (
        typeName,
        { selections = [] } = {},
        parentPath = ""
      ) =>
        selections.reduce(
          (fields, { kind, alias, name: { value }, selectionSet }) => {
            if (kind === GRAPHQL_FRAGMENT_SPREAD) {
              return Object.assign(
                fields,
                checkFields(
                  typeName,
                  fragmentSelectionsByName[value],
                  parentPath,
                )
              );
            }
            if (kind !== GRAPHQL_FIELD) {
              return fields;
            }

            const fieldName = alias?.value ?? value;

            const {
              [value]: { type: fieldType },
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

      return checkFields(
        GRAPHQL_ROOT_SOURCE_BY_OPERATION[operation],
        rootSelections
      );
    })
  );
};
