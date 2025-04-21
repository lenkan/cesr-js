#!/bin/bash
set -e

output=$(npm pack)
current_dir=$(pwd)

for example in examples/*; do
    if [ -d "$example" ]; then
        cd "$current_dir"

        echo "## Running tests in $example"
        mkdir -p "$example/cesr"
        tar -xf "$output" --dir "$example/cesr"

        cd "$example"
        image=$(docker build -q .)
        docker run --rm "$image"
        echo "## Success tests in $example"
    fi
done
