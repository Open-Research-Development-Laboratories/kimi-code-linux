# Kimi Code Linux

ORDL-maintained Linux x86_64 packaging of Moonshot AI Kimi Code Desktop 1.0.4.

**Requires GLIBC >= 2.42.** This is an intentional initial-release limit. Accepted application testing was on Arch Linux rolling, glibc 2.44, Wayland. Package format availability does not establish support for every Debian, Ubuntu or RPM distribution.

Official [product](https://www.kimi.com/code) and [documentation](https://www.kimi.com/code/docs/en/). Maintained by [Open Research Development Laboratories](https://github.com/Open-Research-Development-Laboratories).

Developed and maintained by Open Research and Development Laboratories for the Kimi ecosystem, with encouragement from the Kimi team.

## Downloads and installation

Use the [corrected release](https://github.com/Open-Research-Development-Laboratories/kimi-code-linux/releases/tag/v1.0.4-ordl.3). Verify the downloaded files against SHA256SUMS and their detached ORDL signatures; see [SIGNING.md](SIGNING.md). Native package-manager signatures and signed update repositories are separate from these detached signatures.

- Portable installer archive: `KimiCode-1.0.4-ordl.2-linux-x64.tar.xz`. Extract, then run `./install-kimi-code --check --prefix /opt/kimi-code` followed by `./install-kimi-code --prefix /opt/kimi-code`. Launch `/opt/kimi-code/kimi-code`. Installation uses confirmation and normal administrator authentication. The desktop entry targets that default prefix; adjust both Exec and Icon for a custom prefix before registering it. The installer does not register a desktop entry automatically. This archive is not an unpack-and-run sandbox bypass.
- DEB: `kimi-code-ordl_1.0.4-2_amd64.deb`.
- RPM: `kimi-code-ordl-1.0.4-2.x86_64.rpm`.
- Arch: `kimi-code-ordl-1.0.4-2-x86_64.pkg.tar.zst`.

Install native packages with your package manager on a compatible system. They own `/opt/kimi-code-ordl` and its desktop entry. Launch with `kimi-code`; native revision 2 adds this PATH command, forwarding to `/opt/kimi-code-ordl/kimi-code`. The separate `kimi` CLI is unchanged. Do not overlay the portable installer. The launcher requires protected installation paths and a root-owned sandbox helper mode 4755. Do not disable the sandbox to fix a launch failure.

Native package removal retains user settings and sessions. Portable uninstall moves the identified protected installation to a timestamped sibling for recovery and retains user data; see its included README.

## Updates

Manual Check for Updates reports upstream version information and can offer an explicit official AppImage link. That upstream link does not upgrade an ORDL native package. No automatic installation is implemented. Obtain subsequent ORDL revisions from this repository's releases. Signed APT/RPM/Arch repositories are planned, not currently configured.

## Verification and limitations

All four artifact checksums passed. Portable extraction, runtime manifest, desktop validation and complete runtime comparison passed. Portable revision 2 changes only desktop integration, README and revision metadata; the accepted application, installer, launcher, uninstaller and manual updater remain unchanged.

DEB and Arch disposable-root install, replacement, helper ownership/mode, runtime integrity, removal and user-data retention passed with dependency resolution waived against empty databases. Corrected revision 2 also passed non-root command-discovery/argument-forwarding tests in all three formats and a disposable Arch revision-1-to-2 upgrade/removal test. The requested host reinstall of Arch revision 2 passed package integrity checks. RPM header and payload digests, payload comparison and metadata passed; its native transaction testing was blocked by a chroot permission restriction. Full distribution dependency resolution, fresh graphical acceptance of each corrected package and rollback remain unverified.

User acceptance covered smooth isolated startup, latest-version update result, external Maintainers browser launch and application controls. Documentation click was not explicitly tested. The correct Maintainers URL, https://ordl.org/kimi, returned 404 while the page was unpublished.

Embedded README text in native revision-1 artifacts predates the permission confirmation and later DEB/Arch transaction tests. This README and release notes provide the current status without changing those verified artifact bytes.

## Source and provenance

This repository contains the available Kimi Code application code under [source/](source/), alongside ORDL launcher, installer, manual updater and packaging work. The available product code is the shipped Electron main/preload and renderer JavaScript bundles, dependency source and UI resources; Moonshot's original unbundled product source checkout is not available here. See [source/README.md](source/README.md) for exact scope and provenance. The assembled application remains downloadable as release assets. It combines vendor desktop 1.0.4 inputs with Electron 43.1.1 Linux and a locally built node-pty 1.1.0 component. The latter requires GLIBC 2.42 and has SHA256 `7be4058f232bc88df150e0403775109bef4523818ded32ebeb9cfad455f1f5e3` in all four Linux copies.

Archive packaging is deterministic from assembled inputs; this is not a claim of a reproducible proprietary upstream source build. Published packaging recipes target corrected archive revision 2 and native packaging revision 2, including the terminal-command fix. Older immutable native revision-1 assets remain preserved; current recipes are not claimed to reproduce their exact bytes.

Electron MIT, Chromium and dependency notices remain in the application bundles. Those notices apply to their components. No blanket open-source license is asserted for the Moonshot application or the whole distribution; do not infer one from component notices.

Content checks found no credential-pattern matches beyond a library parser literal. Local developer paths were removed from the corrected portable desktop entry. This scoped publication check is not a full application security audit.
