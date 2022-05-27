export default (targetInvocations: number, maxTime: number, fn: () => any) =>
  new Promise((resolve) => {
    let invocation = 0;
    const startTime = new Date().getTime();
    const endTime = startTime + (maxTime * 1000)

    const callFn = async () => {
      invocation++
      const invocationStartTime = new Date().getTime();
      await fn();
      const invocationEndTime = new Date().getTime();
      const invocationTime = invocationEndTime - invocationStartTime;
      console.log(`Invocation ${invocation} of ${targetInvocations} took ${invocationTime}ms`);

      if (invocation >= targetInvocations) {
        return resolve(null);
      }

      const remainingTime = endTime - new Date().getTime();
      const predictedExecutionTimeRemaining = invocationTime * invocation;
      const waitTime = (remainingTime - predictedExecutionTimeRemaining) / (targetInvocations - invocation);

      if (waitTime < 0) {
        console.log(`Command is running behind schedule - maybe reduce the number of invocations?`);
      }

      setTimeout(callFn, waitTime);
    };

    callFn();
  });
