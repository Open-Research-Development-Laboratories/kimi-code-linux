#!/usr/bin/env bash
set -euo pipefail
recipe_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
workspace="$(dirname -- "$recipe_dir")"
scratch="$(mktemp -d "$workspace/native-packaging/deb-build.XXXXXX")"
trap 'rm -rf -- "$scratch"' EXIT
echo 'dfd35672af395c7a1da5d80fda3f7e2c463a642c97ff5fc70d97e00141f8c299  '"$workspace/KimiCode-1.0.4-ordl.2-linux-x64.tar.xz" | sha256sum --strict -c -
tar -xJf "$workspace/KimiCode-1.0.4-ordl.2-linux-x64.tar.xz" -C "$scratch"
bash "$recipe_dir/stage.sh" "$scratch/KimiCode-linux-x64" "$scratch/root"
mkdir "$scratch/control"
cp "$recipe_dir/control" "$scratch/control/control"
printf '2.0\n' > "$scratch/debian-binary"
tar --sort=name --mtime=@0 --owner=0 --group=0 --numeric-owner -czf "$scratch/control.tar.gz" -C "$scratch/control" .
tar --sort=name --mtime=@0 --owner=0 --group=0 --numeric-owner -cJf "$scratch/data.tar.xz" -C "$scratch/root" .
(cd "$scratch" && ar rcD "$workspace/kimi-code-ordl_1.0.4-2_amd64.deb" debian-binary control.tar.gz data.tar.xz)
