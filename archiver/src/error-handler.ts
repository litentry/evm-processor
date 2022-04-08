export function attachHandlers(cleanup: () => Promise<void>) {
  process.on('beforeExit', async (code) => {
    console.log(`\nCleaning up (exit code ${code})...`);
    try {
      await cleanup();
      console.log('Cleanup complete!');
    } catch (e) {
      console.log('Failed to cleanup!');
      console.error(e);
    }
    process.exit(code);
  });

  process.on('SIGINT', () => {
    process.emit('beforeExit', 2);
  });

  process.on('uncaughtException', (err: any) => {
    console.error({ err });
    process.emit('beforeExit', 1);
  });

  process.on('unhandledRejection', (err: any) => {
    console.error({ err });
    process.emit("beforeExit", 1);
  });
}

export default attachHandlers;