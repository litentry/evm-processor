import yargs from 'yargs';

export type Context = {
  options: {
    [k: string]: string
  }
  env: {
    [k: string]: string
  }
}
export async function getContext (): Promise<Context> {
  const args = yargs(process.argv.slice(2)).argv;
  const context = {
    options: Object
      .entries(args)
      .filter(([key]) => key !== '_' && key !== '$0')
      .reduce((all, [key, value]) => ({
        ...all,
        [key]: value
      }), {}),
    env: process.env
  }
  return context;
}
