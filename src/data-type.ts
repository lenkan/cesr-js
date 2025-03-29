export type DataValue = string | number | boolean | DataObject | DataArray;

export type DataArray = DataValue[];

/**
 * Defines a data object that can be serialized to JSON.
 * E.g. key events and acdc objects
 */
export interface DataObject {
  [x: string]: DataValue;
}
