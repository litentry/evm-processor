import { CloudFormation} from "aws-sdk";

const cachedStacks: {[stackId: string]: any} = {};

export async function getInfraStack(stackName: string): Promise<CloudFormation.Stack> {
  if (!cachedStacks[stackName]) {
    const cfn = new CloudFormation();
    cachedStacks[stackName] = (await cfn.describeStacks({
      StackName: stackName,
    }).promise()).Stacks[0];
  }
  return cachedStacks[stackName];
}

export default getInfraStack;