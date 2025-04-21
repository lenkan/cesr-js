// @ts-check
import { parse } from "../cesr/package/dist/main.js";

const url = new URL("/lenkan/cesr-js/refs/heads/main/fixtures/geda.cesr", "https://raw.githubusercontent.com");
const response = await fetch(url);

if (response.body) {
  for await (const frame of parse(response.body)) {
    console.log(frame);
  }
}
