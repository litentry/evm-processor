export default (envVarName: string, required = true) => {
  const value = process.env[envVarName];

  if (required && value === undefined) {
    throw new Error(`Missing required env var ${envVarName}`);
  }

  return value;
};
