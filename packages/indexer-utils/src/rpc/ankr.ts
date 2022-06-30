const ankr = () => {
  const getChainParam = (chain: string | undefined) => {
    if (!chain) {
      throw Error('CHAIN not set');
    }
    switch (chain) {
      case 'ethereum': {
        return 'eth';
      }
      case 'bsc': {
        return 'bsc';
      }
      default: {
        throw Error('CHAIN unknown');
      }
    }
  };

  return {
    extractBlock: async (blockNumber: number) => {
      const endpoint = process.env.RPC_ENDPOINT;

      const startTimer = Date.now();
      const data = await axios.post(endpoint, {
        jsonrpc: '2.0',
        method: 'ankr_getBlocksRange',
        params: {
          blockchain: getChainParam(process.env.CHAIN),
          fromBlock: blockNumber,
          toBlock: blockNumber,
        },
        id: 1,
      });
      const time = Date.now() - startTimer;
      monitoring.observe(time, metrics.rpcCalls);

      return data.data.result.blocks[0];
    },
  };
};

export default ankr;
