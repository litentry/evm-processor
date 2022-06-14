import { performance } from 'perf_hooks';
import {
  Counter,
  Gauge,
  Histogram,
  Pushgateway,
  register as globalRegistry,
} from 'prom-client';
import { Metric } from './metrics';
import monitoring from './monitoring';

jest.mock('prom-client');
jest.mock('perf_hooks');

const firstFakeMetric: Metric = {
  functionName: 'fake_metric',
};

const secondFakeMetric: Metric = {
  functionName: 'fake_metric2',
};

describe('Monitoring', () => {
  it('Returns the correct metric name with suffix', async () => {
    expect(monitoring.getNameFromMetric(firstFakeMetric, 'test')).toStrictEqual(
      'test_indexer_fake_metric_test',
    );
  });

  it('Increments a counter by one', async () => {
    const spy = jest.spyOn(Counter.prototype, 'inc');

    monitoring.incCounter(1, firstFakeMetric);

    expect(Counter).toHaveBeenLastCalledWith({
      name: 'test_indexer_fake_metric_counter',
      help: `Counter for the fake_metric function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });

    expect(spy).lastCalledWith(
      { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
      1,
    );
  });

  it('Sets a gauge by a specific value', async () => {
    const spy = jest.spyOn(Gauge.prototype, 'set');

    monitoring.gauge(1, firstFakeMetric);

    expect(Gauge).toHaveBeenLastCalledWith({
      name: 'test_indexer_fake_metric_gauge',
      help: `Gauge for fake_metric`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });

    expect(spy).lastCalledWith(
      { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
      1,
    );
  });

  it('Observes a value in a histogram', async () => {
    const spy = jest.spyOn(Histogram.prototype, 'observe');

    monitoring.observe(1, firstFakeMetric);

    expect(Histogram).toHaveBeenLastCalledWith({
      name: 'test_indexer_fake_metric_timer',
      help: `Elapsed time for the fake_metric function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });

    expect(spy).lastCalledWith(
      { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
      1 / 1000,
    );
  });

  it('Pushes metrics to the Pushgateway', async () => {
    const spy = jest.spyOn(Pushgateway.prototype, 'pushAdd');

    monitoring.pushMetrics();

    expect(Pushgateway).toHaveBeenLastCalledWith(
      process.env.PUSHGATEWAY_URL!,
      {},
      globalRegistry,
    );

    expect(spy).lastCalledWith({
      jobName: 'pushgateway',
      groupings: {
        chain: process.env.CHAIN!,
        version: process.env.DEPLOY_VERSION!,
      },
    });
  });

  it('Observe a full flow of measurements', async () => {
    const spy = jest.spyOn(Histogram.prototype, 'observe');

    const performanceMock = performance.now as jest.Mock;
    performanceMock.mockReturnValue(0);
    monitoring.markStart(firstFakeMetric);
    monitoring.markStart(secondFakeMetric);

    performanceMock.mockReturnValue(1000);
    monitoring.markEnd(firstFakeMetric);

    performanceMock.mockReturnValue(2000);
    monitoring.markEnd(secondFakeMetric);

    monitoring.measure(firstFakeMetric);
    monitoring.measure(secondFakeMetric);
    monitoring.measure(secondFakeMetric, secondFakeMetric, firstFakeMetric);

    expect(Histogram).toBeCalledTimes(3);
    expect(Histogram).toHaveBeenNthCalledWith(1, {
      name: 'test_indexer_fake_metric_timer',
      help: `Elapsed time for the fake_metric function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });
    expect(Histogram).toHaveBeenNthCalledWith(2, {
      name: 'test_indexer_fake_metric2_timer',
      help: `Elapsed time for the fake_metric2 function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });
    expect(Histogram).toHaveBeenNthCalledWith(3, {
      name: 'test_indexer_fake_metric2_timer',
      help: `Elapsed time for the fake_metric2 function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });

    expect(spy).toBeCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(
      1,
      { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
      1,
    );
    expect(spy).toHaveBeenNthCalledWith(
      2,
      { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
      2,
    );
    expect(spy).toHaveBeenNthCalledWith(
      3,
      { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
      1,
    );
  });
});
