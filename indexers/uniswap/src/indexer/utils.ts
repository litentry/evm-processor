export function getIntermediatePath(path: string[]): string | undefined {
  if (path.length == 2) return undefined;

  const intermediatePath = path.slice(1, path.length - 1);

  let formattedIntermediatePath = '';
  for (let i = 0; i < intermediatePath.length; i++) {
    formattedIntermediatePath += `${intermediatePath[i]}`;

    if (i != intermediatePath.length - 1) {
      formattedIntermediatePath += ',';
    }
  }

  return formattedIntermediatePath;
}

export function findMethodsInInput(input: string, methods: string[]) {
  return methods.filter((method) => input.includes(method));
}

export function removePrefix(input: string) {
  if (input.substring(0, 2) === '0x') {
    return input.substring(2);
  }
  return input;
}

export function filterCalls(calls: string[], methodIds: string[]): string[] {
  return calls.filter((call) =>
    methodIds.find((methodId) => removePrefix(call).startsWith(methodId)),
  );
}

export function getMethodIdFromCall(input: string) {
  return input.substring(2, 10);
}
