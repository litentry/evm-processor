import { Types, indexer } from 'indexer-utils';
import extract from './extract';
import transform from './transform';
import load from './load';

export default async function handler(startBlock: number, endBlock: number) {
  return indexer<
    {
      events721: Types.Contract.DecodedContractEvent[];
      eventsSingle1155: Types.Contract.DecodedContractEvent[];
      eventsBatch1155: Types.Contract.DecodedContractEvent[];
    },
    {
      nfts: Types.Nft.ERC721Token[];
      sfts: Types.Nft.ERC1155Token[];
    }
  >(startBlock, endBlock, extract, transform, load);
}
