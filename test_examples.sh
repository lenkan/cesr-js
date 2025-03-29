#!/bin/bash
set -e

for example in examples/*; do
    if [ -d "$example" ]; then
        echo "Running tests in $example"
        (cd "$example" && ./run_test.sh)
    fi
done
