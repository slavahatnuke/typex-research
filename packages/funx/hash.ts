// TODO @@@@slava tests
export function hashCodeNative(input: string): number {
  let hash = 0;
  let i;
  let charCode;

  for (i = 0; i < input.length; i++) {
    charCode = input.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash |= 0;
  }

  return hash;
}

export function hashCode(input: string): number {
  return Math.abs(hashCodeNative(input));
}

export function hashHex(value: string, bits = 64): string {
  const radix = 16; // hex
  const size = Math.ceil(bits / 8) * 2;

  let result = '';
  let idx = 0;
  let prevHash = '';

  while (result.length < size) {
    prevHash = hashCode(`${idx++}${prevHash}${value}`).toString(radix);
    result += prevHash;
  }

  return result.slice(0, size);
}

export function HashBalance(hash: (input: string) => number = hashCode) {
  return function balance(value: string, members: number): number {
    if (members <= 0) {
      return 0;
    } else {
      return hash(value) % members;
    }
  };
}

export function hexToNumber(hex: string): number {
  if (hex.length % 2 != 0) {
    hex = '0' + hex;
  }

  let num = parseInt(hex, 16);
  const maxVal = Math.pow(2, (hex.length / 2) * 8);

  if (num > maxVal / 2 - 1) {
    num = num - maxVal;
  }

  return num;
}

export function HashToNumber(
  Hash: (value: string) => Promise<string> = async (v) => hashHex(v, 32),
) {
  return async (value: string) => {
    const hex8bytes = (await Hash(value)).slice(0, 8);
    return hexToNumber(hex8bytes);
  };
}

export function RandomId(bits = 128): () => string {
  const radix = 16; // hex
  const size = Math.ceil(bits / 8) * 2;

  return () => {
    let result = '';

    while (result.length < size) {
      result += Math.random().toString(radix).slice(2);
    }

    return result.slice(0, size);
  };
}
