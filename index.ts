const { ArrayBuffer, Uint8Array, TypeError } = globalThis;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const throwTypeError = (): never => {
  throw new TypeError('Nullish is not allowed');
};
const banNullish = <T>(v: T | null | undefined): T => v ?? throwTypeError();
function getGetter<O extends ObjectConstructor["prototype"] | null, PROP extends keyof O>(object: O, prop: PROP): undefined | ((this: O) => O[PROP]) {
  while (object) {
    const d = Reflect.getOwnPropertyDescriptor(object, prop);
    if (d) return d.get;
    object = Reflect.getPrototypeOf(object) as O;
  }
  return undefined;
}
const uncurryThis: <F extends (this: ThisParameterType<F>, ...args: Parameters<F>) => ReturnType<F>>(f: F) => (thisArg: ThisParameterType<F>, ...args: Parameters<F>) => ReturnType<F> = Function.prototype.bind.bind(Function.prototype.call);
const getLen = uncurryThis(banNullish(getGetter(Uint8Array.prototype, 'length')));
const byteLength = uncurryThis(banNullish(getGetter(ArrayBuffer.prototype, 'byteLength')));
const isValid = RegExp.prototype.exec.bind(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
const lookup: Record<string, number> = { __proto__: null as unknown as number };
for (let i = 0; i < chars.length; i++) lookup[banNullish(chars[i])] = i;

export function arrayBufferToBase64(arraybuffer: ArrayBufferLike): string {
  byteLength(arraybuffer);
  const bytes = new Uint8Array(arraybuffer), len = getLen(bytes), max = (~~(len / 3)) * 3;
  let i = 0, base64 = '';
  for (; i < max; i += 3) {
    const b0 = banNullish(bytes[i]), b1 = banNullish(bytes[i + 1]), b2 = banNullish(bytes[i + 2]);
    base64 += banNullish(chars[b0 >> 2]) + banNullish(chars[((b0 & 3) << 4) | (b1 >> 4)]) + banNullish(chars[((b1 & 15) << 2) | (b2 >> 6)]) + banNullish(chars[b2 & 63]);
  }
  switch (len % 3) {
    case 1: {
      const b0 = banNullish(bytes[i]);
      return `${base64 + banNullish(chars[b0 >> 2]) + banNullish(chars[(b0 & 3) << 4])}==`;
    }
    case 2: {
      const b0 = banNullish(bytes[i]), b1 = banNullish(bytes[i + 1]);
      return `${base64 + banNullish(chars[b0 >> 2]) + banNullish(chars[((b0 & 3) << 4) | (b1 >> 4)]) + banNullish(chars[(b1 & 15) << 2])}=`;
    }
  }
  return base64;
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (!isValid(base64)) throw new TypeError('Invalid base64 format');
  let bufferLength = base64.length * 0.75;
  if (base64.endsWith('=')) {
    bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;
  }
  const len = base64.length, arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (let i = 0, p = 0, encoded2, encoded3; i < len; i += 4) {
    encoded2 = banNullish(lookup[banNullish(base64[i + 1])]);
    encoded3 = banNullish(lookup[banNullish(base64[i + 2])]);
    bytes[p++] = (banNullish(lookup[banNullish(base64[i])]) << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (banNullish(lookup[banNullish(base64[i + 3])]) & 63);
  }
  return arraybuffer;
}
