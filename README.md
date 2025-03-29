# CESR

This is a work in progress JavaScript implementation of [Composable Event Stream Representation](https://github.com/trustoverip/tswg-cesr-specification).

# Usage

Install using npm

```bash
npm install cesr
```

```typescript
// @ts-check
import { parse } from "cesr";

const url = new URL("/lenkan/cesr-js/refs/heads/main/fixtures/geda.cesr", "https://raw.githubusercontent.com");
const response = await fetch(url);

if (response.body) {
  for await (const message of parse(response.body)) {
    console.log(message.payload);
    console.log(message.attachments);
  }
}
```
