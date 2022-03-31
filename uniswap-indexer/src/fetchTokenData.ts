import * as ethers from 'ethers';
import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json';

export default async function fetchTokenData(address: string) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_ENDPOINT
  );
  const contract = new ethers.Contract(address, ERC20.abi, provider);
  let decimals: bigint | null;
  try {
    const response = await contract.decimals();
    decimals = BigInt(response).valueOf();
  } catch (e) {
    decimals = null;
  }
  const name = await getTokenProperty('name', address, contract, provider);
  const symbol = await getTokenProperty('symbol', address, contract, provider);

  return {
    decimals,
    name,
    symbol,
  };
}

// Inspired by: https://github.com/thugs-defi/swap-subgraph/blob/master/src/mappings/helpers.ts
async function getTokenProperty(
  property: 'name' | 'symbol',
  address: string,
  contract: ethers.Contract,
  provider: ethers.providers.JsonRpcProvider
) {
  // hard coded override
  if (
    property === 'symbol' &&
    address === '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a'
  ) {
    return 'DGD';
  }

  // set default fallback
  let value = 'unknown';

  try {
    // try the normal way
    value = await contract[property]();
  } catch (e) {
    try {
      // try as bytes
      const contractBytes = new ethers.Contract(
        address,
        abiBytesMethod(property),
        provider
      );
      const bytesValue = await contractBytes[property]();
      if (
        bytesValue !==
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      ) {
        value = ethers.utils.parseBytes32String(bytesValue);
      }
    } catch (e) {
      // use default 'unknown
    }
  }

  return value;
}

const abiBytesMethod = (name: string) => [
  {
    constant: true,
    inputs: [],
    name: name,
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];
