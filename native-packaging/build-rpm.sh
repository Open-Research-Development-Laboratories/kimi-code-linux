#!/usr/bin/env bash
set -euo pipefail
recipe_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$recipe_dir/rpm-build/tmp" "$recipe_dir/rpm-build/db"
command -v rpmbuild >/dev/null
rpmbuild -bb "$recipe_dir/kimi-code-ordl.spec" \
  --define "_topdir $recipe_dir/rpm-build" \
  --define "_sourcedir $recipe_dir" \
  --define "_tmppath $recipe_dir/rpm-build/tmp" \
  --define "_dbpath $recipe_dir/rpm-build/db"
