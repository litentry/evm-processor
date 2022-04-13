if (!process.env.ARCHIVE_GRAPH) {
  console.log(
    'process.env.ARCHIVE_GRAPH to be set, ignore if you are not querying the archive'
  );
}

const endpoint = process.env.ARCHIVE_GRAPH!;

export default endpoint;
