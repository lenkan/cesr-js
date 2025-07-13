#!/usr/bin/env python
import random
import json
from keri.core.coring import Matter, Dater, Bexter, MtrDex, Vrsn_1_0, Vrsn_2_0
from keri.core.indexing import Indexer, IdrDex, IdxBthSigDex
from keri.core.counting import Counter, CtrDex_1_0, CtrDex_2_0


cases = []


def append(matter: Matter | Indexer | Counter):
    if isinstance(matter, Matter):
        type = "matter"
    elif isinstance(matter, Indexer):
        type = "indexer"
    elif isinstance(matter, Counter):
        if matter.version == Vrsn_1_0:
            type = "counter_10"
        elif matter.version == Vrsn_2_0:
            type = "counter_20"
        else:
            raise ValueError(f"Unknown counter version: {matter.gvrsn}")

    cases.append(
        {
            "code": matter.code,
            "name": matter.name,
            "type": type,
            "raw": matter.raw.hex() if hasattr(matter, "raw") else "",
            "soft": getattr(matter, "soft", None),
            "index": getattr(matter, "index", None),
            "ondex": getattr(matter, "ondex", None),
            "count": getattr(matter, "count", None),
            "qb64": matter.qb64,
            "qb2": matter.qb2.hex(),
        }
    )


random.seed(0)
for key in dir(MtrDex):
    if (
        key.startswith("_")
        or key.startswith("GramHead")
        or key.startswith("Tag")
        or key.startswith("TBD")
    ):
        continue

    code = getattr(MtrDex, key)
    size = Matter.Sizes.get(code)

    if key == "DateTime":
        append(Dater(dts="2022-01-20T12:57:59.823350+00:00"))
        continue

    if size.fs is not None:
        raw_size = int((size.fs - size.hs - size.ss - size.ls) * 6 / 8)
    else:
        raw_size = int((random.randint(1, 10) * 3 - size.ls) * 6 / 8)

    append(Matter(code=code, raw=bytes(raw_size)))
    append(Matter(code=code, raw=random.randbytes(raw_size)))


random.seed(0)
for key in dir(IdrDex):
    if key.startswith("__") or key.startswith("TBD"):
        continue

    code = getattr(IdrDex, key)
    size = Indexer.Sizes.get(code)

    index = random.randint(0, 10)
    ondex = random.randint(0, 10) if key in IdxBthSigDex else None

    raw_size = int((size.fs - size.hs - size.ss - size.ls) * 6 / 8)
    raw = random.randbytes(raw_size)

    append(
        Indexer(
            code=code,
            raw=bytes(raw_size),
            index=0,
            ondex=None if key in IdxBthSigDex else None,
        )
    )
    append(Indexer(code=code, raw=random.randbytes(raw_size), index=index, ondex=ondex))

random.seed(0)
for key in dir(CtrDex_1_0):
    if key.startswith("__") or key.startswith("TBD"):
        continue

    code = getattr(CtrDex_1_0, key)
    size = Counter.Sizes.get(1).get(0).get(code)
    append(Counter(code=code, count=0, gvrsn=Vrsn_1_0))
    append(Counter(code=code, count=random.randint(0, 64**size.ss - 1), gvrsn=Vrsn_1_0))
    append(Counter(code=code, count=64**size.ss - 1, gvrsn=Vrsn_1_0))

random.seed(0)
for key in dir(CtrDex_2_0):
    if key.startswith("__") or key.startswith("TBD"):
        continue

    code = getattr(CtrDex_2_0, key)
    size = Counter.Sizes.get(2).get(0).get(code)

    append(Counter(code=code, count=0, gvrsn=Vrsn_2_0))
    append(Counter(code=code, count=random.randint(0, 64**size.ss - 1), gvrsn=Vrsn_2_0))
    append(Counter(code=code, count=64**size.ss - 1, gvrsn=Vrsn_2_0))


print(json.dumps(cases, indent=2))
