#!/usr/bin/env python
from random import randbytes, randint
from keri.core.coring import MtrDex, Matter, Versionage, Vrsn_1_0, Vrsn_2_0
from keri.core.indexing import IdrDex, Indexer, IdxCrtSigDex, IdxBthSigDex
from keri.core.counting import CtrDex_1_0, CtrDex_2_0, Counter

from json import dumps

Vrsn_1_0 = Versionage(major=1, minor=0)  # KERI Protocol Version Specific

cases = []
for key in dir(MtrDex):
    if key.startswith("TBD"):
        continue

    if key.startswith("Tag"):
        continue

    if not key.startswith("__"):
        code = getattr(MtrDex, key)

        sizes = Matter.Sizes.get(code)

        raw_size = (
            sizes.fs - sizes.hs
            if sizes.fs is not None
            else (randint(1, 10) * 3 - sizes.ls)
        )

        raw = randbytes(raw_size)
        matter = Matter(code=code, raw=raw)

        cases.append(
            {
                "code": code,
                "name": key,
                "type": "matter",
                "raw": matter.raw.hex(),
                "qb64": matter.qb64,
                "qb2": matter.qb2.hex(),
            }
        )


for key in dir(IdrDex):
    if key.startswith("TBD"):
        continue

    if not key.startswith("__"):
        code = getattr(IdrDex, key)

        sizes = Indexer.Sizes.get(code)
        raw_size = sizes.hs if sizes.fs is None else sizes.fs - sizes.hs

        raw = randbytes(raw_size)

        soft_size = sizes.ss or 0
        other_size = sizes.os or 0
        index = randint(0, (64** (soft_size - other_size)) - 1)
        ondex = randint(0, (64** other_size) - 1) if code in IdxBthSigDex and other_size > 0 else None

        indexer = Indexer(code=code, raw=raw, index=index, ondex=ondex)

        cases.append(
            {
                "code": code,
                "name": key,
                "type": "indexer",
                "index": indexer.index,
                "ondex": indexer.ondex,
                "raw": indexer.raw.hex(),
                "qb64": indexer.qb64,
                "qb2": indexer.qb2.hex(),
            }
        )

for key in dir(CtrDex_1_0):
    if key.startswith("TBD"):
        continue

    if not key.startswith("__"):
        code = getattr(CtrDex_1_0, key)

        sizes = Counter.Sizes.get(1).get(0).get(code)
        raw_size = sizes.hs if sizes.fs is None else sizes.fs - sizes.hs

        raw = randbytes(raw_size)
        count = randint(0, 10)

        counter = Counter(code=code, raw=raw, count=count, gvrsn=Vrsn_1_0)

        cases.append(
            {
                "code": code,
                "name": key,
                "type": "counter_10",
                "count": counter.count,
                "qb64": counter.qb64,
                "qb2": counter.qb2.hex(),
            }
        )

for key in dir(CtrDex_2_0):
    if key.startswith("TBD"):
        continue

    if not key.startswith("__"):
        code = getattr(CtrDex_2_0, key)

        sizes = Counter.Sizes.get(2).get(0).get(code)
        raw_size = sizes.hs if sizes.fs is None else sizes.fs - sizes.hs

        raw = randbytes(raw_size)
        count = randint(0, 10)

        counter = Counter(code=code, raw=raw, count=count, gvrsn=Vrsn_2_0)

        cases.append(
            {
                "code": code,
                "name": key,
                "type": "counter_20",
                "count": counter.count,
                "qb64": counter.qb64,
                "qb2": counter.qb2.hex(),
            }
        )


print(dumps(cases, indent=2))
