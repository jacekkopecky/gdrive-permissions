export async function compressToLocalStorage(key, obj) {
  const hex = await gzipToHex(obj);
  localStorage.setItem(key, hex);
}

export async function decompressFromLocalStorage(key) {
  const hex = localStorage.getItem(key);
  if (hex && typeof hex === 'string') return gunzipFromHex(hex);
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////
// functions for JSON stringifying and compressing objects, and decompressing and JSON parsing them back
// adapted from https://gist.github.com/Explosion-Scratch/357c2eebd8254f8ea5548b0e6ac7a61b
// and from https://stackoverflow.com/questions/38987784/how-to-convert-a-hexadecimal-string-to-uint8array-and-back-in-javascript

// prettier-ignore
const MAP_HEX = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  a: 10, b: 11, c: 12, d: 13, e: 14, f: 15,
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15,
};

async function gzipToHex(obj) {
  const byteArray = new TextEncoder().encode(JSON.stringify(obj));
  const compressor = new CompressionStream('gzip');
  const writer = compressor.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  const uint8 = new Uint8Array(await new Response(compressor.readable).arrayBuffer());
  return Array.from(uint8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function gunzipFromHex(hex) {
  const cs = new DecompressionStream('gzip');
  const writer = cs.writable.getWriter();

  const len = Math.floor(hex.length / 2);
  const array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = (MAP_HEX[hex[i * 2]] << 4) + MAP_HEX[hex[i * 2 + 1]];
  }
  writer.write(array);
  writer.close();

  const arrayBuffer = await new Response(cs.readable).arrayBuffer();
  return JSON.parse(new TextDecoder().decode(arrayBuffer));
}
