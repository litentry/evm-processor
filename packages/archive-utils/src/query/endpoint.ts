import colors from 'colors';

if (!process.env.ARCHIVE_GRAPH) {
  console.log(
    `\n${colors.bgMagenta(
      'process.env.ARCHIVE_GRAPH should be set if you are querying the archive'
    )}\n`
  );
}
if (!process.env.CONTRACT_GRAPH) {
  console.log(
    `\n${colors.bgMagenta(
      'process.env.CONTRACT_GRAPH should be set if you are querying the contracts archive'
    )}\n`
  );
}

const endpoint = process.env.ARCHIVE_GRAPH!;
export const contractEndpoint = process.env.CONTRACT_GRAPH!;

export default endpoint;
