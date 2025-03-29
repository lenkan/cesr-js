import { test } from "node:test";
import assert from "node:assert";
import cesr from "./cesr-encoding.ts";

test(`Decode 0AA-8fuimeFwrr5hRIKHeqvH`, () => {
  const { code, buffer: raw } = cesr.decode("0AA-8fuimeFwrr5hRIKHeqvH");

  assert.strictEqual(code, "0A");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([62, 241, 251, 162, 153, 225, 112, 174, 190, 97, 68, 130, 135, 122, 171, 199])
  );
});

test(`Encode 0AA-8fuimeFwrr5hRIKHeqvH`, () => {
  const raw = new Uint8Array([62, 241, 251, 162, 153, 225, 112, 174, 190, 97, 68, 130, 135, 122, 171, 199]);
  assert.strictEqual(cesr.encode("0A", raw), "0AA-8fuimeFwrr5hRIKHeqvH");
});
test(`Decode 0AA-9oRoOdF-64KmcB7mFu9q`, () => {
  const { code, buffer: raw } = cesr.decode("0AA-9oRoOdF-64KmcB7mFu9q");

  assert.strictEqual(code, "0A");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([62, 246, 132, 104, 57, 209, 126, 235, 130, 166, 112, 30, 230, 22, 239, 106])
  );
});

test(`Encode 0AA-9oRoOdF-64KmcB7mFu9q`, () => {
  const raw = new Uint8Array([62, 246, 132, 104, 57, 209, 126, 235, 130, 166, 112, 30, 230, 22, 239, 106]);
  assert.strictEqual(cesr.encode("0A", raw), "0AA-9oRoOdF-64KmcB7mFu9q");
});
test(`Decode 0BA-meOtrZqh25qrCF30C_TuNDz5Et2F3t2rLbJ98TqXCelY8I4ZpkZQy7iD93SRxZTATQTFQF99U0XNA_JPgq0N`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0BA-meOtrZqh25qrCF30C_TuNDz5Et2F3t2rLbJ98TqXCelY8I4ZpkZQy7iD93SRxZTATQTFQF99U0XNA_JPgq0N"
  );

  assert.strictEqual(code, "0B");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      62, 153, 227, 173, 173, 154, 161, 219, 154, 171, 8, 93, 244, 11, 244, 238, 52, 60, 249, 18, 221, 133, 222, 221,
      171, 45, 178, 125, 241, 58, 151, 9, 233, 88, 240, 142, 25, 166, 70, 80, 203, 184, 131, 247, 116, 145, 197, 148,
      192, 77, 4, 197, 64, 95, 125, 83, 69, 205, 3, 242, 79, 130, 173, 13,
    ])
  );
});

test(`Encode 0BA-meOtrZqh25qrCF30C_TuNDz5Et2F3t2rLbJ98TqXCelY8I4ZpkZQy7iD93SRxZTATQTFQF99U0XNA_JPgq0N`, () => {
  const raw = new Uint8Array([
    62, 153, 227, 173, 173, 154, 161, 219, 154, 171, 8, 93, 244, 11, 244, 238, 52, 60, 249, 18, 221, 133, 222, 221, 171,
    45, 178, 125, 241, 58, 151, 9, 233, 88, 240, 142, 25, 166, 70, 80, 203, 184, 131, 247, 116, 145, 197, 148, 192, 77,
    4, 197, 64, 95, 125, 83, 69, 205, 3, 242, 79, 130, 173, 13,
  ]);
  assert.strictEqual(
    cesr.encode("0B", raw),
    "0BA-meOtrZqh25qrCF30C_TuNDz5Et2F3t2rLbJ98TqXCelY8I4ZpkZQy7iD93SRxZTATQTFQF99U0XNA_JPgq0N"
  );
});
test(`Decode 0BA0YOvEHllXmhlmv7ec_MShdDf2eZ3OvMDKE_zhfQsrFvU2ip1g-z04HZ097hN66rLo5nqglvdCkxXJcYBqe8kD`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0BA0YOvEHllXmhlmv7ec_MShdDf2eZ3OvMDKE_zhfQsrFvU2ip1g-z04HZ097hN66rLo5nqglvdCkxXJcYBqe8kD"
  );

  assert.strictEqual(code, "0B");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      52, 96, 235, 196, 30, 89, 87, 154, 25, 102, 191, 183, 156, 252, 196, 161, 116, 55, 246, 121, 157, 206, 188, 192,
      202, 19, 252, 225, 125, 11, 43, 22, 245, 54, 138, 157, 96, 251, 61, 56, 29, 157, 61, 238, 19, 122, 234, 178, 232,
      230, 122, 160, 150, 247, 66, 147, 21, 201, 113, 128, 106, 123, 201, 3,
    ])
  );
});

test(`Encode 0BA0YOvEHllXmhlmv7ec_MShdDf2eZ3OvMDKE_zhfQsrFvU2ip1g-z04HZ097hN66rLo5nqglvdCkxXJcYBqe8kD`, () => {
  const raw = new Uint8Array([
    52, 96, 235, 196, 30, 89, 87, 154, 25, 102, 191, 183, 156, 252, 196, 161, 116, 55, 246, 121, 157, 206, 188, 192,
    202, 19, 252, 225, 125, 11, 43, 22, 245, 54, 138, 157, 96, 251, 61, 56, 29, 157, 61, 238, 19, 122, 234, 178, 232,
    230, 122, 160, 150, 247, 66, 147, 21, 201, 113, 128, 106, 123, 201, 3,
  ]);
  assert.strictEqual(
    cesr.encode("0B", raw),
    "0BA0YOvEHllXmhlmv7ec_MShdDf2eZ3OvMDKE_zhfQsrFvU2ip1g-z04HZ097hN66rLo5nqglvdCkxXJcYBqe8kD"
  );
});
test(`Decode 0CA05UoMVqbDSTBa9JdUBHvZ1Wm_fW9wcVtIxa27Dux8n5JL__Hn1QK5DYUpW7xdpkUH9a167YhOuyuJRbgsJKF8`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0CA05UoMVqbDSTBa9JdUBHvZ1Wm_fW9wcVtIxa27Dux8n5JL__Hn1QK5DYUpW7xdpkUH9a167YhOuyuJRbgsJKF8"
  );

  assert.strictEqual(code, "0C");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      52, 229, 74, 12, 86, 166, 195, 73, 48, 90, 244, 151, 84, 4, 123, 217, 213, 105, 191, 125, 111, 112, 113, 91, 72,
      197, 173, 187, 14, 236, 124, 159, 146, 75, 255, 241, 231, 213, 2, 185, 13, 133, 41, 91, 188, 93, 166, 69, 7, 245,
      173, 122, 237, 136, 78, 187, 43, 137, 69, 184, 44, 36, 161, 124,
    ])
  );
});

test(`Encode 0CA05UoMVqbDSTBa9JdUBHvZ1Wm_fW9wcVtIxa27Dux8n5JL__Hn1QK5DYUpW7xdpkUH9a167YhOuyuJRbgsJKF8`, () => {
  const raw = new Uint8Array([
    52, 229, 74, 12, 86, 166, 195, 73, 48, 90, 244, 151, 84, 4, 123, 217, 213, 105, 191, 125, 111, 112, 113, 91, 72,
    197, 173, 187, 14, 236, 124, 159, 146, 75, 255, 241, 231, 213, 2, 185, 13, 133, 41, 91, 188, 93, 166, 69, 7, 245,
    173, 122, 237, 136, 78, 187, 43, 137, 69, 184, 44, 36, 161, 124,
  ]);
  assert.strictEqual(
    cesr.encode("0C", raw),
    "0CA05UoMVqbDSTBa9JdUBHvZ1Wm_fW9wcVtIxa27Dux8n5JL__Hn1QK5DYUpW7xdpkUH9a167YhOuyuJRbgsJKF8"
  );
});
test(`Decode 0CA4BTKmJ1TX4VQskUOnF2UnaJHvHFvH4B5JG9XjRKj0yW_qHOdNZkZ2jcZ4E0ooB1gnzqd94Sz1PpB1P5IriHi6`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0CA4BTKmJ1TX4VQskUOnF2UnaJHvHFvH4B5JG9XjRKj0yW_qHOdNZkZ2jcZ4E0ooB1gnzqd94Sz1PpB1P5IriHi6"
  );

  assert.strictEqual(code, "0C");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      56, 5, 50, 166, 39, 84, 215, 225, 84, 44, 145, 67, 167, 23, 101, 39, 104, 145, 239, 28, 91, 199, 224, 30, 73, 27,
      213, 227, 68, 168, 244, 201, 111, 234, 28, 231, 77, 102, 70, 118, 141, 198, 120, 19, 74, 40, 7, 88, 39, 206, 167,
      125, 225, 44, 245, 62, 144, 117, 63, 146, 43, 136, 120, 186,
    ])
  );
});

test(`Encode 0CA4BTKmJ1TX4VQskUOnF2UnaJHvHFvH4B5JG9XjRKj0yW_qHOdNZkZ2jcZ4E0ooB1gnzqd94Sz1PpB1P5IriHi6`, () => {
  const raw = new Uint8Array([
    56, 5, 50, 166, 39, 84, 215, 225, 84, 44, 145, 67, 167, 23, 101, 39, 104, 145, 239, 28, 91, 199, 224, 30, 73, 27,
    213, 227, 68, 168, 244, 201, 111, 234, 28, 231, 77, 102, 70, 118, 141, 198, 120, 19, 74, 40, 7, 88, 39, 206, 167,
    125, 225, 44, 245, 62, 144, 117, 63, 146, 43, 136, 120, 186,
  ]);
  assert.strictEqual(
    cesr.encode("0C", raw),
    "0CA4BTKmJ1TX4VQskUOnF2UnaJHvHFvH4B5JG9XjRKj0yW_qHOdNZkZ2jcZ4E0ooB1gnzqd94Sz1PpB1P5IriHi6"
  );
});
test(`Decode 0DB0Fp_mZA2QmS7VIysDR87HUHY_Dhrxmt463x9SnaoCMNKpN-ObJRxfY3C3bzBZsPUTzTgAIaTLz6qea2spJTTm`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0DB0Fp_mZA2QmS7VIysDR87HUHY_Dhrxmt463x9SnaoCMNKpN-ObJRxfY3C3bzBZsPUTzTgAIaTLz6qea2spJTTm"
  );

  assert.strictEqual(code, "0D");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      116, 22, 159, 230, 100, 13, 144, 153, 46, 213, 35, 43, 3, 71, 206, 199, 80, 118, 63, 14, 26, 241, 154, 222, 58,
      223, 31, 82, 157, 170, 2, 48, 210, 169, 55, 227, 155, 37, 28, 95, 99, 112, 183, 111, 48, 89, 176, 245, 19, 205,
      56, 0, 33, 164, 203, 207, 170, 158, 107, 107, 41, 37, 52, 230,
    ])
  );
});

test(`Encode 0DB0Fp_mZA2QmS7VIysDR87HUHY_Dhrxmt463x9SnaoCMNKpN-ObJRxfY3C3bzBZsPUTzTgAIaTLz6qea2spJTTm`, () => {
  const raw = new Uint8Array([
    116, 22, 159, 230, 100, 13, 144, 153, 46, 213, 35, 43, 3, 71, 206, 199, 80, 118, 63, 14, 26, 241, 154, 222, 58, 223,
    31, 82, 157, 170, 2, 48, 210, 169, 55, 227, 155, 37, 28, 95, 99, 112, 183, 111, 48, 89, 176, 245, 19, 205, 56, 0,
    33, 164, 203, 207, 170, 158, 107, 107, 41, 37, 52, 230,
  ]);
  assert.strictEqual(
    cesr.encode("0D", raw),
    "0DB0Fp_mZA2QmS7VIysDR87HUHY_Dhrxmt463x9SnaoCMNKpN-ObJRxfY3C3bzBZsPUTzTgAIaTLz6qea2spJTTm"
  );
});
test(`Decode 0DB0Fp_mZA2QmS7VIysDR87HUHY_Dhrxmt463x9SnaoCMNKpN-ObJRxfY3C3bzBZsPUTzTgAIaTLz6qea2spJTTm`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0DB0Fp_mZA2QmS7VIysDR87HUHY_Dhrxmt463x9SnaoCMNKpN-ObJRxfY3C3bzBZsPUTzTgAIaTLz6qea2spJTTm"
  );

  assert.strictEqual(code, "0D");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      116, 22, 159, 230, 100, 13, 144, 153, 46, 213, 35, 43, 3, 71, 206, 199, 80, 118, 63, 14, 26, 241, 154, 222, 58,
      223, 31, 82, 157, 170, 2, 48, 210, 169, 55, 227, 155, 37, 28, 95, 99, 112, 183, 111, 48, 89, 176, 245, 19, 205,
      56, 0, 33, 164, 203, 207, 170, 158, 107, 107, 41, 37, 52, 230,
    ])
  );
});

test(`Encode 0DB0Fp_mZA2QmS7VIysDR87HUHY_Dhrxmt463x9SnaoCMNKpN-ObJRxfY3C3bzBZsPUTzTgAIaTLz6qea2spJTTm`, () => {
  const raw = new Uint8Array([
    116, 22, 159, 230, 100, 13, 144, 153, 46, 213, 35, 43, 3, 71, 206, 199, 80, 118, 63, 14, 26, 241, 154, 222, 58, 223,
    31, 82, 157, 170, 2, 48, 210, 169, 55, 227, 155, 37, 28, 95, 99, 112, 183, 111, 48, 89, 176, 245, 19, 205, 56, 0,
    33, 164, 203, 207, 170, 158, 107, 107, 41, 37, 52, 230,
  ]);
  assert.strictEqual(
    cesr.encode("0D", raw),
    "0DB0Fp_mZA2QmS7VIysDR87HUHY_Dhrxmt463x9SnaoCMNKpN-ObJRxfY3C3bzBZsPUTzTgAIaTLz6qea2spJTTm"
  );
});
test(`Decode 0EDWHpoDWLjzJfWc08RVvFTCjzZ7oPBgi7ml_q3LrHJu4qnMtjD4dCsHF-XTauGl8FyLfX09e3gEv_WAGqxzpDqD`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0EDWHpoDWLjzJfWc08RVvFTCjzZ7oPBgi7ml_q3LrHJu4qnMtjD4dCsHF-XTauGl8FyLfX09e3gEv_WAGqxzpDqD"
  );

  assert.strictEqual(code, "0E");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      214, 30, 154, 3, 88, 184, 243, 37, 245, 156, 211, 196, 85, 188, 84, 194, 143, 54, 123, 160, 240, 96, 139, 185,
      165, 254, 173, 203, 172, 114, 110, 226, 169, 204, 182, 48, 248, 116, 43, 7, 23, 229, 211, 106, 225, 165, 240, 92,
      139, 125, 125, 61, 123, 120, 4, 191, 245, 128, 26, 172, 115, 164, 58, 131,
    ])
  );
});

test(`Encode 0EDWHpoDWLjzJfWc08RVvFTCjzZ7oPBgi7ml_q3LrHJu4qnMtjD4dCsHF-XTauGl8FyLfX09e3gEv_WAGqxzpDqD`, () => {
  const raw = new Uint8Array([
    214, 30, 154, 3, 88, 184, 243, 37, 245, 156, 211, 196, 85, 188, 84, 194, 143, 54, 123, 160, 240, 96, 139, 185, 165,
    254, 173, 203, 172, 114, 110, 226, 169, 204, 182, 48, 248, 116, 43, 7, 23, 229, 211, 106, 225, 165, 240, 92, 139,
    125, 125, 61, 123, 120, 4, 191, 245, 128, 26, 172, 115, 164, 58, 131,
  ]);
  assert.strictEqual(
    cesr.encode("0E", raw),
    "0EDWHpoDWLjzJfWc08RVvFTCjzZ7oPBgi7ml_q3LrHJu4qnMtjD4dCsHF-XTauGl8FyLfX09e3gEv_WAGqxzpDqD"
  );
});
test(`Decode 0EDWHpoDWLjzJfWc08RVvFTCjzZ7oPBgi7ml_q3LrHJu4qnMtjD4dCsHF-XTauGl8FyLfX09e3gEv_WAGqxzpDqD`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0EDWHpoDWLjzJfWc08RVvFTCjzZ7oPBgi7ml_q3LrHJu4qnMtjD4dCsHF-XTauGl8FyLfX09e3gEv_WAGqxzpDqD"
  );

  assert.strictEqual(code, "0E");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      214, 30, 154, 3, 88, 184, 243, 37, 245, 156, 211, 196, 85, 188, 84, 194, 143, 54, 123, 160, 240, 96, 139, 185,
      165, 254, 173, 203, 172, 114, 110, 226, 169, 204, 182, 48, 248, 116, 43, 7, 23, 229, 211, 106, 225, 165, 240, 92,
      139, 125, 125, 61, 123, 120, 4, 191, 245, 128, 26, 172, 115, 164, 58, 131,
    ])
  );
});

test(`Encode 0EDWHpoDWLjzJfWc08RVvFTCjzZ7oPBgi7ml_q3LrHJu4qnMtjD4dCsHF-XTauGl8FyLfX09e3gEv_WAGqxzpDqD`, () => {
  const raw = new Uint8Array([
    214, 30, 154, 3, 88, 184, 243, 37, 245, 156, 211, 196, 85, 188, 84, 194, 143, 54, 123, 160, 240, 96, 139, 185, 165,
    254, 173, 203, 172, 114, 110, 226, 169, 204, 182, 48, 248, 116, 43, 7, 23, 229, 211, 106, 225, 165, 240, 92, 139,
    125, 125, 61, 123, 120, 4, 191, 245, 128, 26, 172, 115, 164, 58, 131,
  ]);
  assert.strictEqual(
    cesr.encode("0E", raw),
    "0EDWHpoDWLjzJfWc08RVvFTCjzZ7oPBgi7ml_q3LrHJu4qnMtjD4dCsHF-XTauGl8FyLfX09e3gEv_WAGqxzpDqD"
  );
});
test(`Decode 0FABhaP0YVHGH5iumlxHmWlUzWub6x7PUroMNMoZ9OWN9tg9x2l5q0GXjobwhexBQbzDDQBuoNlHN4W5ZZqvbADI`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0FABhaP0YVHGH5iumlxHmWlUzWub6x7PUroMNMoZ9OWN9tg9x2l5q0GXjobwhexBQbzDDQBuoNlHN4W5ZZqvbADI"
  );

  assert.strictEqual(code, "0F");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      1, 133, 163, 244, 97, 81, 198, 31, 152, 174, 154, 92, 71, 153, 105, 84, 205, 107, 155, 235, 30, 207, 82, 186, 12,
      52, 202, 25, 244, 229, 141, 246, 216, 61, 199, 105, 121, 171, 65, 151, 142, 134, 240, 133, 236, 65, 65, 188, 195,
      13, 0, 110, 160, 217, 71, 55, 133, 185, 101, 154, 175, 108, 0, 200,
    ])
  );
});

test(`Encode 0FABhaP0YVHGH5iumlxHmWlUzWub6x7PUroMNMoZ9OWN9tg9x2l5q0GXjobwhexBQbzDDQBuoNlHN4W5ZZqvbADI`, () => {
  const raw = new Uint8Array([
    1, 133, 163, 244, 97, 81, 198, 31, 152, 174, 154, 92, 71, 153, 105, 84, 205, 107, 155, 235, 30, 207, 82, 186, 12,
    52, 202, 25, 244, 229, 141, 246, 216, 61, 199, 105, 121, 171, 65, 151, 142, 134, 240, 133, 236, 65, 65, 188, 195,
    13, 0, 110, 160, 217, 71, 55, 133, 185, 101, 154, 175, 108, 0, 200,
  ]);
  assert.strictEqual(
    cesr.encode("0F", raw),
    "0FABhaP0YVHGH5iumlxHmWlUzWub6x7PUroMNMoZ9OWN9tg9x2l5q0GXjobwhexBQbzDDQBuoNlHN4W5ZZqvbADI"
  );
});
test(`Decode 0FABhaP0YVHGH5iumlxHmWlUzWub6x7PUroMNMoZ9OWN9tg9x2l5q0GXjobwhexBQbzDDQBuoNlHN4W5ZZqvbADI`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0FABhaP0YVHGH5iumlxHmWlUzWub6x7PUroMNMoZ9OWN9tg9x2l5q0GXjobwhexBQbzDDQBuoNlHN4W5ZZqvbADI"
  );

  assert.strictEqual(code, "0F");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      1, 133, 163, 244, 97, 81, 198, 31, 152, 174, 154, 92, 71, 153, 105, 84, 205, 107, 155, 235, 30, 207, 82, 186, 12,
      52, 202, 25, 244, 229, 141, 246, 216, 61, 199, 105, 121, 171, 65, 151, 142, 134, 240, 133, 236, 65, 65, 188, 195,
      13, 0, 110, 160, 217, 71, 55, 133, 185, 101, 154, 175, 108, 0, 200,
    ])
  );
});

test(`Encode 0FABhaP0YVHGH5iumlxHmWlUzWub6x7PUroMNMoZ9OWN9tg9x2l5q0GXjobwhexBQbzDDQBuoNlHN4W5ZZqvbADI`, () => {
  const raw = new Uint8Array([
    1, 133, 163, 244, 97, 81, 198, 31, 152, 174, 154, 92, 71, 153, 105, 84, 205, 107, 155, 235, 30, 207, 82, 186, 12,
    52, 202, 25, 244, 229, 141, 246, 216, 61, 199, 105, 121, 171, 65, 151, 142, 134, 240, 133, 236, 65, 65, 188, 195,
    13, 0, 110, 160, 217, 71, 55, 133, 185, 101, 154, 175, 108, 0, 200,
  ]);
  assert.strictEqual(
    cesr.encode("0F", raw),
    "0FABhaP0YVHGH5iumlxHmWlUzWub6x7PUroMNMoZ9OWN9tg9x2l5q0GXjobwhexBQbzDDQBuoNlHN4W5ZZqvbADI"
  );
});
test(`Decode 0GCQq-oxku9J-waFh-XzBNkCrsa_iSECzy_smZQ0HNn5Y64vbVGQmnFqJNcyTj9LzD_LvcCd-NBkrTpWvQoxh3HD`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0GCQq-oxku9J-waFh-XzBNkCrsa_iSECzy_smZQ0HNn5Y64vbVGQmnFqJNcyTj9LzD_LvcCd-NBkrTpWvQoxh3HD"
  );

  assert.strictEqual(code, "0G");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      144, 171, 234, 49, 146, 239, 73, 251, 6, 133, 135, 229, 243, 4, 217, 2, 174, 198, 191, 137, 33, 2, 207, 47, 236,
      153, 148, 52, 28, 217, 249, 99, 174, 47, 109, 81, 144, 154, 113, 106, 36, 215, 50, 78, 63, 75, 204, 63, 203, 189,
      192, 157, 248, 208, 100, 173, 58, 86, 189, 10, 49, 135, 113, 195,
    ])
  );
});

test(`Encode 0GCQq-oxku9J-waFh-XzBNkCrsa_iSECzy_smZQ0HNn5Y64vbVGQmnFqJNcyTj9LzD_LvcCd-NBkrTpWvQoxh3HD`, () => {
  const raw = new Uint8Array([
    144, 171, 234, 49, 146, 239, 73, 251, 6, 133, 135, 229, 243, 4, 217, 2, 174, 198, 191, 137, 33, 2, 207, 47, 236,
    153, 148, 52, 28, 217, 249, 99, 174, 47, 109, 81, 144, 154, 113, 106, 36, 215, 50, 78, 63, 75, 204, 63, 203, 189,
    192, 157, 248, 208, 100, 173, 58, 86, 189, 10, 49, 135, 113, 195,
  ]);
  assert.strictEqual(
    cesr.encode("0G", raw),
    "0GCQq-oxku9J-waFh-XzBNkCrsa_iSECzy_smZQ0HNn5Y64vbVGQmnFqJNcyTj9LzD_LvcCd-NBkrTpWvQoxh3HD"
  );
});
test(`Decode 0GCQq-oxku9J-waFh-XzBNkCrsa_iSECzy_smZQ0HNn5Y64vbVGQmnFqJNcyTj9LzD_LvcCd-NBkrTpWvQoxh3HD`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0GCQq-oxku9J-waFh-XzBNkCrsa_iSECzy_smZQ0HNn5Y64vbVGQmnFqJNcyTj9LzD_LvcCd-NBkrTpWvQoxh3HD"
  );

  assert.strictEqual(code, "0G");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      144, 171, 234, 49, 146, 239, 73, 251, 6, 133, 135, 229, 243, 4, 217, 2, 174, 198, 191, 137, 33, 2, 207, 47, 236,
      153, 148, 52, 28, 217, 249, 99, 174, 47, 109, 81, 144, 154, 113, 106, 36, 215, 50, 78, 63, 75, 204, 63, 203, 189,
      192, 157, 248, 208, 100, 173, 58, 86, 189, 10, 49, 135, 113, 195,
    ])
  );
});

test(`Encode 0GCQq-oxku9J-waFh-XzBNkCrsa_iSECzy_smZQ0HNn5Y64vbVGQmnFqJNcyTj9LzD_LvcCd-NBkrTpWvQoxh3HD`, () => {
  const raw = new Uint8Array([
    144, 171, 234, 49, 146, 239, 73, 251, 6, 133, 135, 229, 243, 4, 217, 2, 174, 198, 191, 137, 33, 2, 207, 47, 236,
    153, 148, 52, 28, 217, 249, 99, 174, 47, 109, 81, 144, 154, 113, 106, 36, 215, 50, 78, 63, 75, 204, 63, 203, 189,
    192, 157, 248, 208, 100, 173, 58, 86, 189, 10, 49, 135, 113, 195,
  ]);
  assert.strictEqual(
    cesr.encode("0G", raw),
    "0GCQq-oxku9J-waFh-XzBNkCrsa_iSECzy_smZQ0HNn5Y64vbVGQmnFqJNcyTj9LzD_LvcCd-NBkrTpWvQoxh3HD"
  );
});
test(`Decode 0HD38z9_`, () => {
  const { code, buffer: raw } = cesr.decode("0HD38z9_");

  assert.strictEqual(code, "0H");
  assert.deepStrictEqual(raw, new Uint8Array([247, 243, 63, 127]));
});

test(`Encode 0HD38z9_`, () => {
  const raw = new Uint8Array([247, 243, 63, 127]);
  assert.strictEqual(cesr.encode("0H", raw), "0HD38z9_");
});
test(`Decode 0HD_____`, () => {
  const { code, buffer: raw } = cesr.decode("0HD_____");

  assert.strictEqual(code, "0H");
  assert.deepStrictEqual(raw, new Uint8Array([255, 255, 255, 255]));
});

test(`Encode 0HD_____`, () => {
  const raw = new Uint8Array([255, 255, 255, 255]);
  assert.strictEqual(cesr.encode("0H", raw), "0HD_____");
});
test(`Decode 0IA4Rvn_RXBGAUKrF0cPLlfY-bLJxYoZ6QvGJaruAgTnVdNWZJiZ6tsqCVofnNxh6Q0hN6Jbm3FqdKcoZVZqiO1J`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0IA4Rvn_RXBGAUKrF0cPLlfY-bLJxYoZ6QvGJaruAgTnVdNWZJiZ6tsqCVofnNxh6Q0hN6Jbm3FqdKcoZVZqiO1J"
  );

  assert.strictEqual(code, "0I");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      56, 70, 249, 255, 69, 112, 70, 1, 66, 171, 23, 71, 15, 46, 87, 216, 249, 178, 201, 197, 138, 25, 233, 11, 198, 37,
      170, 238, 2, 4, 231, 85, 211, 86, 100, 152, 153, 234, 219, 42, 9, 90, 31, 156, 220, 97, 233, 13, 33, 55, 162, 91,
      155, 113, 106, 116, 167, 40, 101, 86, 106, 136, 237, 73,
    ])
  );
});

test(`Encode 0IA4Rvn_RXBGAUKrF0cPLlfY-bLJxYoZ6QvGJaruAgTnVdNWZJiZ6tsqCVofnNxh6Q0hN6Jbm3FqdKcoZVZqiO1J`, () => {
  const raw = new Uint8Array([
    56, 70, 249, 255, 69, 112, 70, 1, 66, 171, 23, 71, 15, 46, 87, 216, 249, 178, 201, 197, 138, 25, 233, 11, 198, 37,
    170, 238, 2, 4, 231, 85, 211, 86, 100, 152, 153, 234, 219, 42, 9, 90, 31, 156, 220, 97, 233, 13, 33, 55, 162, 91,
    155, 113, 106, 116, 167, 40, 101, 86, 106, 136, 237, 73,
  ]);
  assert.strictEqual(
    cesr.encode("0I", raw),
    "0IA4Rvn_RXBGAUKrF0cPLlfY-bLJxYoZ6QvGJaruAgTnVdNWZJiZ6tsqCVofnNxh6Q0hN6Jbm3FqdKcoZVZqiO1J"
  );
});
test(`Decode 0IAPBuumfALK5iJXB-eatkN1fiyhDvvZd8DW0aoqxizO1E0VIzPUNpuIPWq6MQCJQw60sWcadXY_JaSXYd1HNf49`, () => {
  const { code, buffer: raw } = cesr.decode(
    "0IAPBuumfALK5iJXB-eatkN1fiyhDvvZd8DW0aoqxizO1E0VIzPUNpuIPWq6MQCJQw60sWcadXY_JaSXYd1HNf49"
  );

  assert.strictEqual(code, "0I");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      15, 6, 235, 166, 124, 2, 202, 230, 34, 87, 7, 231, 154, 182, 67, 117, 126, 44, 161, 14, 251, 217, 119, 192, 214,
      209, 170, 42, 198, 44, 206, 212, 77, 21, 35, 51, 212, 54, 155, 136, 61, 106, 186, 49, 0, 137, 67, 14, 180, 177,
      103, 26, 117, 118, 63, 37, 164, 151, 97, 221, 71, 53, 254, 61,
    ])
  );
});

test(`Encode 0IAPBuumfALK5iJXB-eatkN1fiyhDvvZd8DW0aoqxizO1E0VIzPUNpuIPWq6MQCJQw60sWcadXY_JaSXYd1HNf49`, () => {
  const raw = new Uint8Array([
    15, 6, 235, 166, 124, 2, 202, 230, 34, 87, 7, 231, 154, 182, 67, 117, 126, 44, 161, 14, 251, 217, 119, 192, 214,
    209, 170, 42, 198, 44, 206, 212, 77, 21, 35, 51, 212, 54, 155, 136, 61, 106, 186, 49, 0, 137, 67, 14, 180, 177, 103,
    26, 117, 118, 63, 37, 164, 151, 97, 221, 71, 53, 254, 61,
  ]);
  assert.strictEqual(
    cesr.encode("0I", raw),
    "0IAPBuumfALK5iJXB-eatkN1fiyhDvvZd8DW0aoqxizO1E0VIzPUNpuIPWq6MQCJQw60sWcadXY_JaSXYd1HNf49"
  );
});
test(`Decode 1AAAA1QqjWcSe7KpHKBubjDUZ5pRVpOeBdzNV6-DBAQZfK6E`, () => {
  const { code, buffer: raw } = cesr.decode("1AAAA1QqjWcSe7KpHKBubjDUZ5pRVpOeBdzNV6-DBAQZfK6E");

  assert.strictEqual(code, "1AAA");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      3, 84, 42, 141, 103, 18, 123, 178, 169, 28, 160, 110, 110, 48, 212, 103, 154, 81, 86, 147, 158, 5, 220, 205, 87,
      175, 131, 4, 4, 25, 124, 174, 132,
    ])
  );
});

test(`Encode 1AAAA1QqjWcSe7KpHKBubjDUZ5pRVpOeBdzNV6-DBAQZfK6E`, () => {
  const raw = new Uint8Array([
    3, 84, 42, 141, 103, 18, 123, 178, 169, 28, 160, 110, 110, 48, 212, 103, 154, 81, 86, 147, 158, 5, 220, 205, 87,
    175, 131, 4, 4, 25, 124, 174, 132,
  ]);
  assert.strictEqual(cesr.encode("1AAA", raw), "1AAAA1QqjWcSe7KpHKBubjDUZ5pRVpOeBdzNV6-DBAQZfK6E");
});
test(`Decode 1AAAA36FVApaHPwRVzZZH9Ff3r_dMiy8JakroH695Srp3KeC`, () => {
  const { code, buffer: raw } = cesr.decode("1AAAA36FVApaHPwRVzZZH9Ff3r_dMiy8JakroH695Srp3KeC");

  assert.strictEqual(code, "1AAA");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      3, 126, 133, 84, 10, 90, 28, 252, 17, 87, 54, 89, 31, 209, 95, 222, 191, 221, 50, 44, 188, 37, 169, 43, 160, 126,
      189, 229, 42, 233, 220, 167, 130,
    ])
  );
});

test(`Encode 1AAAA36FVApaHPwRVzZZH9Ff3r_dMiy8JakroH695Srp3KeC`, () => {
  const raw = new Uint8Array([
    3, 126, 133, 84, 10, 90, 28, 252, 17, 87, 54, 89, 31, 209, 95, 222, 191, 221, 50, 44, 188, 37, 169, 43, 160, 126,
    189, 229, 42, 233, 220, 167, 130,
  ]);
  assert.strictEqual(cesr.encode("1AAA", raw), "1AAAA36FVApaHPwRVzZZH9Ff3r_dMiy8JakroH695Srp3KeC");
});
test(`Decode 1AABA2ptrB_GWOlgwTE_GPmrz-yuo7sepLt5a7Li93xv00tK`, () => {
  const { code, buffer: raw } = cesr.decode("1AABA2ptrB_GWOlgwTE_GPmrz-yuo7sepLt5a7Li93xv00tK");

  assert.strictEqual(code, "1AAB");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      3, 106, 109, 172, 31, 198, 88, 233, 96, 193, 49, 63, 24, 249, 171, 207, 236, 174, 163, 187, 30, 164, 187, 121,
      107, 178, 226, 247, 124, 111, 211, 75, 74,
    ])
  );
});

test(`Encode 1AABA2ptrB_GWOlgwTE_GPmrz-yuo7sepLt5a7Li93xv00tK`, () => {
  const raw = new Uint8Array([
    3, 106, 109, 172, 31, 198, 88, 233, 96, 193, 49, 63, 24, 249, 171, 207, 236, 174, 163, 187, 30, 164, 187, 121, 107,
    178, 226, 247, 124, 111, 211, 75, 74,
  ]);
  assert.strictEqual(cesr.encode("1AAB", raw), "1AABA2ptrB_GWOlgwTE_GPmrz-yuo7sepLt5a7Li93xv00tK");
});
test(`Decode 1AABA3LuRYC1N0PA2l5D2ZyeQQNkFUPZckrQUGcAPksmMqQS`, () => {
  const { code, buffer: raw } = cesr.decode("1AABA3LuRYC1N0PA2l5D2ZyeQQNkFUPZckrQUGcAPksmMqQS");

  assert.strictEqual(code, "1AAB");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      3, 114, 238, 69, 128, 181, 55, 67, 192, 218, 94, 67, 217, 156, 158, 65, 3, 100, 21, 67, 217, 114, 74, 208, 80,
      103, 0, 62, 75, 38, 50, 164, 18,
    ])
  );
});

test(`Encode 1AABA3LuRYC1N0PA2l5D2ZyeQQNkFUPZckrQUGcAPksmMqQS`, () => {
  const raw = new Uint8Array([
    3, 114, 238, 69, 128, 181, 55, 67, 192, 218, 94, 67, 217, 156, 158, 65, 3, 100, 21, 67, 217, 114, 74, 208, 80, 103,
    0, 62, 75, 38, 50, 164, 18,
  ]);
  assert.strictEqual(cesr.encode("1AAB", raw), "1AABA3LuRYC1N0PA2l5D2ZyeQQNkFUPZckrQUGcAPksmMqQS");
});
test(`Decode 1AAG2020-08-22T17c50c09d988921-01c00`, () => {
  const { code, buffer: raw } = cesr.decode("1AAG2020-08-22T17c50c09d988921-01c00");

  assert.strictEqual(code, "1AAG");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      219, 77, 180, 251, 79, 62, 219, 100, 245, 237, 206, 116, 115, 79, 93, 247, 207, 61, 219, 95, 180, 213, 205, 52,
    ])
  );
});

test(`Encode 1AAG2020-08-22T17c50c09d988921-01c00`, () => {
  const raw = new Uint8Array([
    219, 77, 180, 251, 79, 62, 219, 100, 245, 237, 206, 116, 115, 79, 93, 247, 207, 61, 219, 95, 180, 213, 205, 52,
  ]);
  assert.strictEqual(cesr.encode("1AAG", raw), "1AAG2020-08-22T17c50c09d988921-01c00");
});
test(`Decode 1AAG2020-08-22T17c50c09d988921p00c00`, () => {
  const { code, buffer: raw } = cesr.decode("1AAG2020-08-22T17c50c09d988921p00c00");

  assert.strictEqual(code, "1AAG");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      219, 77, 180, 251, 79, 62, 219, 100, 245, 237, 206, 116, 115, 79, 93, 247, 207, 61, 219, 90, 116, 209, 205, 52,
    ])
  );
});

test(`Encode 1AAG2020-08-22T17c50c09d988921p00c00`, () => {
  const raw = new Uint8Array([
    219, 77, 180, 251, 79, 62, 219, 100, 245, 237, 206, 116, 115, 79, 93, 247, 207, 61, 219, 90, 116, 209, 205, 52,
  ]);
  assert.strictEqual(cesr.encode("1AAG", raw), "1AAG2020-08-22T17c50c09d988921p00c00");
});
test(`Decode 1AAH-kSy4FxFPrQV6aEV10k4c3ifXzX6Gc-jpEfM5FH3iwswe5QDDPnsiqMU24YrshMXH-1Op1TGIuQXYa0ZhCyI7Vg4_BWzAn01`, () => {
  const { code, buffer: raw } = cesr.decode(
    "1AAH-kSy4FxFPrQV6aEV10k4c3ifXzX6Gc-jpEfM5FH3iwswe5QDDPnsiqMU24YrshMXH-1Op1TGIuQXYa0ZhCyI7Vg4_BWzAn01"
  );

  assert.strictEqual(code, "1AAH");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      250, 68, 178, 224, 92, 69, 62, 180, 21, 233, 161, 21, 215, 73, 56, 115, 120, 159, 95, 53, 250, 25, 207, 163, 164,
      71, 204, 228, 81, 247, 139, 11, 48, 123, 148, 3, 12, 249, 236, 138, 163, 20, 219, 134, 43, 178, 19, 23, 31, 237,
      78, 167, 84, 198, 34, 228, 23, 97, 173, 25, 132, 44, 136, 237, 88, 56, 252, 21, 179, 2, 125, 53,
    ])
  );
});

test(`Encode 1AAH-kSy4FxFPrQV6aEV10k4c3ifXzX6Gc-jpEfM5FH3iwswe5QDDPnsiqMU24YrshMXH-1Op1TGIuQXYa0ZhCyI7Vg4_BWzAn01`, () => {
  const raw = new Uint8Array([
    250, 68, 178, 224, 92, 69, 62, 180, 21, 233, 161, 21, 215, 73, 56, 115, 120, 159, 95, 53, 250, 25, 207, 163, 164,
    71, 204, 228, 81, 247, 139, 11, 48, 123, 148, 3, 12, 249, 236, 138, 163, 20, 219, 134, 43, 178, 19, 23, 31, 237, 78,
    167, 84, 198, 34, 228, 23, 97, 173, 25, 132, 44, 136, 237, 88, 56, 252, 21, 179, 2, 125, 53,
  ]);
  assert.strictEqual(
    cesr.encode("1AAH", raw),
    "1AAH-kSy4FxFPrQV6aEV10k4c3ifXzX6Gc-jpEfM5FH3iwswe5QDDPnsiqMU24YrshMXH-1Op1TGIuQXYa0ZhCyI7Vg4_BWzAn01"
  );
});
test(`Decode 1AAH1EYMlorPRN2r_EcqztcIZim5jf7jzQscaHliED1rzj2F-WnZ-nti6Ua39NQ3OgCm54pgKHjFosQ1aiwLWNzmr2db1HltShy2`, () => {
  const { code, buffer: raw } = cesr.decode(
    "1AAH1EYMlorPRN2r_EcqztcIZim5jf7jzQscaHliED1rzj2F-WnZ-nti6Ua39NQ3OgCm54pgKHjFosQ1aiwLWNzmr2db1HltShy2"
  );

  assert.strictEqual(code, "1AAH");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      212, 70, 12, 150, 138, 207, 68, 221, 171, 252, 71, 42, 206, 215, 8, 102, 41, 185, 141, 254, 227, 205, 11, 28, 104,
      121, 98, 16, 61, 107, 206, 61, 133, 249, 105, 217, 250, 123, 98, 233, 70, 183, 244, 212, 55, 58, 0, 166, 231, 138,
      96, 40, 120, 197, 162, 196, 53, 106, 44, 11, 88, 220, 230, 175, 103, 91, 212, 121, 109, 74, 28, 182,
    ])
  );
});

test(`Encode 1AAH1EYMlorPRN2r_EcqztcIZim5jf7jzQscaHliED1rzj2F-WnZ-nti6Ua39NQ3OgCm54pgKHjFosQ1aiwLWNzmr2db1HltShy2`, () => {
  const raw = new Uint8Array([
    212, 70, 12, 150, 138, 207, 68, 221, 171, 252, 71, 42, 206, 215, 8, 102, 41, 185, 141, 254, 227, 205, 11, 28, 104,
    121, 98, 16, 61, 107, 206, 61, 133, 249, 105, 217, 250, 123, 98, 233, 70, 183, 244, 212, 55, 58, 0, 166, 231, 138,
    96, 40, 120, 197, 162, 196, 53, 106, 44, 11, 88, 220, 230, 175, 103, 91, 212, 121, 109, 74, 28, 182,
  ]);
  assert.strictEqual(
    cesr.encode("1AAH", raw),
    "1AAH1EYMlorPRN2r_EcqztcIZim5jf7jzQscaHliED1rzj2F-WnZ-nti6Ua39NQ3OgCm54pgKHjFosQ1aiwLWNzmr2db1HltShy2"
  );
});
test(`Decode 1AAIA-KzxCX8SZSl-fpU3vc3z_MBuH06YShJFuiMdAmo37TM`, () => {
  const { code, buffer: raw } = cesr.decode("1AAIA-KzxCX8SZSl-fpU3vc3z_MBuH06YShJFuiMdAmo37TM");

  assert.strictEqual(code, "1AAI");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      3, 226, 179, 196, 37, 252, 73, 148, 165, 249, 250, 84, 222, 247, 55, 207, 243, 1, 184, 125, 58, 97, 40, 73, 22,
      232, 140, 116, 9, 168, 223, 180, 204,
    ])
  );
});

test(`Encode 1AAIA-KzxCX8SZSl-fpU3vc3z_MBuH06YShJFuiMdAmo37TM`, () => {
  const raw = new Uint8Array([
    3, 226, 179, 196, 37, 252, 73, 148, 165, 249, 250, 84, 222, 247, 55, 207, 243, 1, 184, 125, 58, 97, 40, 73, 22, 232,
    140, 116, 9, 168, 223, 180, 204,
  ]);
  assert.strictEqual(cesr.encode("1AAI", raw), "1AAIA-KzxCX8SZSl-fpU3vc3z_MBuH06YShJFuiMdAmo37TM");
});
test(`Decode 1AAIA-ZkE2jjk-J6A2kwWKyCidDNP5dZ8szcrD7O6Daf3nJs`, () => {
  const { code, buffer: raw } = cesr.decode("1AAIA-ZkE2jjk-J6A2kwWKyCidDNP5dZ8szcrD7O6Daf3nJs");

  assert.strictEqual(code, "1AAI");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      3, 230, 100, 19, 104, 227, 147, 226, 122, 3, 105, 48, 88, 172, 130, 137, 208, 205, 63, 151, 89, 242, 204, 220,
      172, 62, 206, 232, 54, 159, 222, 114, 108,
    ])
  );
});

test(`Encode 1AAIA-ZkE2jjk-J6A2kwWKyCidDNP5dZ8szcrD7O6Daf3nJs`, () => {
  const raw = new Uint8Array([
    3, 230, 100, 19, 104, 227, 147, 226, 122, 3, 105, 48, 88, 172, 130, 137, 208, 205, 63, 151, 89, 242, 204, 220, 172,
    62, 206, 232, 54, 159, 222, 114, 108,
  ]);
  assert.strictEqual(cesr.encode("1AAI", raw), "1AAIA-ZkE2jjk-J6A2kwWKyCidDNP5dZ8szcrD7O6Daf3nJs");
});
test(`Decode 1AAJA-KzxCX8SZSl-fpU3vc3z_MBuH06YShJFuiMdAmo37TM`, () => {
  const { code, buffer: raw } = cesr.decode("1AAJA-KzxCX8SZSl-fpU3vc3z_MBuH06YShJFuiMdAmo37TM");

  assert.strictEqual(code, "1AAJ");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      3, 226, 179, 196, 37, 252, 73, 148, 165, 249, 250, 84, 222, 247, 55, 207, 243, 1, 184, 125, 58, 97, 40, 73, 22,
      232, 140, 116, 9, 168, 223, 180, 204,
    ])
  );
});

test(`Encode 1AAJA-KzxCX8SZSl-fpU3vc3z_MBuH06YShJFuiMdAmo37TM`, () => {
  const raw = new Uint8Array([
    3, 226, 179, 196, 37, 252, 73, 148, 165, 249, 250, 84, 222, 247, 55, 207, 243, 1, 184, 125, 58, 97, 40, 73, 22, 232,
    140, 116, 9, 168, 223, 180, 204,
  ]);
  assert.strictEqual(cesr.encode("1AAJ", raw), "1AAJA-KzxCX8SZSl-fpU3vc3z_MBuH06YShJFuiMdAmo37TM");
});
test(`Decode 1AAJA3cK_P2CDlh-_EMFPvyqTPI1POkw-dr14DANx5JEXDCZ`, () => {
  const { code, buffer: raw } = cesr.decode("1AAJA3cK_P2CDlh-_EMFPvyqTPI1POkw-dr14DANx5JEXDCZ");

  assert.strictEqual(code, "1AAJ");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      3, 119, 10, 252, 253, 130, 14, 88, 126, 252, 67, 5, 62, 252, 170, 76, 242, 53, 60, 233, 48, 249, 218, 245, 224,
      48, 13, 199, 146, 68, 92, 48, 153,
    ])
  );
});

test(`Encode 1AAJA3cK_P2CDlh-_EMFPvyqTPI1POkw-dr14DANx5JEXDCZ`, () => {
  const raw = new Uint8Array([
    3, 119, 10, 252, 253, 130, 14, 88, 126, 252, 67, 5, 62, 252, 170, 76, 242, 53, 60, 233, 48, 249, 218, 245, 224, 48,
    13, 199, 146, 68, 92, 48, 153,
  ]);
  assert.strictEqual(cesr.encode("1AAJ", raw), "1AAJA3cK_P2CDlh-_EMFPvyqTPI1POkw-dr14DANx5JEXDCZ");
});
test(`Decode 4AAA`, () => {
  const { code, buffer: raw } = cesr.decode("4AAA");

  assert.strictEqual(code, "4A");
  assert.deepStrictEqual(raw, new Uint8Array([]));
});

test(`Decode 4BABXioj`, () => {
  const { code, buffer: raw } = cesr.decode("4BABXioj");

  assert.strictEqual(code, "4B");
  assert.deepStrictEqual(raw, new Uint8Array([94, 42, 35]));
});
test(`Decode 5AABAA-A`, () => {
  const { code, buffer: raw } = cesr.decode("5AABAA-A");

  assert.strictEqual(code, "5A");
  assert.deepStrictEqual(raw, new Uint8Array([15, 128]));
});

test(`Decode AA-nK-e7WJ6tPBpywCJFVOvIkUJ-gb-_j-jLjfTcA0pt`, () => {
  const { code, buffer: raw } = cesr.decode("AA-nK-e7WJ6tPBpywCJFVOvIkUJ-gb-_j-jLjfTcA0pt");

  assert.strictEqual(code, "A");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      15, 167, 43, 231, 187, 88, 158, 173, 60, 26, 114, 192, 34, 69, 84, 235, 200, 145, 66, 126, 129, 191, 191, 143,
      232, 203, 141, 244, 220, 3, 74, 109,
    ])
  );
});

test(`Encode AA-nK-e7WJ6tPBpywCJFVOvIkUJ-gb-_j-jLjfTcA0pt`, () => {
  const raw = new Uint8Array([
    15, 167, 43, 231, 187, 88, 158, 173, 60, 26, 114, 192, 34, 69, 84, 235, 200, 145, 66, 126, 129, 191, 191, 143, 232,
    203, 141, 244, 220, 3, 74, 109,
  ]);
  assert.strictEqual(cesr.encode("A", raw), "AA-nK-e7WJ6tPBpywCJFVOvIkUJ-gb-_j-jLjfTcA0pt");
});
test(`Decode AA-nVhMMJciMPvmF5VZE_9H-nhrgng9aJWf7_UHPtRNM`, () => {
  const { code, buffer: raw } = cesr.decode("AA-nVhMMJciMPvmF5VZE_9H-nhrgng9aJWf7_UHPtRNM");

  assert.strictEqual(code, "A");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      15, 167, 86, 19, 12, 37, 200, 140, 62, 249, 133, 229, 86, 68, 255, 209, 254, 158, 26, 224, 158, 15, 90, 37, 103,
      251, 253, 65, 207, 181, 19, 76,
    ])
  );
});

test(`Encode AA-nVhMMJciMPvmF5VZE_9H-nhrgng9aJWf7_UHPtRNM`, () => {
  const raw = new Uint8Array([
    15, 167, 86, 19, 12, 37, 200, 140, 62, 249, 133, 229, 86, 68, 255, 209, 254, 158, 26, 224, 158, 15, 90, 37, 103,
    251, 253, 65, 207, 181, 19, 76,
  ]);
  assert.strictEqual(cesr.encode("A", raw), "AA-nVhMMJciMPvmF5VZE_9H-nhrgng9aJWf7_UHPtRNM");
});
test(`Decode BA-hHykvEM3ZGo34nCS8tVupZxUelcRBltp5Rvh1UB-c`, () => {
  const { code, buffer: raw } = cesr.decode("BA-hHykvEM3ZGo34nCS8tVupZxUelcRBltp5Rvh1UB-c");

  assert.strictEqual(code, "B");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      15, 161, 31, 41, 47, 16, 205, 217, 26, 141, 248, 156, 36, 188, 181, 91, 169, 103, 21, 30, 149, 196, 65, 150, 218,
      121, 70, 248, 117, 80, 31, 156,
    ])
  );
});

test(`Encode BA-hHykvEM3ZGo34nCS8tVupZxUelcRBltp5Rvh1UB-c`, () => {
  const raw = new Uint8Array([
    15, 161, 31, 41, 47, 16, 205, 217, 26, 141, 248, 156, 36, 188, 181, 91, 169, 103, 21, 30, 149, 196, 65, 150, 218,
    121, 70, 248, 117, 80, 31, 156,
  ]);
  assert.strictEqual(cesr.encode("B", raw), "BA-hHykvEM3ZGo34nCS8tVupZxUelcRBltp5Rvh1UB-c");
});
test(`Decode BA0Q8opUrNwfUK964il660bJNlIfMXZKsCUNPpe7WimZ`, () => {
  const { code, buffer: raw } = cesr.decode("BA0Q8opUrNwfUK964il660bJNlIfMXZKsCUNPpe7WimZ");

  assert.strictEqual(code, "B");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      13, 16, 242, 138, 84, 172, 220, 31, 80, 175, 122, 226, 41, 122, 235, 70, 201, 54, 82, 31, 49, 118, 74, 176, 37,
      13, 62, 151, 187, 90, 41, 153,
    ])
  );
});

test(`Encode BA0Q8opUrNwfUK964il660bJNlIfMXZKsCUNPpe7WimZ`, () => {
  const raw = new Uint8Array([
    13, 16, 242, 138, 84, 172, 220, 31, 80, 175, 122, 226, 41, 122, 235, 70, 201, 54, 82, 31, 49, 118, 74, 176, 37, 13,
    62, 151, 187, 90, 41, 153,
  ]);
  assert.strictEqual(cesr.encode("B", raw), "BA0Q8opUrNwfUK964il660bJNlIfMXZKsCUNPpe7WimZ");
});
test(`Decode CAF7Wr3XNq5hArcOuBJzaY6Nd23jgtUVI6KDfb3VngkR`, () => {
  const { code, buffer: raw } = cesr.decode("CAF7Wr3XNq5hArcOuBJzaY6Nd23jgtUVI6KDfb3VngkR");

  assert.strictEqual(code, "C");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      1, 123, 90, 189, 215, 54, 174, 97, 2, 183, 14, 184, 18, 115, 105, 142, 141, 119, 109, 227, 130, 213, 21, 35, 162,
      131, 125, 189, 213, 158, 9, 17,
    ])
  );
});

test(`Encode CAF7Wr3XNq5hArcOuBJzaY6Nd23jgtUVI6KDfb3VngkR`, () => {
  const raw = new Uint8Array([
    1, 123, 90, 189, 215, 54, 174, 97, 2, 183, 14, 184, 18, 115, 105, 142, 141, 119, 109, 227, 130, 213, 21, 35, 162,
    131, 125, 189, 213, 158, 9, 17,
  ]);
  assert.strictEqual(cesr.encode("C", raw), "CAF7Wr3XNq5hArcOuBJzaY6Nd23jgtUVI6KDfb3VngkR");
});
test(`Decode CIy9um082YoNG-VJPUMHidS2Fokyf-4IZsH0ZV-D69M-`, () => {
  const { code, buffer: raw } = cesr.decode("CIy9um082YoNG-VJPUMHidS2Fokyf-4IZsH0ZV-D69M-");

  assert.strictEqual(code, "C");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      140, 189, 186, 109, 60, 217, 138, 13, 27, 229, 73, 61, 67, 7, 137, 212, 182, 22, 137, 50, 127, 238, 8, 102, 193,
      244, 101, 95, 131, 235, 211, 62,
    ])
  );
});

test(`Encode CIy9um082YoNG-VJPUMHidS2Fokyf-4IZsH0ZV-D69M-`, () => {
  const raw = new Uint8Array([
    140, 189, 186, 109, 60, 217, 138, 13, 27, 229, 73, 61, 67, 7, 137, 212, 182, 22, 137, 50, 127, 238, 8, 102, 193,
    244, 101, 95, 131, 235, 211, 62,
  ]);
  assert.strictEqual(cesr.encode("C", raw), "CIy9um082YoNG-VJPUMHidS2Fokyf-4IZsH0ZV-D69M-");
});
test(`Decode DA0sGscEkTLfuDYEws6Ct4ESjdBguQEek9RyYWFOZOms`, () => {
  const { code, buffer: raw } = cesr.decode("DA0sGscEkTLfuDYEws6Ct4ESjdBguQEek9RyYWFOZOms");

  assert.strictEqual(code, "D");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      13, 44, 26, 199, 4, 145, 50, 223, 184, 54, 4, 194, 206, 130, 183, 129, 18, 141, 208, 96, 185, 1, 30, 147, 212,
      114, 97, 97, 78, 100, 233, 172,
    ])
  );
});

test(`Encode DA0sGscEkTLfuDYEws6Ct4ESjdBguQEek9RyYWFOZOms`, () => {
  const raw = new Uint8Array([
    13, 44, 26, 199, 4, 145, 50, 223, 184, 54, 4, 194, 206, 130, 183, 129, 18, 141, 208, 96, 185, 1, 30, 147, 212, 114,
    97, 97, 78, 100, 233, 172,
  ]);
  assert.strictEqual(cesr.encode("D", raw), "DA0sGscEkTLfuDYEws6Ct4ESjdBguQEek9RyYWFOZOms");
});
test(`Decode DA2-oB5mPvKweESa7e9-N9knubKcrGBPhhrGRee9I2oj`, () => {
  const { code, buffer: raw } = cesr.decode("DA2-oB5mPvKweESa7e9-N9knubKcrGBPhhrGRee9I2oj");

  assert.strictEqual(code, "D");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      13, 190, 160, 30, 102, 62, 242, 176, 120, 68, 154, 237, 239, 126, 55, 217, 39, 185, 178, 156, 172, 96, 79, 134,
      26, 198, 69, 231, 189, 35, 106, 35,
    ])
  );
});

test(`Encode DA2-oB5mPvKweESa7e9-N9knubKcrGBPhhrGRee9I2oj`, () => {
  const raw = new Uint8Array([
    13, 190, 160, 30, 102, 62, 242, 176, 120, 68, 154, 237, 239, 126, 55, 217, 39, 185, 178, 156, 172, 96, 79, 134, 26,
    198, 69, 231, 189, 35, 106, 35,
  ]);
  assert.strictEqual(cesr.encode("D", raw), "DA2-oB5mPvKweESa7e9-N9knubKcrGBPhhrGRee9I2oj");
});
test(`Decode EA-GkCqYT65JLJ07ZSFQQCYwblX3qajt1CA8rEEDR-Bg`, () => {
  const { code, buffer: raw } = cesr.decode("EA-GkCqYT65JLJ07ZSFQQCYwblX3qajt1CA8rEEDR-Bg");

  assert.strictEqual(code, "E");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      15, 134, 144, 42, 152, 79, 174, 73, 44, 157, 59, 101, 33, 80, 64, 38, 48, 110, 85, 247, 169, 168, 237, 212, 32,
      60, 172, 65, 3, 71, 224, 96,
    ])
  );
});

test(`Encode EA-GkCqYT65JLJ07ZSFQQCYwblX3qajt1CA8rEEDR-Bg`, () => {
  const raw = new Uint8Array([
    15, 134, 144, 42, 152, 79, 174, 73, 44, 157, 59, 101, 33, 80, 64, 38, 48, 110, 85, 247, 169, 168, 237, 212, 32, 60,
    172, 65, 3, 71, 224, 96,
  ]);
  assert.strictEqual(cesr.encode("E", raw), "EA-GkCqYT65JLJ07ZSFQQCYwblX3qajt1CA8rEEDR-Bg");
});
test(`Decode EA-J3WZcV8NuoSYYufIwlqKxV1XVvximEAtabItM3smt`, () => {
  const { code, buffer: raw } = cesr.decode("EA-J3WZcV8NuoSYYufIwlqKxV1XVvximEAtabItM3smt");

  assert.strictEqual(code, "E");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      15, 137, 221, 102, 92, 87, 195, 110, 161, 38, 24, 185, 242, 48, 150, 162, 177, 87, 85, 213, 191, 24, 166, 16, 11,
      90, 108, 139, 76, 222, 201, 173,
    ])
  );
});

test(`Encode EA-J3WZcV8NuoSYYufIwlqKxV1XVvximEAtabItM3smt`, () => {
  const raw = new Uint8Array([
    15, 137, 221, 102, 92, 87, 195, 110, 161, 38, 24, 185, 242, 48, 150, 162, 177, 87, 85, 213, 191, 24, 166, 16, 11,
    90, 108, 139, 76, 222, 201, 173,
  ]);
  assert.strictEqual(cesr.encode("E", raw), "EA-J3WZcV8NuoSYYufIwlqKxV1XVvximEAtabItM3smt");
});
test(`Decode FF36lp3jxrfn3eq3Qq2Ig6hsf7ueOrhu1cLFe5fJk9dQ`, () => {
  const { code, buffer: raw } = cesr.decode("FF36lp3jxrfn3eq3Qq2Ig6hsf7ueOrhu1cLFe5fJk9dQ");

  assert.strictEqual(code, "F");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      93, 250, 150, 157, 227, 198, 183, 231, 221, 234, 183, 66, 173, 136, 131, 168, 108, 127, 187, 158, 58, 184, 110,
      213, 194, 197, 123, 151, 201, 147, 215, 80,
    ])
  );
});

test(`Encode FF36lp3jxrfn3eq3Qq2Ig6hsf7ueOrhu1cLFe5fJk9dQ`, () => {
  const raw = new Uint8Array([
    93, 250, 150, 157, 227, 198, 183, 231, 221, 234, 183, 66, 173, 136, 131, 168, 108, 127, 187, 158, 58, 184, 110, 213,
    194, 197, 123, 151, 201, 147, 215, 80,
  ]);
  assert.strictEqual(cesr.encode("F", raw), "FF36lp3jxrfn3eq3Qq2Ig6hsf7ueOrhu1cLFe5fJk9dQ");
});
test(`Decode FFtf9ZYDSevUD5ySvqQ-bPHIpxRWIZxjfJ7ss_DHa3s4`, () => {
  const { code, buffer: raw } = cesr.decode("FFtf9ZYDSevUD5ySvqQ-bPHIpxRWIZxjfJ7ss_DHa3s4");

  assert.strictEqual(code, "F");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      91, 95, 245, 150, 3, 73, 235, 212, 15, 156, 146, 190, 164, 62, 108, 241, 200, 167, 20, 86, 33, 156, 99, 124, 158,
      236, 179, 240, 199, 107, 123, 56,
    ])
  );
});

test(`Encode FFtf9ZYDSevUD5ySvqQ-bPHIpxRWIZxjfJ7ss_DHa3s4`, () => {
  const raw = new Uint8Array([
    91, 95, 245, 150, 3, 73, 235, 212, 15, 156, 146, 190, 164, 62, 108, 241, 200, 167, 20, 86, 33, 156, 99, 124, 158,
    236, 179, 240, 199, 107, 123, 56,
  ]);
  assert.strictEqual(cesr.encode("F", raw), "FFtf9ZYDSevUD5ySvqQ-bPHIpxRWIZxjfJ7ss_DHa3s4");
});
test(`Decode GEYnRCwpnZPuO7NDiOhAFZNTwaJb0tR3rc1W8W8ATSGy`, () => {
  const { code, buffer: raw } = cesr.decode("GEYnRCwpnZPuO7NDiOhAFZNTwaJb0tR3rc1W8W8ATSGy");

  assert.strictEqual(code, "G");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      70, 39, 68, 44, 41, 157, 147, 238, 59, 179, 67, 136, 232, 64, 21, 147, 83, 193, 162, 91, 210, 212, 119, 173, 205,
      86, 241, 111, 0, 77, 33, 178,
    ])
  );
});

test(`Encode GEYnRCwpnZPuO7NDiOhAFZNTwaJb0tR3rc1W8W8ATSGy`, () => {
  const raw = new Uint8Array([
    70, 39, 68, 44, 41, 157, 147, 238, 59, 179, 67, 136, 232, 64, 21, 147, 83, 193, 162, 91, 210, 212, 119, 173, 205,
    86, 241, 111, 0, 77, 33, 178,
  ]);
  assert.strictEqual(cesr.encode("G", raw), "GEYnRCwpnZPuO7NDiOhAFZNTwaJb0tR3rc1W8W8ATSGy");
});
test(`Decode GIp3rPTTrL9iPRBqMiCxN0l8qpXkzT5Y1TxRzb-Mh0BZ`, () => {
  const { code, buffer: raw } = cesr.decode("GIp3rPTTrL9iPRBqMiCxN0l8qpXkzT5Y1TxRzb-Mh0BZ");

  assert.strictEqual(code, "G");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      138, 119, 172, 244, 211, 172, 191, 98, 61, 16, 106, 50, 32, 177, 55, 73, 124, 170, 149, 228, 205, 62, 88, 213, 60,
      81, 205, 191, 140, 135, 64, 89,
    ])
  );
});

test(`Encode GIp3rPTTrL9iPRBqMiCxN0l8qpXkzT5Y1TxRzb-Mh0BZ`, () => {
  const raw = new Uint8Array([
    138, 119, 172, 244, 211, 172, 191, 98, 61, 16, 106, 50, 32, 177, 55, 73, 124, 170, 149, 228, 205, 62, 88, 213, 60,
    81, 205, 191, 140, 135, 64, 89,
  ]);
  assert.strictEqual(cesr.encode("G", raw), "GIp3rPTTrL9iPRBqMiCxN0l8qpXkzT5Y1TxRzb-Mh0BZ");
});
test(`Decode HAFdT9CbnLpOSMhRPy8T_eec-XYedjaQ4V5hJ66gyfHF`, () => {
  const { code, buffer: raw } = cesr.decode("HAFdT9CbnLpOSMhRPy8T_eec-XYedjaQ4V5hJ66gyfHF");

  assert.strictEqual(code, "H");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      1, 93, 79, 208, 155, 156, 186, 78, 72, 200, 81, 63, 47, 19, 253, 231, 156, 249, 118, 30, 118, 54, 144, 225, 94,
      97, 39, 174, 160, 201, 241, 197,
    ])
  );
});

test(`Encode HAFdT9CbnLpOSMhRPy8T_eec-XYedjaQ4V5hJ66gyfHF`, () => {
  const raw = new Uint8Array([
    1, 93, 79, 208, 155, 156, 186, 78, 72, 200, 81, 63, 47, 19, 253, 231, 156, 249, 118, 30, 118, 54, 144, 225, 94, 97,
    39, 174, 160, 201, 241, 197,
  ]);
  assert.strictEqual(cesr.encode("H", raw), "HAFdT9CbnLpOSMhRPy8T_eec-XYedjaQ4V5hJ66gyfHF");
});
test(`Decode HAZFOKNP44vTyHtQe9dsp9FlzPjB5oAEWnuJdrA-UZo4`, () => {
  const { code, buffer: raw } = cesr.decode("HAZFOKNP44vTyHtQe9dsp9FlzPjB5oAEWnuJdrA-UZo4");

  assert.strictEqual(code, "H");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      6, 69, 56, 163, 79, 227, 139, 211, 200, 123, 80, 123, 215, 108, 167, 209, 101, 204, 248, 193, 230, 128, 4, 90,
      123, 137, 118, 176, 62, 81, 154, 56,
    ])
  );
});

test(`Encode HAZFOKNP44vTyHtQe9dsp9FlzPjB5oAEWnuJdrA-UZo4`, () => {
  const raw = new Uint8Array([
    6, 69, 56, 163, 79, 227, 139, 211, 200, 123, 80, 123, 215, 108, 167, 209, 101, 204, 248, 193, 230, 128, 4, 90, 123,
    137, 118, 176, 62, 81, 154, 56,
  ]);
  assert.strictEqual(cesr.encode("H", raw), "HAZFOKNP44vTyHtQe9dsp9FlzPjB5oAEWnuJdrA-UZo4");
});
test(`Decode IAEfwplOOdJRFBVA-HppCSs_IqhnZ_coPefu7bOJe-32`, () => {
  const { code, buffer: raw } = cesr.decode("IAEfwplOOdJRFBVA-HppCSs_IqhnZ_coPefu7bOJe-32");

  assert.strictEqual(code, "I");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      1, 31, 194, 153, 78, 57, 210, 81, 20, 21, 64, 248, 122, 105, 9, 43, 63, 34, 168, 103, 103, 247, 40, 61, 231, 238,
      237, 179, 137, 123, 237, 246,
    ])
  );
});

test(`Encode IAEfwplOOdJRFBVA-HppCSs_IqhnZ_coPefu7bOJe-32`, () => {
  const raw = new Uint8Array([
    1, 31, 194, 153, 78, 57, 210, 81, 20, 21, 64, 248, 122, 105, 9, 43, 63, 34, 168, 103, 103, 247, 40, 61, 231, 238,
    237, 179, 137, 123, 237, 246,
  ]);
  assert.strictEqual(cesr.encode("I", raw), "IAEfwplOOdJRFBVA-HppCSs_IqhnZ_coPefu7bOJe-32");
});
test(`Decode IKxy2sgzfplyr-tgwIxS19f2OchFHtLwPWD3v4oYimBx`, () => {
  const { code, buffer: raw } = cesr.decode("IKxy2sgzfplyr-tgwIxS19f2OchFHtLwPWD3v4oYimBx");

  assert.strictEqual(code, "I");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      172, 114, 218, 200, 51, 126, 153, 114, 175, 235, 96, 192, 140, 82, 215, 215, 246, 57, 200, 69, 30, 210, 240, 61,
      96, 247, 191, 138, 24, 138, 96, 113,
    ])
  );
});

test(`Encode IKxy2sgzfplyr-tgwIxS19f2OchFHtLwPWD3v4oYimBx`, () => {
  const raw = new Uint8Array([
    172, 114, 218, 200, 51, 126, 153, 114, 175, 235, 96, 192, 140, 82, 215, 215, 246, 57, 200, 69, 30, 210, 240, 61, 96,
    247, 191, 138, 24, 138, 96, 113,
  ]);
  assert.strictEqual(cesr.encode("I", raw), "IKxy2sgzfplyr-tgwIxS19f2OchFHtLwPWD3v4oYimBx");
});
test(`Decode JApipvfcwTAju8qv8JKB78C7x2WYU07ai3CdpETh1-WD`, () => {
  const { code, buffer: raw } = cesr.decode("JApipvfcwTAju8qv8JKB78C7x2WYU07ai3CdpETh1-WD");

  assert.strictEqual(code, "J");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      10, 98, 166, 247, 220, 193, 48, 35, 187, 202, 175, 240, 146, 129, 239, 192, 187, 199, 101, 152, 83, 78, 218, 139,
      112, 157, 164, 68, 225, 215, 229, 131,
    ])
  );
});

test(`Encode JApipvfcwTAju8qv8JKB78C7x2WYU07ai3CdpETh1-WD`, () => {
  const raw = new Uint8Array([
    10, 98, 166, 247, 220, 193, 48, 35, 187, 202, 175, 240, 146, 129, 239, 192, 187, 199, 101, 152, 83, 78, 218, 139,
    112, 157, 164, 68, 225, 215, 229, 131,
  ]);
  assert.strictEqual(cesr.encode("J", raw), "JApipvfcwTAju8qv8JKB78C7x2WYU07ai3CdpETh1-WD");
});
test(`Decode JAy2ealMJMK13t8t2dBs68chWE5id-Edz0vyevo3lSE_`, () => {
  const { code, buffer: raw } = cesr.decode("JAy2ealMJMK13t8t2dBs68chWE5id-Edz0vyevo3lSE_");

  assert.strictEqual(code, "J");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      12, 182, 121, 169, 76, 36, 194, 181, 222, 223, 45, 217, 208, 108, 235, 199, 33, 88, 78, 98, 119, 225, 29, 207, 75,
      242, 122, 250, 55, 149, 33, 63,
    ])
  );
});

test(`Encode JAy2ealMJMK13t8t2dBs68chWE5id-Edz0vyevo3lSE_`, () => {
  const raw = new Uint8Array([
    12, 182, 121, 169, 76, 36, 194, 181, 222, 223, 45, 217, 208, 108, 235, 199, 33, 88, 78, 98, 119, 225, 29, 207, 75,
    242, 122, 250, 55, 149, 33, 63,
  ]);
  assert.strictEqual(cesr.encode("J", raw), "JAy2ealMJMK13t8t2dBs68chWE5id-Edz0vyevo3lSE_");
});
test(`Decode MAAA`, () => {
  const { code, buffer: raw } = cesr.decode("MAAA");

  assert.strictEqual(code, "M");
  assert.deepStrictEqual(raw, new Uint8Array([0, 0]));
});

test(`Encode MAAA`, () => {
  const raw = new Uint8Array([0, 0]);
  assert.strictEqual(cesr.encode("M", raw), "MAAA");
});
test(`Decode MAAB`, () => {
  const { code, buffer: raw } = cesr.decode("MAAB");

  assert.strictEqual(code, "M");
  assert.deepStrictEqual(raw, new Uint8Array([0, 1]));
});

test(`Encode MAAB`, () => {
  const raw = new Uint8Array([0, 1]);
  assert.strictEqual(cesr.encode("M", raw), "MAAB");
});
test(`Decode NP__________`, () => {
  const { code, buffer: raw } = cesr.decode("NP__________");

  assert.strictEqual(code, "N");
  assert.deepStrictEqual(raw, new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]));
});

test(`Encode NP__________`, () => {
  const raw = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]);
  assert.strictEqual(cesr.encode("N", raw), "NP__________");
});
test(`Decode OKhrDthIdZtFUoypyehfolDMCyGZD9iFEk9wbMRECYtx`, () => {
  const { code, buffer: raw } = cesr.decode("OKhrDthIdZtFUoypyehfolDMCyGZD9iFEk9wbMRECYtx");

  assert.strictEqual(code, "O");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      168, 107, 14, 216, 72, 117, 155, 69, 82, 140, 169, 201, 232, 95, 162, 80, 204, 11, 33, 153, 15, 216, 133, 18, 79,
      112, 108, 196, 68, 9, 139, 113,
    ])
  );
});

test(`Encode OKhrDthIdZtFUoypyehfolDMCyGZD9iFEk9wbMRECYtx`, () => {
  const raw = new Uint8Array([
    168, 107, 14, 216, 72, 117, 155, 69, 82, 140, 169, 201, 232, 95, 162, 80, 204, 11, 33, 153, 15, 216, 133, 18, 79,
    112, 108, 196, 68, 9, 139, 113,
  ]);
  assert.strictEqual(cesr.encode("O", raw), "OKhrDthIdZtFUoypyehfolDMCyGZD9iFEk9wbMRECYtx");
});
test(`Decode OLCFxqMz1z1UUS0TEJnvZP_zXHcuYdQsSGBWdOZeY5VQ`, () => {
  const { code, buffer: raw } = cesr.decode("OLCFxqMz1z1UUS0TEJnvZP_zXHcuYdQsSGBWdOZeY5VQ");

  assert.strictEqual(code, "O");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      176, 133, 198, 163, 51, 215, 61, 84, 81, 45, 19, 16, 153, 239, 100, 255, 243, 92, 119, 46, 97, 212, 44, 72, 96,
      86, 116, 230, 94, 99, 149, 80,
    ])
  );
});

test(`Encode OLCFxqMz1z1UUS0TEJnvZP_zXHcuYdQsSGBWdOZeY5VQ`, () => {
  const raw = new Uint8Array([
    176, 133, 198, 163, 51, 215, 61, 84, 81, 45, 19, 16, 153, 239, 100, 255, 243, 92, 119, 46, 97, 212, 44, 72, 96, 86,
    116, 230, 94, 99, 149, 80,
  ]);
  assert.strictEqual(cesr.encode("O", raw), "OLCFxqMz1z1UUS0TEJnvZP_zXHcuYdQsSGBWdOZeY5VQ");
});
test(`Decode PAAqrnvIpC9Hh3qQJ22VoQ5cVD-GJ1Zem8KJik9HuRVT3NXeG304GfxZLImLFmmfebOQqc4pdaO_t5oEDIqPO4Q8vnaX143VUEd-pEps928DZ4njyOvU7y5z8iTo`, () => {
  const { code, buffer: raw } = cesr.decode(
    "PAAqrnvIpC9Hh3qQJ22VoQ5cVD-GJ1Zem8KJik9HuRVT3NXeG304GfxZLImLFmmfebOQqc4pdaO_t5oEDIqPO4Q8vnaX143VUEd-pEps928DZ4njyOvU7y5z8iTo"
  );

  assert.strictEqual(code, "P");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      0, 42, 174, 123, 200, 164, 47, 71, 135, 122, 144, 39, 109, 149, 161, 14, 92, 84, 63, 134, 39, 86, 94, 155, 194,
      137, 138, 79, 71, 185, 21, 83, 220, 213, 222, 27, 125, 56, 25, 252, 89, 44, 137, 139, 22, 105, 159, 121, 179, 144,
      169, 206, 41, 117, 163, 191, 183, 154, 4, 12, 138, 143, 59, 132, 60, 190, 118, 151, 215, 141, 213, 80, 71, 126,
      164, 74, 108, 247, 111, 3, 103, 137, 227, 200, 235, 212, 239, 46, 115, 242, 36, 232,
    ])
  );
});

test(`Encode PAAqrnvIpC9Hh3qQJ22VoQ5cVD-GJ1Zem8KJik9HuRVT3NXeG304GfxZLImLFmmfebOQqc4pdaO_t5oEDIqPO4Q8vnaX143VUEd-pEps928DZ4njyOvU7y5z8iTo`, () => {
  const raw = new Uint8Array([
    0, 42, 174, 123, 200, 164, 47, 71, 135, 122, 144, 39, 109, 149, 161, 14, 92, 84, 63, 134, 39, 86, 94, 155, 194, 137,
    138, 79, 71, 185, 21, 83, 220, 213, 222, 27, 125, 56, 25, 252, 89, 44, 137, 139, 22, 105, 159, 121, 179, 144, 169,
    206, 41, 117, 163, 191, 183, 154, 4, 12, 138, 143, 59, 132, 60, 190, 118, 151, 215, 141, 213, 80, 71, 126, 164, 74,
    108, 247, 111, 3, 103, 137, 227, 200, 235, 212, 239, 46, 115, 242, 36, 232,
  ]);
  assert.strictEqual(
    cesr.encode("P", raw),
    "PAAqrnvIpC9Hh3qQJ22VoQ5cVD-GJ1Zem8KJik9HuRVT3NXeG304GfxZLImLFmmfebOQqc4pdaO_t5oEDIqPO4Q8vnaX143VUEd-pEps928DZ4njyOvU7y5z8iTo"
  );
});
test(`Decode PAFUJKa3k3SHtFcF8e6KIoPv2dYVWddkG3jSkQVxy8gKoTeNisjJ9KvlmhUZZcXrCmgwgldlgU7qhaqZtA7GQ8RJqApaIpg9k7Ee3HtdXHSx56z4ESxdGoJ1Vumx`, () => {
  const { code, buffer: raw } = cesr.decode(
    "PAFUJKa3k3SHtFcF8e6KIoPv2dYVWddkG3jSkQVxy8gKoTeNisjJ9KvlmhUZZcXrCmgwgldlgU7qhaqZtA7GQ8RJqApaIpg9k7Ee3HtdXHSx56z4ESxdGoJ1Vumx"
  );

  assert.strictEqual(code, "P");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      1, 84, 36, 166, 183, 147, 116, 135, 180, 87, 5, 241, 238, 138, 34, 131, 239, 217, 214, 21, 89, 215, 100, 27, 120,
      210, 145, 5, 113, 203, 200, 10, 161, 55, 141, 138, 200, 201, 244, 171, 229, 154, 21, 25, 101, 197, 235, 10, 104,
      48, 130, 87, 101, 129, 78, 234, 133, 170, 153, 180, 14, 198, 67, 196, 73, 168, 10, 90, 34, 152, 61, 147, 177, 30,
      220, 123, 93, 92, 116, 177, 231, 172, 248, 17, 44, 93, 26, 130, 117, 86, 233, 177,
    ])
  );
});

test(`Encode PAFUJKa3k3SHtFcF8e6KIoPv2dYVWddkG3jSkQVxy8gKoTeNisjJ9KvlmhUZZcXrCmgwgldlgU7qhaqZtA7GQ8RJqApaIpg9k7Ee3HtdXHSx56z4ESxdGoJ1Vumx`, () => {
  const raw = new Uint8Array([
    1, 84, 36, 166, 183, 147, 116, 135, 180, 87, 5, 241, 238, 138, 34, 131, 239, 217, 214, 21, 89, 215, 100, 27, 120,
    210, 145, 5, 113, 203, 200, 10, 161, 55, 141, 138, 200, 201, 244, 171, 229, 154, 21, 25, 101, 197, 235, 10, 104, 48,
    130, 87, 101, 129, 78, 234, 133, 170, 153, 180, 14, 198, 67, 196, 73, 168, 10, 90, 34, 152, 61, 147, 177, 30, 220,
    123, 93, 92, 116, 177, 231, 172, 248, 17, 44, 93, 26, 130, 117, 86, 233, 177,
  ]);
  assert.strictEqual(
    cesr.encode("P", raw),
    "PAFUJKa3k3SHtFcF8e6KIoPv2dYVWddkG3jSkQVxy8gKoTeNisjJ9KvlmhUZZcXrCmgwgldlgU7qhaqZtA7GQ8RJqApaIpg9k7Ee3HtdXHSx56z4ESxdGoJ1Vumx"
  );
});
test(`Decode QAli8mDi0Fg-UQI3lZD8ywcorxpkGlWBEFV5ZjdTAr09`, () => {
  const { code, buffer: raw } = cesr.decode("QAli8mDi0Fg-UQI3lZD8ywcorxpkGlWBEFV5ZjdTAr09");

  assert.strictEqual(code, "Q");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      9, 98, 242, 96, 226, 208, 88, 62, 81, 2, 55, 149, 144, 252, 203, 7, 40, 175, 26, 100, 26, 85, 129, 16, 85, 121,
      102, 55, 83, 2, 189, 61,
    ])
  );
});

test(`Encode QAli8mDi0Fg-UQI3lZD8ywcorxpkGlWBEFV5ZjdTAr09`, () => {
  const raw = new Uint8Array([
    9, 98, 242, 96, 226, 208, 88, 62, 81, 2, 55, 149, 144, 252, 203, 7, 40, 175, 26, 100, 26, 85, 129, 16, 85, 121, 102,
    55, 83, 2, 189, 61,
  ]);
  assert.strictEqual(cesr.encode("Q", raw), "QAli8mDi0Fg-UQI3lZD8ywcorxpkGlWBEFV5ZjdTAr09");
});
test(`Decode QBo3QGanDTgKCPJqyuAqC2bgTEcwgdT8-cQpCGSKmxrq`, () => {
  const { code, buffer: raw } = cesr.decode("QBo3QGanDTgKCPJqyuAqC2bgTEcwgdT8-cQpCGSKmxrq");

  assert.strictEqual(code, "Q");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([
      26, 55, 64, 102, 167, 13, 56, 10, 8, 242, 106, 202, 224, 42, 11, 102, 224, 76, 71, 48, 129, 212, 252, 249, 196,
      41, 8, 100, 138, 155, 26, 234,
    ])
  );
});

test(`Encode QBo3QGanDTgKCPJqyuAqC2bgTEcwgdT8-cQpCGSKmxrq`, () => {
  const raw = new Uint8Array([
    26, 55, 64, 102, 167, 13, 56, 10, 8, 242, 106, 202, 224, 42, 11, 102, 224, 76, 71, 48, 129, 212, 252, 249, 196, 41,
    8, 100, 138, 155, 26, 234,
  ]);
  assert.strictEqual(cesr.encode("Q", raw), "QBo3QGanDTgKCPJqyuAqC2bgTEcwgdT8-cQpCGSKmxrq");
});
test(`Decode RAAAAQAA`, () => {
  const { code, buffer: raw } = cesr.decode("RAAAAQAA");

  assert.strictEqual(code, "R");
  assert.deepStrictEqual(raw, new Uint8Array([0, 0, 1, 0, 0]));
});

test(`Encode RAAAAQAA`, () => {
  const raw = new Uint8Array([0, 0, 1, 0, 0]);
  assert.strictEqual(cesr.encode("R", raw), "RAAAAQAA");
});
test(`Decode RP______`, () => {
  const { code, buffer: raw } = cesr.decode("RP______");

  assert.strictEqual(code, "R");
  assert.deepStrictEqual(raw, new Uint8Array([255, 255, 255, 255, 255]));
});

test(`Encode RP______`, () => {
  const raw = new Uint8Array([255, 255, 255, 255, 255]);
  assert.strictEqual(cesr.encode("R", raw), "RP______");
});
test(`Decode SP______________`, () => {
  const { code, buffer: raw } = cesr.decode("SP______________");

  assert.strictEqual(code, "S");
  assert.deepStrictEqual(raw, new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]));
});

test(`Encode SP______________`, () => {
  const raw = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
  assert.strictEqual(cesr.encode("S", raw), "SP______________");
});
test(`Decode TP__________________`, () => {
  const { code, buffer: raw } = cesr.decode("TP__________________");

  assert.strictEqual(code, "T");
  assert.deepStrictEqual(raw, new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]));
});

test(`Encode TP__________________`, () => {
  const raw = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
  assert.strictEqual(cesr.encode("T", raw), "TP__________________");
});
test(`Decode UAEAAAAAAAAAAAAAAAAAAAAA`, () => {
  const { code, buffer: raw } = cesr.decode("UAEAAAAAAAAAAAAAAAAAAAAA");

  assert.strictEqual(code, "U");
  assert.deepStrictEqual(raw, new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
});

test(`Encode UAEAAAAAAAAAAAAAAAAAAAAA`, () => {
  const raw = new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.strictEqual(cesr.encode("U", raw), "UAEAAAAAAAAAAAAAAAAAAAAA");
});
test(`Decode UP______________________`, () => {
  const { code, buffer: raw } = cesr.decode("UP______________________");

  assert.strictEqual(code, "U");
  assert.deepStrictEqual(
    raw,
    new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255])
  );
});

test(`Encode UP______________________`, () => {
  const raw = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
  assert.strictEqual(cesr.encode("U", raw), "UP______________________");
});
test(`Decode VAAq`, () => {
  const { code, buffer: raw } = cesr.decode("VAAq");

  assert.strictEqual(code, "V");
  assert.deepStrictEqual(raw, new Uint8Array([42]));
});

test(`Encode VAAq`, () => {
  const raw = new Uint8Array([42]);
  assert.strictEqual(cesr.encode("V", raw), "VAAq");
});
test(`Decode WEAm`, () => {
  const { code, buffer: raw } = cesr.decode("WEAm");

  assert.strictEqual(code, "W");
  assert.deepStrictEqual(raw, new Uint8Array([64, 38]));
});

test(`Encode WEAm`, () => {
  const raw = new Uint8Array([64, 38]);
  assert.strictEqual(cesr.encode("W", raw), "WEAm");
});
