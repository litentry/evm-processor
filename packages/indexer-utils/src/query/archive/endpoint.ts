import colors from 'colors';

if (!process.env.ARCHIVE_GRAPH) {
  console.log(
    `\n${colors.bgMagenta(
      'process.env.ARCHIVE_GRAPH should be set if you are querying the archive'
    )}\n`
  );
}

const endpoint = process.env.ARCHIVE_GRAPH!;

export default endpoint;
