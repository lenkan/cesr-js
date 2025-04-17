#!/bin/bash
set -e

docker compose up --wait

issuer="test_$(hexdump -vn4 -e'4/4 "%08x" 1 "\n"' /dev/urandom | xargs)"
holder="test_$(hexdump -vn4 -e'4/4 "%08x" 1 "\n"' /dev/urandom | xargs)"
kli init --name "$issuer" --nopasscode
kli init --name "$holder" --nopasscode

kli oobi resolve --name "$holder" --oobi "http://localhost:7723/oobi/EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao"
kli oobi resolve --name "$issuer" --oobi "http://localhost:7723/oobi/EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao"
kli oobi resolve --name "$holder" --oobi "http://localhost:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha/controller"
kli oobi resolve --name "$issuer" --oobi "http://localhost:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha/controller"

kli incept --name "$issuer" --alias "$issuer" \
    --isith 1 \
    --icount 1 \
    --nsith 1 \
    --ncount 1 \
    --transferable \
    --wits BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha \
    --toad 1

kli incept --name "$holder" --alias "$holder" \
    --isith 1 \
    --icount 1 \
    --nsith 1 \
    --ncount 1 \
    --transferable \
    --wits BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha \
    --toad 1

holder_oobis=$(kli oobi generate --name "$holder" --role witness)
issuer_oobis=$(kli oobi generate --name "$issuer" --role witness)

kli oobi resolve --name "$issuer" --oobi "$(echo "$holder_oobis" | head -n1)"
kli oobi resolve --name "$holder" --oobi "$(echo "$issuer_oobis" | head -n1)"

kli vc registry incept --name "$issuer" --alias "$issuer"
registry_said=$(kli vc registry list --name "$issuer" | grep "^$issuer" | cut -d':' -f2 | xargs)
echo "Registry SAID: $registry_said" 1>&2

issuer_aid=$(kli aid --name "$issuer" --alias "$issuer")
echo "Issuer AID: $issuer_aid" 1>&2

holder_aid=$(kli aid --name "$holder" --alias "$holder")
echo "Holder AID: $holder_aid" 1>&2

credential_data_file=$(mktemp)
cat << EOF > "$credential_data_file"
{
    "d": "",
    "i": "$holder_aid",
    "dt": "$(kli time)",
    "LEI": "123123123"
}
EOF
kli saidify --file "$credential_data_file" 1>&2

credential_file=$(mktemp)
cat << EOF > "$credential_file"
{
    "v": "ACDC10JSON000000_",
    "d": "",
    "i": "$issuer_aid",
    "ri": "$registry_said",
    "s": "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    "a": $(cat "$credential_data_file"),
    "r": {
        "d": "EGZ97EjPSINR-O-KHDN_uw4fdrTxeuRXrqT5ZHHQJujQ",
        "usageDisclaimer": {
            "l": "Usage of a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, does not assert that the Legal Entity is trustworthy, honest, reputable in its business dealings, safe to do business with, or compliant with any laws or that an implied or expressly intended purpose will be fulfilled."
        },
        "issuanceDisclaimer": {
            "l": "All information in a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, is accurate as of the date the validation process was complete. The vLEI Credential has been issued to the legal entity or person named in the vLEI Credential as the subject; and the qualified vLEI Issuer exercised reasonable care to perform the validation process set forth in the vLEI Ecosystem Governance Framework."
        }
    }
}
EOF
kli saidify --file "$credential_file" 1>&2

kli vc create --name "$issuer" --alias "$issuer" --registry-name "$issuer" --credential @"$credential_file"

said=$(kli vc list --name "$issuer" --alias "$issuer" -i -s)
echo "Credential SAID: $said"

kli vc export --name "$issuer" --alias "$issuer" --said "$said" --full > fixtures/credential.cesr
