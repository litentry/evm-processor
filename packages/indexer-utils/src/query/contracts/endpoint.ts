export function endpoint() {
  if (!process.env.CONTRACT_GRAPH) {
    throw new Error(
      'process.env.ARCHIVE_GRAPH should be set if you are querying the archive',
    );
  }
  return process.env.CONTRACT_GRAPH!;
}

export default endpoint;
