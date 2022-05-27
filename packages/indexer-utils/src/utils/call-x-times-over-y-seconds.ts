export default (iterations: number, maxTime: number, fn: () => any) =>
  new Promise((resolve) => {
    const interval = (maxTime * 1000) / iterations;

    const callFn = () => {
      fn();
      if (--iterations <= 0) {
        return resolve(null);
      }
      setTimeout(callFn, interval);
    };

    callFn();
  });
