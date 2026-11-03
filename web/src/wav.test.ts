import { expect, test } from "vitest";
import { encodeWav } from "./wav";

test("WAV header is 16 kHz mono PCM16 with correct sizes", () => {
  const b = encodeWav(new Float32Array([0, 1, -1, 2]));
  const v = new DataView(b), tag = (o: number) => String.fromCharCode(...[0, 1, 2, 3].map((i) => v.getUint8(o + i)));
  expect([tag(0), tag(8), tag(12), tag(36)]).toEqual(["RIFF", "WAVE", "fmt ", "data"]);
  expect(b.byteLength).toBe(44 + 8);
  expect(v.getUint32(4, true)).toBe(b.byteLength - 8);
  expect([v.getUint16(20, true), v.getUint16(22, true), v.getUint32(24, true), v.getUint16(34, true)]).toEqual([1, 1, 16000, 16]);
  expect([v.getInt16(46, true), v.getInt16(48, true), v.getInt16(50, true)]).toEqual([32767, -32767, 32767]);
});
