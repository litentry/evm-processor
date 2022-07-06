import getInfraStack from './get-infra-stack';

type InputMap<T> = {
  [p in keyof T]: string;
};

export async function getSpecifiedOutputs<
  OutputType extends { [k: string]: string | number },
>(
  stackName: string,
  desiredOutputs: InputMap<Partial<OutputType>>,
): Promise<OutputType> {
  const stack = await getInfraStack(stackName);

  const desiredOutputMapKeys = Object.keys(desiredOutputs);
  const desiredOutputKeys = Object.values(desiredOutputs);

  const resolvedOutputs = stack.Outputs!.reduce((values, output) => {
    const index = desiredOutputKeys.indexOf(output.OutputKey!);
    if (index > -1) {
      return {
        ...values,
        [desiredOutputMapKeys[index]]: output.OutputValue,
      };
    }
    return values;
  }, {} as OutputType);

  for (const desired of Object.entries(desiredOutputs)) {
    if (!resolvedOutputs[desired[0]]) {
      throw new Error(
        `Unable to resolve param ${desired[0]} from ${stackName}.${desired[1]}`,
      );
    }
  }

  return resolvedOutputs;
}

export default getSpecifiedOutputs;
