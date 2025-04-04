// THIS FILE IS AUTO-GENERATED
// DO NOT EDIT THIS FILE DIRECTLY
// Use scripts/generate-codec.py to generate this file
export interface MatterCodeSize {
  hs: number;
  fs: number | null;
  ss: number;
  xs: number;
  ls: number;
}
export interface IndexerCodeSize {
  hs: number;
  fs: number | null;
  ss: number;
  os: number;
  ls: number;
}
export interface CounterCodeSize {
  hs: number;
  fs: number;
  ss: number;
}
export const MatterCode = {
  Big: "N",
  Blake2b_256: "F",
  Blake2b_512: "0E",
  Blake2s_256: "G",
  Blake3_256: "E",
  Blake3_512: "0D",
  Blind: "Z",
  Bytes_Big_L0: "7AAB",
  Bytes_Big_L1: "8AAB",
  Bytes_Big_L2: "9AAB",
  Bytes_L0: "4B",
  Bytes_L1: "5B",
  Bytes_L2: "6B",
  DateTime: "1AAG",
  ECDSA_256k1: "1AAB",
  ECDSA_256k1N: "1AAA",
  ECDSA_256k1_Seed: "J",
  ECDSA_256k1_Sig: "0C",
  ECDSA_256r1: "1AAJ",
  ECDSA_256r1N: "1AAI",
  ECDSA_256r1_Seed: "Q",
  ECDSA_256r1_Sig: "0I",
  Ed25519: "D",
  Ed25519N: "B",
  Ed25519_Seed: "A",
  Ed25519_Sig: "0B",
  Ed448: "1AAD",
  Ed448N: "1AAC",
  Ed448_Seed: "K",
  Ed448_Sig: "1AAE",
  Great: "T",
  Label1: "V",
  Label2: "W",
  Large: "S",
  Long: "0H",
  No: "1AAL",
  Null: "1AAK",
  SHA2_256: "I",
  SHA2_512: "0G",
  SHA3_256: "H",
  SHA3_512: "0F",
  Salt_128: "0A",
  Short: "M",
  StrB64_Big_L0: "7AAA",
  StrB64_Big_L1: "8AAA",
  StrB64_Big_L2: "9AAA",
  StrB64_L0: "4A",
  StrB64_L1: "5A",
  StrB64_L2: "6A",
  TBD0: "1___",
  TBD0S: "1__-",
  TBD1: "2___",
  TBD1S: "2__-",
  TBD2: "3___",
  TBD2S: "3__-",
  Tag1: "0J",
  Tag10: "0O",
  Tag2: "0K",
  Tag3: "X",
  Tag4: "1AAF",
  Tag5: "0L",
  Tag6: "0M",
  Tag7: "Y",
  Tag8: "1AAN",
  Tag9: "0N",
  Tall: "R",
  Vast: "U",
  X25519: "C",
  X25519_Cipher_Big_L0: "7AAC",
  X25519_Cipher_Big_L1: "8AAC",
  X25519_Cipher_Big_L2: "9AAC",
  X25519_Cipher_L0: "4C",
  X25519_Cipher_L1: "5C",
  X25519_Cipher_L2: "6C",
  X25519_Cipher_QB2_Big_L0: "7AAE",
  X25519_Cipher_QB2_Big_L1: "8AAE",
  X25519_Cipher_QB2_Big_L2: "9AAE",
  X25519_Cipher_QB2_L0: "4E",
  X25519_Cipher_QB2_L1: "5E",
  X25519_Cipher_QB2_L2: "6E",
  X25519_Cipher_QB64_Big_L0: "7AAD",
  X25519_Cipher_QB64_Big_L1: "8AAD",
  X25519_Cipher_QB64_Big_L2: "9AAD",
  X25519_Cipher_QB64_L0: "4D",
  X25519_Cipher_QB64_L1: "5D",
  X25519_Cipher_QB64_L2: "6D",
  X25519_Cipher_Salt: "1AAH",
  X25519_Cipher_Seed: "P",
  X25519_Private: "O",
  X448: "L",
  Yes: "1AAM",
};
export const IndexCode = {
  ECDSA_256k1_Big_Crt_Sig: "2D",
  ECDSA_256k1_Big_Sig: "2C",
  ECDSA_256k1_Crt_Sig: "D",
  ECDSA_256k1_Sig: "C",
  ECDSA_256r1_Big_Crt_Sig: "2F",
  ECDSA_256r1_Big_Sig: "2E",
  ECDSA_256r1_Crt_Sig: "F",
  ECDSA_256r1_Sig: "E",
  Ed25519_Big_Crt_Sig: "2B",
  Ed25519_Big_Sig: "2A",
  Ed25519_Crt_Sig: "B",
  Ed25519_Sig: "A",
  Ed448_Big_Crt_Sig: "3B",
  Ed448_Big_Sig: "3A",
  Ed448_Crt_Sig: "0B",
  Ed448_Sig: "0A",
  TBD0: "0z",
  TBD1: "1z",
  TBD4: "4z",
};
export const CountCode_10 = {
  AttachmentGroup: "-V",
  BigAttachmentGroup: "-0V",
  BigPathedMaterialGroup: "-0L",
  ControllerIdxSigs: "-A",
  ESSRPayloadGroup: "-Z",
  FirstSeenReplayCouples: "-E",
  KERIACDCGenusVersion: "--AAA",
  NonTransReceiptCouples: "-C",
  PathedMaterialGroup: "-L",
  RootSadPathSigGroups: "-K",
  SadPathSigGroups: "-J",
  SealSourceCouples: "-G",
  SealSourceTriples: "-I",
  TransIdxSigGroups: "-F",
  TransLastIdxSigGroups: "-H",
  TransReceiptQuadruples: "-D",
  WitnessIdxSigs: "-B",
};
export const CountCode_20 = {
  AttachmentGroup: "-C",
  BackerRegistrarSealCouples: "-X",
  BigAttachmentGroup: "-0C",
  BigBackerRegistrarSealCouples: "-0X",
  BigControllerIdxSigs: "-0J",
  BigDatagramSegmentGroup: "-0D",
  BigDigestSealSingles: "-0V",
  BigESSRPayloadGroup: "-0Z",
  BigESSRWrapperGroup: "-0E",
  BigFirstSeenReplayCouples: "-0N",
  BigFixedMessageBodyGroup: "-0F",
  BigGenericGroup: "-0A",
  BigGenericListGroup: "-0I",
  BigGenericMapGroup: "-0H",
  BigMapMessageBodyGroup: "-0G",
  BigMerkleRootSealSingles: "-0W",
  BigMessageGroup: "-0B",
  BigNonTransReceiptCouples: "-0L",
  BigPathedMaterialGroup: "-0S",
  BigRootSadPathSigGroups: "-0U",
  BigSadPathSigGroups: "-0T",
  BigSealSourceCouples: "-0Q",
  BigSealSourceLastSingles: "-0Y",
  BigSealSourceTriples: "-0R",
  BigTransIdxSigGroups: "-0O",
  BigTransLastIdxSigGroups: "-0P",
  BigTransReceiptQuadruples: "-0M",
  BigWitnessIdxSigs: "-0K",
  ControllerIdxSigs: "-J",
  DatagramSegmentGroup: "-D",
  DigestSealSingles: "-V",
  ESSRPayloadGroup: "-Z",
  ESSRWrapperGroup: "-E",
  FirstSeenReplayCouples: "-N",
  FixedMessageBodyGroup: "-F",
  GenericGroup: "-A",
  GenericListGroup: "-I",
  GenericMapGroup: "-H",
  KERIACDCGenusVersion: "--AAA",
  MapMessageBodyGroup: "-G",
  MerkleRootSealSingles: "-W",
  MessageGroup: "-B",
  NonTransReceiptCouples: "-L",
  PathedMaterialGroup: "-S",
  RootSadPathSigGroups: "-U",
  SadPathSigGroups: "-T",
  SealSourceCouples: "-Q",
  SealSourceLastSingles: "-Y",
  SealSourceTriples: "-R",
  TransIdxSigGroups: "-O",
  TransLastIdxSigGroups: "-P",
  TransReceiptQuadruples: "-M",
  WitnessIdxSigs: "-K",
};
export const MatterSize: Record<string, MatterCodeSize> = {
  N: {
    hs: 1,
    fs: 12,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  F: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0E": {
    hs: 2,
    fs: 88,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  G: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  E: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0D": {
    hs: 2,
    fs: 88,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  Z: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "7AAB": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 0,
  },
  "8AAB": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 1,
  },
  "9AAB": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 2,
  },
  "4B": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 0,
  },
  "5B": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 1,
  },
  "6B": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 2,
  },
  "1AAG": {
    hs: 4,
    fs: 36,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAB": {
    hs: 4,
    fs: 48,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAA": {
    hs: 4,
    fs: 48,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  J: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0C": {
    hs: 2,
    fs: 88,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAJ": {
    hs: 4,
    fs: 48,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAI": {
    hs: 4,
    fs: 48,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  Q: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0I": {
    hs: 2,
    fs: 88,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  D: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  B: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  A: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0B": {
    hs: 2,
    fs: 88,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAD": {
    hs: 4,
    fs: 80,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAC": {
    hs: 4,
    fs: 80,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  K: {
    hs: 1,
    fs: 76,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAE": {
    hs: 4,
    fs: 56,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  T: {
    hs: 1,
    fs: 20,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  V: {
    hs: 1,
    fs: 4,
    ss: 0,
    xs: 0,
    ls: 1,
  },
  W: {
    hs: 1,
    fs: 4,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  S: {
    hs: 1,
    fs: 16,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0H": {
    hs: 2,
    fs: 8,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAL": {
    hs: 4,
    fs: 4,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAK": {
    hs: 4,
    fs: 4,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  I: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0G": {
    hs: 2,
    fs: 88,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  H: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0F": {
    hs: 2,
    fs: 88,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "0A": {
    hs: 2,
    fs: 24,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  M: {
    hs: 1,
    fs: 4,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "7AAA": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 0,
  },
  "8AAA": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 1,
  },
  "9AAA": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 2,
  },
  "4A": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 0,
  },
  "5A": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 1,
  },
  "6A": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 2,
  },
  "1___": {
    hs: 4,
    fs: 8,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1__-": {
    hs: 4,
    fs: 12,
    ss: 2,
    xs: 0,
    ls: 0,
  },
  "2___": {
    hs: 4,
    fs: 8,
    ss: 0,
    xs: 0,
    ls: 1,
  },
  "2__-": {
    hs: 4,
    fs: 12,
    ss: 2,
    xs: 1,
    ls: 1,
  },
  "3___": {
    hs: 4,
    fs: 8,
    ss: 0,
    xs: 0,
    ls: 2,
  },
  "3__-": {
    hs: 4,
    fs: 12,
    ss: 2,
    xs: 0,
    ls: 2,
  },
  "0J": {
    hs: 2,
    fs: 4,
    ss: 2,
    xs: 1,
    ls: 0,
  },
  "0O": {
    hs: 2,
    fs: 12,
    ss: 10,
    xs: 0,
    ls: 0,
  },
  "0K": {
    hs: 2,
    fs: 4,
    ss: 2,
    xs: 0,
    ls: 0,
  },
  X: {
    hs: 1,
    fs: 4,
    ss: 3,
    xs: 0,
    ls: 0,
  },
  "1AAF": {
    hs: 4,
    fs: 8,
    ss: 4,
    xs: 0,
    ls: 0,
  },
  "0L": {
    hs: 2,
    fs: 8,
    ss: 6,
    xs: 1,
    ls: 0,
  },
  "0M": {
    hs: 2,
    fs: 8,
    ss: 6,
    xs: 0,
    ls: 0,
  },
  Y: {
    hs: 1,
    fs: 8,
    ss: 7,
    xs: 0,
    ls: 0,
  },
  "1AAN": {
    hs: 4,
    fs: 12,
    ss: 8,
    xs: 0,
    ls: 0,
  },
  "0N": {
    hs: 2,
    fs: 12,
    ss: 10,
    xs: 1,
    ls: 0,
  },
  R: {
    hs: 1,
    fs: 8,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  U: {
    hs: 1,
    fs: 24,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  C: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "7AAC": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 0,
  },
  "8AAC": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 1,
  },
  "9AAC": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 2,
  },
  "4C": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 0,
  },
  "5C": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 1,
  },
  "6C": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 2,
  },
  "7AAE": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 0,
  },
  "8AAE": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 1,
  },
  "9AAE": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 2,
  },
  "4E": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 0,
  },
  "5E": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 1,
  },
  "6E": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 2,
  },
  "7AAD": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 0,
  },
  "8AAD": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 1,
  },
  "9AAD": {
    hs: 4,
    fs: null,
    ss: 4,
    xs: 0,
    ls: 2,
  },
  "4D": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 0,
  },
  "5D": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 1,
  },
  "6D": {
    hs: 2,
    fs: null,
    ss: 2,
    xs: 0,
    ls: 2,
  },
  "1AAH": {
    hs: 4,
    fs: 100,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  P: {
    hs: 1,
    fs: 124,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  O: {
    hs: 1,
    fs: 44,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  L: {
    hs: 1,
    fs: 76,
    ss: 0,
    xs: 0,
    ls: 0,
  },
  "1AAM": {
    hs: 4,
    fs: 4,
    ss: 0,
    xs: 0,
    ls: 0,
  },
};
export const IndexerSize: Record<string, IndexerCodeSize> = {
  "2D": {
    hs: 2,
    fs: 92,
    ss: 4,
    os: 2,
    ls: 0,
  },
  "2C": {
    hs: 2,
    fs: 92,
    ss: 4,
    os: 2,
    ls: 0,
  },
  D: {
    hs: 1,
    fs: 88,
    ss: 1,
    os: 0,
    ls: 0,
  },
  C: {
    hs: 1,
    fs: 88,
    ss: 1,
    os: 0,
    ls: 0,
  },
  "2F": {
    hs: 2,
    fs: 92,
    ss: 4,
    os: 2,
    ls: 0,
  },
  "2E": {
    hs: 2,
    fs: 92,
    ss: 4,
    os: 2,
    ls: 0,
  },
  F: {
    hs: 1,
    fs: 88,
    ss: 1,
    os: 0,
    ls: 0,
  },
  E: {
    hs: 1,
    fs: 88,
    ss: 1,
    os: 0,
    ls: 0,
  },
  "2B": {
    hs: 2,
    fs: 92,
    ss: 4,
    os: 2,
    ls: 0,
  },
  "2A": {
    hs: 2,
    fs: 92,
    ss: 4,
    os: 2,
    ls: 0,
  },
  B: {
    hs: 1,
    fs: 88,
    ss: 1,
    os: 0,
    ls: 0,
  },
  A: {
    hs: 1,
    fs: 88,
    ss: 1,
    os: 0,
    ls: 0,
  },
  "3B": {
    hs: 2,
    fs: 160,
    ss: 6,
    os: 3,
    ls: 0,
  },
  "3A": {
    hs: 2,
    fs: 160,
    ss: 6,
    os: 3,
    ls: 0,
  },
  "0B": {
    hs: 2,
    fs: 156,
    ss: 2,
    os: 1,
    ls: 0,
  },
  "0A": {
    hs: 2,
    fs: 156,
    ss: 2,
    os: 1,
    ls: 0,
  },
  "0z": {
    hs: 2,
    fs: null,
    ss: 2,
    os: 0,
    ls: 0,
  },
  "1z": {
    hs: 2,
    fs: 76,
    ss: 2,
    os: 1,
    ls: 1,
  },
  "4z": {
    hs: 2,
    fs: 80,
    ss: 6,
    os: 3,
    ls: 1,
  },
};
export const CounterSize_10: Record<string, CounterCodeSize> = {
  "-V": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-0V": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0L": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-A": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-Z": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-E": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "--AAA": {
    hs: 5,
    fs: 8,
    ss: 3,
  },
  "-C": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-L": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-K": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-J": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-G": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-I": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-F": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-H": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-D": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-B": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
};
export const CounterSize_20: Record<string, CounterCodeSize> = {
  "-C": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-X": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-0C": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0X": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0J": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0D": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0V": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0Z": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0E": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0N": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0F": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0A": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0I": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0H": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0G": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0W": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0B": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0L": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0S": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0U": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0T": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0Q": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0Y": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0R": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0O": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0P": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0M": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-0K": {
    hs: 3,
    fs: 8,
    ss: 5,
  },
  "-J": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-D": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-V": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-Z": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-E": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-N": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-F": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-A": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-I": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-H": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "--AAA": {
    hs: 5,
    fs: 8,
    ss: 3,
  },
  "-G": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-W": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-B": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-L": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-S": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-U": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-T": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-Q": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-Y": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-R": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-O": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-P": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-M": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
  "-K": {
    hs: 2,
    fs: 4,
    ss: 2,
  },
};
