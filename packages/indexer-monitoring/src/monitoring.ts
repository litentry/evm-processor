import { performance } from 'perf_hooks';
import {
  Counter,
  Histogram,
  Pushgateway,
  register as globalRegistry,
} from 'prom-client';

interface PrometheusTrackingData {
  functionId?: string;
  functionName: string;
  chain?: string;
  metricName: string;
  description: string;
}

const monitoring = () => {
  type MarkedTimestamp = {
    [mark: string]: number;
  };

  let marks: MarkedTimestamp = {};

  const getNameFromOpts = (opts: PrometheusTrackingData) => {
    return `${opts.functionName}_${opts.metricName}`.toLocaleLowerCase();
  };

  const getOrCreateHistogram = (
    opts: PrometheusTrackingData,
  ): Histogram<string> => {
    const name = getNameFromOpts(opts);

    const metric = globalRegistry.getSingleMetric(getNameFromOpts(opts));
    if (metric) {
      return metric as Histogram<string>;
    }

    return new Histogram({
      name,
      help: opts.description,
      labelNames: ['functionId'],
      registers: [globalRegistry],
    });
  };

  const getOrCreateCounter = (
    opts: PrometheusTrackingData,
  ): Counter<string> => {
    const name = getNameFromOpts(opts);

    const metric = globalRegistry.getSingleMetric(name);
    if (metric) {
      return metric as Counter<string>;
    }

    return new Counter({
      name,
      help: opts.description || '',
      labelNames: ['functionId'],
      registers: [globalRegistry],
    });
  };

  return {
    mark: (markName: string) => {
      marks[markName] = performance.now();
    },

    measure: (
      startMark: string,
      endMark: string,
      data: PrometheusTrackingData,
    ) => {
      const histogram = getOrCreateHistogram(data);
      const timer = Math.abs((marks[endMark] ?? 0) - (marks[startMark] ?? 0));
      console.log(timer);

      histogram.observe(timer / 1000); // observe takes time in seconds
    },

    pushMetrics: async () => {
      const gateway = new Pushgateway(
        process.env.PUSHGATEWAY_URL!,
        {},
        globalRegistry,
      );

      return gateway.pushAdd({ jobName: 'pushgateway' });
    },
  };
};

export default monitoring();
