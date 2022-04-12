import { EVM } from 'evm';

export default function getContractSignatures(code: string) {
  const evm = new EVM(code);
  const opcodes = evm.getOpcodes();

  return [
    ...new Set(
      opcodes
        .filter((opcode) => opcode.name === 'PUSH4')
        .map((opcode) =>
          opcode.pushData ? opcode.pushData.toString('hex') : ''
        )
    ),
  ] as string[];
}
