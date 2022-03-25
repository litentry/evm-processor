export default function getIntermediatePath(path: string[]): string | null {
  if (path.length == 2) return null;

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
