# Kimi Code Desktop 1.0.4 for modern Linux

Initial ORDL Linux release: portable installer archive revision 2 and DEB/RPM/Arch package revision 1. Moonshot permission confirmed by the release owner. This is ORDL-maintained packaging, not a vendor-built release.

Requires Linux x86_64 with GLIBC >= 2.42. Accepted on Arch rolling, glibc 2.44, Wayland. Older distributions are outside this initial scope.

Four artifact hashes and runtime comparisons passed. Portable desktop paths are corrected to the documented default /opt/kimi-code, with custom-prefix instructions. Accepted application, protected launcher, installer and manual updater are unchanged. The updater reports upstream information and offers explicit official download links; it does not automatically install or upgrade native packages.

DEB and Arch isolated install/reinstall/removal, helper ownership/mode, integrity and retained user data passed with dependency resolution waived. RPM digests/payload/metadata passed, but transaction testing hit a chroot permission restriction. Full distribution dependency resolution, new graphical package smoke tests, real revision upgrades and rollback remain unverified. Maintainers currently returns 404; Documentation click was not explicitly tested.

Assets are unsigned. SHA256SUMS is provided for integrity checking. Signed package-manager repositories are future work and are not configured by this release. Embedded native revision-1 README status predates the permission confirmation and later transaction tests; repository documentation records the current status.

Source contains curated ORDL packaging, launcher/updater work and offline tests. Recipes target the corrected archive for future native revision-2 rebuilds; existing release native revision-1 hashes are preserved. Retained Electron/Chromium/dependency notices apply to their components, not a blanket open-source license for the entire application.
