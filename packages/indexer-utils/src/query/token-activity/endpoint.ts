import colors from 'colors';

if (!process.env.TOKEN_ACTIVITY_GRAPH) {
  console.log(
    `\n${colors.bgMagenta(
      'process.env.TOKEN_ACTIVITY_GRAPH should be set if you are querying the token activity archive',
    )}\n`,
  );
}

const endpoint = process.env.TOKEN_ACTIVITY_GRAPH!;

export default endpoint;
