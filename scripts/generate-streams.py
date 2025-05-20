#!/usr/bin/env python
from keri.core.coring import (
    MtrDex,
    Vrsn_2_0,
    Diger,
)
from keri.core.eventing import messagize, incept, interact
from keri.core.signing import Signer
from keri.core.serdering import SerderKERI, Kinds

keys0 = [Signer(code=MtrDex.Ed25519_Seed, transferable=True)]
keys1 = [Signer(code=MtrDex.Ed25519_Seed, transferable=True)]

inception: SerderKERI = incept(
    keys=[s.verfer.qb64 for s in keys0],
    ndigs=[Diger(code=MtrDex.Blake3_256, ser=s.verfer.raw).qb64 for s in keys1],
    version=Vrsn_2_0,
    kind=Kinds.json,
)

interaction = interact(
    pre=inception.pre, dig=inception.said, sn=1, version=Vrsn_2_0, kind=Kinds.json
)

message = bytearray()

# NOTE: gvrsn needs to be added to messagize function in keripy for this
# NOTE: currently messagize does not correctly set count for 2.0 counters, it should count quadlets, not frames
message.extend(
    messagize(
        serder=inception,
        sigers=[s.sign(inception.raw, 0) for s in keys0],
        # version=Vrsn_2_0,
        pipelined=True,
    )
)
message.extend(
    messagize(
        serder=interaction,
        sigers=[s.sign(interaction.raw, 0) for s in keys1],
        # gvrsn=Vrsn_2_0,
        pipelined=True,
    )
)

print(message.decode("utf-8"))
