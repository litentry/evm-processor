import colors from 'colors';

if (!process.env.CONTRACT_GRAPH) {
  console.log(
    `\n${colors.bgMagenta(
      'process.env.CONTRACT_GRAPH should be set if you are querying the contracts archive',
    )}\n`,
  );
}

const endpoint = process.env.CONTRACT_GRAPH!;

export default endpoint;
