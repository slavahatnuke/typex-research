export const projectObject = (
  record: Record<string, any>,
  fields: string[],
): Record<string, any> =>
  fields.reduce(
    (outputData: Record<string, any>, field: string) => ({
      ...outputData,
      [field]: record[field],
    }),
    {} as Record<string, any>,
  );
