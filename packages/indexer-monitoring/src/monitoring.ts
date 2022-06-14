import { performance } from 'perf_hooks';
import {
  Counter,
  Gauge,
  Histogram,
  Pushgateway,
  register as globalRegistry,
} from 'prom-client';
import { Metric } from './metrics';

const monitoring = () => {
  type MarkedTimestamp = {
    [mark: string]: number;
  };

  let marks: MarkedTimestamp = {};

  const getNameFromMetric = (metric: Metric, suffix: string) => {
    return (
      (process.env.SERVICE_NAME ? process.env.SERVICE_NAME + '_' : '') +
      metric.functionName +
      (suffix ? '_' + suffix : '')
    ).toLocaleLowerCase();
  };

  const getOrCreateHistogram = (metric: Metric): Histogram<string> => {
    const name = getNameFromMetric(metric, 'timer');

    const promMetric = globalRegistry.getSingleMetric(name);
    if (promMetric) {
      return promMetric as Histogram<string>;
    }

    return new Histogram({
      name,
      help: `Elapsed time for the ${metric.functionName} function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });
  };

  const getOrCreateCounter = (metric: Metric): Counter<string> => {
    const name = getNameFromMetric(metric, 'counter');

    const promMetric = globalRegistry.getSingleMetric(name);
    if (promMetric) {
      return promMetric as Counter<string>;
    }

    return new Counter({
      name,
      help: `Counter for the ${metric.functionName} function`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });
  };

  const getOrCreateGauge = (metric: Metric): Gauge<string> => {
    const name = getNameFromMetric(metric, 'gauge');

    const promMetric = globalRegistry.getSingleMetric(name);
    if (promMetric) {
      return promMetric as Gauge<string>;
    }

    return new Gauge({
      name,
      help: `Gauge for ${metric.functionName}`,
      labelNames: ['chain', 'version'],
      registers: [globalRegistry],
    });
  };

  const observe = (timerMs: number, metric: Metric) => {
    const histogram = getOrCreateHistogram(metric);

    histogram.observe(
      { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
      timerMs / 1000,
    ); // observe takes time in seconds
  };

  return {
    markStart: (metric: Metric) => {
      marks[`start-${metric.functionName}`] = performance.now();
    },

    markEnd: (metric: Metric) => {
      marks[`end-${metric.functionName}`] = performance.now();
    },

    measure: (metric: Metric, startMetric?: Metric, endMetric?: Metric) => {
      const startMark = startMetric || metric;
      const endMark = endMetric || metric;
      const timer = Math.abs(
        (marks[`end-${endMark.functionName}`] ?? 0) -
          (marks[`start-${startMark.functionName}`] ?? 0),
      );

      observe(timer, metric);
    },

    observe,

    gauge: (value: number, metric: Metric) => {
      const gauge = getOrCreateGauge(metric);

      gauge.set(
        { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
        value,
      );
    },

    incCounter: (value: number, metric: Metric) => {
      const counter = getOrCreateCounter(metric);

      console.log('do stuff');
      counter.inc(
        { chain: process.env.CHAIN, version: process.env.DEPLOY_VERSION },
        value,
      );
    },

    pushMetrics: async () => {
      const gateway = new Pushgateway(
        process.env.PUSHGATEWAY_URL!,
        {},
        globalRegistry,
      );

      return gateway.pushAdd({
        jobName: 'pushgateway',
        groupings: {
          chain: process.env.CHAIN!,
          version: process.env.DEPLOY_VERSION!,
        },
      });
    },

    getNameFromMetric,
  };
};

export default monitoring();
