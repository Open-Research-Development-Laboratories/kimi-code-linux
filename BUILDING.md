# Packaging from assembled release inputs

These recipes target native packaging revision 2 using the corrected portable archive and add the /usr/bin/kimi-code command. Revision-2 Arch, DEB and RPM candidates built successfully and passed command regression tests. They do not reproduce older immutable native revision-1 artifact hashes.

Download KimiCode-1.0.4-ordl.2-linux-x64.tar.xz from this repository's release and verify SHA256SUMS. Keep it at repository root for build-deb.sh and copy it into native-packaging for RPM/Arch source lookup. Do not execute a downloaded runtime merely to package it.

DEB: with trusted installed GNU tar/xz/ar and shell tooling, run `bash native-packaging/build-deb.sh` from the repository. RPM: with a trusted installed rpmbuild toolchain, run `bash native-packaging/build-rpm.sh`. Arch: run makepkg from native-packaging with trusted makepkg/fakeroot/zstd. Use compatible disposable build environments; do not change a host's glibc or disable its signature policy to build these packages.

The corrected assembled portable input can be deterministically archived with GNU tar's sort=name, mtime=@0, owner/group=0 and numeric-owner options. Proprietary application source inputs are not provided here; deterministic archive packaging is not a reproducible upstream source build.

`node tests/verify-portable-updater.cjs` runs offline current/newer/error/link-policy checks without credentials or a model run. The portable scripts in this repository mirror the accepted archive; they alone are not an application installation.
