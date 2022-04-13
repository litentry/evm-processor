import { RowInterface } from "parquetjs/lib/row.interface";
import { ParquetTypes } from './types';
import parquetjs from "parquetjs";

export function convert(row: RowInterface, schema: parquetjs.ParquetSchema) {
  const converters: { [k: string]: (value: any) => any } = {
    [ParquetTypes.INT64]: (value: number | BigInt) => value.toString()
  }

  return Object.entries(row).reduce((newRow, [key, value]) => {
    let newValue = value;
    const field = schema.fields[key];
    if (field) {
      const converter = converters[field.primitiveType || ""];
      if (converter) {
        newValue = converter(value);
      }
    }
    return {
      ...newRow,
      [key]: newValue
    }
  }, row);
}