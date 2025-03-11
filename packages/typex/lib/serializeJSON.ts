export const serializeJSON = (value: any): string => JSON.stringify(value);
export const deserializeJSON = (value: string): any => JSON.parse(value);