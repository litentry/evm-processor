import { getX2Y2Logs } from './get-x2y2-logs';

describe('X2Y2 logs retrieval', () => {
  it('should retrieve archive logs for a specific block range', async () => {
    // use our eth graph
    process.env.ARCHIVE_GRAPH =
      'https://ethereum-archive-beta.graph.eng.litentry.io/graphql';
    const logs = await getX2Y2Logs(15102307, 15102307);
    expect(logs).toContainEqual({
      address: '0x74312363e45dcaba76c59ec49a7aa8a65a67eed3',
      data: '0x000000000000000000000000f6e16701911c6c2a15307e621c2a77cb82ed02a200000000000000000000000083c8f28c26bf6aaca652df1dbbe0e1b56f8baba200000000000000000000000000000000f168599e092d6be3002e2f1e9dd279ee0000000000000000000000000000000000000000000000000003ed6927834fba000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000062efb6c200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aa87bee538000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000029b4ea6b1164c7cd8a3a0a1dc4ad88d1e0589124000000000000000000000000000000000000000000000000000000000000009b000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aa87bee538000dbe042d3146eb31c831712800b5d19e35c1bf960329f09e0613b86b70341d718000000000000000000000000f849de01b080adc3a814fabe1e2087475cf2e35400000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000001388000000000000000000000000d823c605807cc5e6bd6fc0d7e4eea50d3e2d66cd',
      topic0:
        '0x3cbb63f144840e5b1b0a38a7c19211d2e89de4d7c5faf8b2d3c1776c302d1d33',
      topic1:
        '0xdbe042d3146eb31c831712800b5d19e35c1bf960329f09e0613b86b70341d718',
      topic2: null,
      transactionHash:
        '0x6f9f6f0db35da25e4692178d58594cd05d01d5805f4478620d1d29ee6f4bdcb7',
      transactionId: '0xe67163.0xce',
    });
  });
});
