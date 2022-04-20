import axios from 'axios';
import { Block } from '../types/archive';
import endpoint from './endpoint';

const defaultProperties: (keyof Block)[] = [
  'number',
  'hash',
  'parentHash',
  'nonce',
  'sha3Uncles',
  'transactionRoot',
  'stateRoot',
  'miner',
  'extraData',
  'gasLimit',
  'gasUsed',
  'timestamp',
  'size',
  'difficulty',
  'totalDifficulty',
  'uncles',
];

export default async function blocks({
  startBlock,
  endBlock,
  properties = defaultProperties,
}: {
  startBlock: number;
  endBlock: number;
  properties?: (keyof Block)[];
}) {
  try {
    const response = await axios({
      url: endpoint,
      method: 'post',
      data: {
        variables: {
          startBlock,
          endBlock,
        },
        query: `
        query Blocks($startBlock: Float!, $endBlock: Float!) {
          blocks(
            sort: BLOCKNUMBER_ASC
            filter: {
              _operators: {
                blockNumber: {
                  gte: $startBlock,
                  lte: $endBlock
                }
              }
            }
          ) {
            ${properties.join(',')}
          }
        }
      `,
      },
    });
    return response.data.data.blocks as Block[];
  } catch (e: any) {
    console.log(JSON.stringify(e.response.data.errors, null, 2));
    throw new Error(e.message);
  }
}
