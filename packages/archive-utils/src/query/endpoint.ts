if (!process.env.ARCHIVE_GRAPH) {
  throw new Error('archive-utils requires process.env.ARCHIVE_GRAPH to be set');
}

const endpoint = process.env.ARCHIVE_GRAPH;

export default endpoint;
