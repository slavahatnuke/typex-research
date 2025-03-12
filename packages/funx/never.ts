export function Never(_: never): never {
  try {
    const input = JSON.stringify(_);
    throw new Error(`Case never: ${input}`);
  } catch (error) {
    throw error;
  }
}

export const caseNever = Never;
