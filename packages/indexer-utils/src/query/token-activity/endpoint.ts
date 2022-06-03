export function endpoint() {
  if (!process.env.TOKEN_ACTIVITY_GRAPH) {
    throw new Error(
      'process.env.ARCHIVE_GRAPH should be set if you are querying the archive',
    );
  }
  return process.env.TOKEN_ACTIVITY_GRAPH!;
}

export default endpoint;
