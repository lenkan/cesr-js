import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { CountCode_10, IndexCode } from "./codes.ts";
import { encodeBase64Int } from "./base64.ts";
import { parseSync } from "./parser.ts";

describe("Parse count code", () => {
  test("Should parse attachments without payload", async () => {
    const sigs = [
      "2AABAFC2S_PGpOQpbMNwQVOqP5jCUJ7EgFH2hr21V6uCbBAkK30idHj0K-ReRCe_o5iIP2bGhBK2MPeEt1P81ZLwk2YJ",
      "2AACAGDeP0o3Ns2ycFFonXIQwGClJimMZ6DHnGfUKJ3O9DzUV5AxVi3Q0oq03fpLyVWRXYCWa72i_o6ftwCVVNnYDN4L",
      "AAAwpoZNY1cZl_0pxlWiHm2RPD1q2XFiFBAzUGOQWeLlBTWbfFtImbZo3cxVKCP2D5Rl49zlaLRekrONYvme2oAC",
    ];

    const attachment = [CountCode_10.ControllerIdxSigs, encodeBase64Int(sigs.length, 2), ...sigs].join("");

    const result = Array.from(parseSync(attachment));

    assert.equal(result.length, 4);
    assert.partialDeepStrictEqual(result[0], { code: CountCode_10.ControllerIdxSigs });
    assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Big_Sig });
    assert.partialDeepStrictEqual(result[2], { code: IndexCode.Ed25519_Big_Sig });
    assert.partialDeepStrictEqual(result[3], { code: IndexCode.Ed25519_Sig });
  });
});
