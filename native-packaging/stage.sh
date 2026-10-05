#!/usr/bin/env bash
set -euo pipefail
recipe_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
[[ $# = 2 ]] || exit 2
bundle="$1"
stage="$2"
mkdir -p "$stage/opt/kimi-code-ordl" "$stage/usr/share/applications" "$stage/usr/bin"
cp -a --no-preserve=ownership "$bundle/." "$stage/opt/kimi-code-ordl/"
# Package-manager ownership replaces the portable installer/uninstaller contract.
rm -f -- "$stage/opt/kimi-code-ordl/install-kimi-code" "$stage/opt/kimi-code-ordl/uninstall-kimi-code" "$stage/opt/kimi-code-ordl/kimi-code.desktop" "$stage/opt/kimi-code-ordl/README-ORDL.md"
cp "$recipe_dir/NATIVE-README.md" "$stage/opt/kimi-code-ordl/README-ORDL.md"
cp "$recipe_dir/kimi-code-ordl.desktop" "$stage/usr/share/applications/kimi-code-ordl.desktop"
cp "$recipe_dir/kimi-code" "$stage/usr/bin/kimi-code"
find "$stage" -type d -exec chmod 0755 {} +
find "$stage" -type f -exec chmod go-w {} +
chmod 4755 "$stage/opt/kimi-code-ordl/chrome-sandbox"
chmod 0755 "$stage/opt/kimi-code-ordl/kimi-code"
chmod 0755 "$stage/usr/bin/kimi-code"
(cd "$stage/opt/kimi-code-ordl" && sha256sum --strict --quiet -c INSTALL-MANIFEST.sha256)
