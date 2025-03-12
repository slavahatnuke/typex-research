export const castAsNumerical = (value: any): number | null => {
  try {
    const result = Number(value);
    if (Number.isNaN(result)) {
      return null;
    }

    return result;
  } catch (error) {
    return null;
  }
};

export const castAsBoolean = (value: any): boolean | null => {
  const stringValue = String(value).toLowerCase();
  if (stringValue === 'true') {
    return true;
  }

  if (stringValue === 'false') {
    return false;
  }

  return null;
};

export const castAsTimestamp = (value: any): Date | null => {
  try {
    return new Date(value);
  } catch (error) {
    return null;
  }
};

export const safeJsonParse = (value: string): any | null => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};
