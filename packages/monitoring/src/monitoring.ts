import { Counter, Histogram, LabelValues, Pushgateway, register as globalRegistry } from 'prom-client';

export interface PrometheusTrackingData {
  message: string,
  level: string
  functionId: string,
  functionName: string,
  chain: string,
  metricName: string,
  description: string,
}

export function incCounter(data: PrometheusTrackingData) {
  const metric = getOrCreateCounter(data);

  metric.inc({
    functionId: data.functionId,
    level: data.level
  });
}

export function startTimer(data: PrometheusTrackingData): (labels?: LabelValues<any>) => number {
  const metric = getOrCreateHistogram(data);

  return metric.startTimer({
    functionId: data.functionId,
    level: data.level
  });
}

export async function pushMetrics() {
  const gateway = new Pushgateway('http://host.docker.internal:9091', {}, globalRegistry);

  console.log('Push Metrics');
  return gateway.pushAdd({ jobName: "pushgateway" });
}

const getOrCreateHistogram = (opts: PrometheusTrackingData): Histogram<string> => {
  const name = `${opts.chain}_${opts.functionName}_${opts.metricName}`.toLocaleLowerCase();

  const metric = globalRegistry.getSingleMetric(name);
  if (metric) {
    return metric as Histogram<string>;
  }

  return new Histogram({
    name,
    help: opts.description,
    labelNames: ['functionId', 'level'],
    registers: [globalRegistry],
  });
}

const getOrCreateCounter = (opts: PrometheusTrackingData): Counter<string> => {
  const name = `${opts.chain}_${opts.functionName}_${opts.metricName}`.toLocaleLowerCase();

  const metric = globalRegistry.getSingleMetric(name);
  if (metric) {
    return metric as Counter<string>;
  }

  return new Counter({
    name,
    help: opts.description || "",
    labelNames: ['functionId', 'level'],
    registers: [globalRegistry],
  });
}