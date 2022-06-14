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

const fakeMetric: Metric = {
  functionName: 'fake_metric',
};

describe('AWS worker', () => {
  it('Returns the correct metric name with suffix', async () => {
    expect(monitoring.getNameFromMetric(fakeMetric, 'test')).toStrictEqual(
      'test_indexer_fake_metric_test',
    );
  });

  it('Increments a counter by one', async () => {
    monitoring.incCounter(1, fakeMetric);

    expect(Counter).toHaveBeenLastCalledWith({
      name: 'test_indexer_fake_metric_counter',
      help: `Counter for the fake_metric function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });
  });

  it('Sets a gauge by a specific value', async () => {
    monitoring.gauge(1, fakeMetric);

    expect(Gauge).toHaveBeenLastCalledWith({
      name: 'test_indexer_fake_metric_gauge',
      help: `Gauge for fake_metric`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });
  });

  it('Observes a value in a histogram', async () => {
    monitoring.observe(1, fakeMetric);

    expect(Histogram).toHaveBeenLastCalledWith({
      name: 'test_indexer_fake_metric_timer',
      help: `Elapsed time for the fake_metric function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });
  });

  it('Pushes metrics to the Pushgateway', async () => {
    monitoring.pushMetrics();

    expect(Pushgateway).toHaveBeenLastCalledWith(
      process.env.PUSHGATEWAY_URL!,
      {},
      globalRegistry,
    );
  });
});
