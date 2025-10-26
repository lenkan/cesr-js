#!/bin/bash
set -e

output=$(npm pack)
current_dir=$(pwd)

for example in examples/*; do
    cd "$current_dir"

    echo "## Running tests in $example"
    mkdir -p "$example/cesr"
    tar -xf "$output" --dir "$example/cesr"

    cd "$example"
    image_name="cesr-$(basename "$example")"
    docker build -q -t "$image_name" .
    echo "## Running image $image_name"
    docker run --rm "$image_name"
    echo "## Success tests in $example"
done
