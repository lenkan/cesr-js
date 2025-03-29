# CESR

This is a work in progress JavaScript implementation of [Composable Event Stream Representation](https://github.com/trustoverip/tswg-cesr-specification).

# Usage

Install using npm

```bash
npm install cesr
```

```typescript
import { parse } from "cesr";

const response = await fetch("http://65.21.253.212:5623/oobi/EINmHd5g7iV-UldkkkKyBIH052bIyxZNBn9pq-zNrYoS");

for await (const message of parse(response)) {
  console.log(message.payload);
  console.log(message.attachments);
}
```
