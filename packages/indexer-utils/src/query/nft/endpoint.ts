export function endpoint() {
  if (!process.env.NFT_GRAPH) {
    throw new Error(
      'process.env.NFT_GRAPH should be set if you are querying the nft archive',
    );
  }
  return process.env.NFT_GRAPH!;
}

export default endpoint;
