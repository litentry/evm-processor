import { web3 } from 'indexer-utils';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import ERC20 from '@openzeppelin/contracts/build/contracts/ERC20.json';

export default async function fetchTokenData(address: string, nft = false) {
  const contract = new (web3().eth.Contract)(ERC20.abi as AbiItem[], address);

  if (nft) {
    // we can just use the ERC20 contract as the name method is the same
    const name = await getTokenProperty('name', address, contract);
    return {
      name,
      decimals: null,
      symbol: null,
    };
  }

  let decimals: number | null;
  try {
    const response = await contract.methods.decimals().call();
    decimals = response;
  } catch (e) {
    decimals = null;
  }
  const name = await getTokenProperty('name', address, contract);
  const symbol = await getTokenProperty('symbol', address, contract);

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
  contract: Contract,
) {
  // hard coded override
  if (
    property === 'symbol' &&
    address === '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a'
  ) {
    return 'DGD';
  }

  let value = null;

  try {
    // try the normal way
    value = await contract.methods[property]().call();
  } catch (e) {
    try {
      // try as bytes
      const contractBytes = new (web3().eth.Contract)(
        abiBytesMethod(property),
        address,
      );
      const bytesValue = await contractBytes.methods[property]().call();
      if (
        bytesValue !==
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      ) {
        value = web3().utils.hexToString(bytesValue);
      }
    } catch (e) {
      // use default null
    }
  }

  return value;
}

const abiBytesMethod = (name: string) =>
  [
    {
      constant: true,
      inputs: [],
      name,
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
  ] as AbiItem[];
