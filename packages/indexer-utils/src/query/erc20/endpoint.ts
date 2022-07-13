export function endpoint() {
  if (!process.env.ERC20_GRAPH) {
    throw new Error(
      'process.env.ERC20_GRAPH should be set if you are querying the erc20 archive',
    );
  }
  return process.env.ERC20_GRAPH!;
}

export default endpoint;
