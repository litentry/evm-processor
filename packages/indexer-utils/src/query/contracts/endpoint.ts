export function endpoint() {
  if (!process.env.CONTRACT_GRAPH) {
    throw new Error(
      'process.env.CONTRACT_GRAPH should be set if you are querying the contract archive',
    );
  }
  return process.env.CONTRACT_GRAPH!;
}

export default endpoint;
