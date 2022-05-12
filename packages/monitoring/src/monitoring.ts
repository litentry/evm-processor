import { Counter, Histogram, LabelValues, Pushgateway, register as globalRegistry } from 'prom-client';

export interface PrometheusTrackingData {
  functionId?: string,
  functionName: string,
  chain?: string,
  metricName: string,
  description: string,
}

export function incCounter(data: PrometheusTrackingData) {
  const metric = getOrCreateCounter(data);

  metric.inc({
    functionId: data.functionId ?? "",
  });
}

export function startTimer(data: PrometheusTrackingData): (labels?: LabelValues<any>) => number {
  const metric = getOrCreateHistogram(data);

  return metric.startTimer({
    functionId: data.functionId ?? "",
  });
}

export async function pushMetrics() {
  const gateway = new Pushgateway('http://host.docker.internal:9091', {}, globalRegistry);

  return gateway.pushAdd({ jobName: "pushgateway" });
}

const getOrCreateHistogram = (opts: PrometheusTrackingData): Histogram<string> => {
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
}

const getOrCreateCounter = (opts: PrometheusTrackingData): Counter<string> => {
  const name = getNameFromOpts(opts);

  const metric = globalRegistry.getSingleMetric(name);
  if (metric) {
    return metric as Counter<string>;
  }

  return new Counter({
    name,
    help: opts.description || "",
    labelNames: ['functionId'],
    registers: [globalRegistry],
  });
}

function getNameFromOpts(opts: PrometheusTrackingData) {
  return `${opts.functionName}_${opts.metricName}`.toLocaleLowerCase();
}
