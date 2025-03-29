# CESR

This is a work in progress JavaScript implementation of [Composable Event Stream Representation](https://github.com/trustoverip/tswg-cesr-specification).

This package is currently not intended for any real world use case. It has been implemented for learning purposes.

# Usage

Install using npm

```bash
npm install cesr
```

Example usage that fetches and then parses a KERI OOBI stream:

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

# Features

- [x] Simple parsing of KERI CESR Stream
- [ ] API for encoding/decoding primitives
- [ ] Cryptographic verification of CESR Stream
- [ ] ...
