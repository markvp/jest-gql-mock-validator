import { loadConfig } from "graphql-config";

let _schema = null;

const retrieveSchema = async () => {
  const config = await loadConfig({ rootDir: process.cwd() });
  return await config.getDefault().getSchema();
};

export const getSchema = async () => (_schema ??= await retrieveSchema());
