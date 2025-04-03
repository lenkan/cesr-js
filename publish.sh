#!/bin/sh
set -e

package_info=$(cat package.json)

version=$(echo "$package_info" | jq .version -r)
tag=${NPM_PUBLISH_TAG:-dev}

if [ "$tag" = "dev" ]; then
    version="${version}-dev.$(git rev-parse --short HEAD)"
fi

npm install
npm run build

publish_dir="$(mktemp -d)"
cp -r README.md LICENSE dist package.json "${publish_dir}/"
jq ".version = \"${version}\"" package.json > "${publish_dir}/package.json"

if [ -z "$DRY_RUN" ]; then
    npm publish "${publish_dir}" --tag "${tag}"
else
    npm publish "${publish_dir}" --tag "${tag}" --dry-run
fi
