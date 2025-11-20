// @ts-check
import { parse } from "../cesr/package/dist/__main__.js";

const url = new URL("/lenkan/cesr-js/refs/heads/main/fixtures/geda.cesr", "https://raw.githubusercontent.com");
const response = await fetch(url);

if (response.body) {
  for await (const message of parse(response.body)) {
    console.log(
      JSON.stringify({
        payload: message.body.payload,
        attachments: message.attachments.frames(),
      }),
    );
  }
}
