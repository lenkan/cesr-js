#!/bin/bash
set -e

output=$(npm pack)

for example in examples/*; do
    if [ -d "$example" ]; then
        echo "## Running tests in $example"
        mkdir -p "$example/cesr"
        tar -xf "$output" --dir "$example/cesr"
        cd "$example"
        image=$(docker build -q .)
        docker run --rm "$image"
        echo "## Success tests in $example"

        cd "../../"
    fi
done
