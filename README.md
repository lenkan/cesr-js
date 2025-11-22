# CESR-JS

[![NPM Version](https://img.shields.io/npm/v/cesr.svg?style=flat)](https://www.npmjs.com/package/cesr)
[![NPM License](https://img.shields.io/npm/l/cesr.svg?style=flat)](https://github.com/lenkan/cesr-js/blob/main/LICENSE)
[![CI](https://github.com/lenkan/cesr-js/actions/workflows/ci.yaml/badge.svg)](https://github.com/lenkan/cesr-js/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/lenkan/cesr-js/branch/main/graph/badge.svg)](https://codecov.io/gh/lenkan/cesr-js)
[![Documentation](https://img.shields.io/badge/documentation-green)](https://lenkan.dev/cesr-js)

A JavaScript/TypeScript implementation of [Composable Event Stream Representation (CESR)](https://github.com/trustoverip/tswg-cesr-specification) for parsing and processing cryptographic event streams.

> **⚠️ Work in Progress**: This package is currently under development and not intended for production use.

## 📖 Documentation

- **[API Reference](https://lenkan.dev/cesr-js)** - Complete API documentation

## 🚀 Installation

```bash
npm install cesr
```

## 📋 Usage

Install using npm

```bash
npm install cesr
```

### Basic Example

Parse a CESR stream from a URL:

```typescript
import { parse } from "cesr";

const url = new URL("/lenkan/cesr-js/refs/heads/main/fixtures/geda.cesr", "https://raw.githubusercontent.com");
const response = await fetch(url);

if (response.body) {
  for await (const message of parse(response.body)) {
    console.log(message);
  }
}
```

## 🖥️ Command Line Interface

Install globally to use the CLI:

```bash
npm install -g cesr
```

### CLI Usage

```bash
# Show help
cesr --help

# Parse a CESR file from a URL
cesr https://raw.githubusercontent.com/lenkan/cesr-js/refs/heads/main/fixtures/geda.cesr

# Parse from stdin with pretty printing
curl https://example.com/stream.cesr | cesr --pretty -

# Parse a local file
cesr ./path/to/file.cesr
```

## ✨ Features

- ✅ **CESR Frame Parsing** - Complete support for CESR primitive parsing
- ✅ **JSON Messages** - Parse embedded JSON messages in streams
- ✅ **Streaming Support** - Process data incrementally as it arrives
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Command Line Tool** - Parse CESR streams from command line
- ⏳ **MSGPACK Messages** - Coming soon
- ⏳ **CBOR Messages** - Coming soon
- 🔧 **Encoding/Decoding API** - Available from `cesr/__unstable__` (experimental)

## 🤝 Contributing

This project is open source and contributions are welcome! Please feel free to:

- Report bugs or issues
- Suggest new features

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.
