# Available Kimi Code Desktop application code

This tree publishes the available application code from the accepted Kimi Code Desktop 1.0.4 Linux distribution, not only its packaging tools. These files were copied from the accepted assembled runtime without modifying its application code.

## Included

- resources/app/out: shipped Electron main-process, preload, worker and application JavaScript bundles, including the accepted portable manual updater.
- resources/app/package.json: vendor application identity and dependency metadata.
- resources/app/node_modules: available dependency source, JavaScript, declarations, package metadata and notices, including node-pty's available native source. Generated native build outputs and prebuilt executable binaries are excluded.
- resources/desktop-dist: shipped renderer bundles, HTML, styles and UI assets.
- resources/build: application icons and tray resources.
- resources/third-party-notices, LICENSE and LICENSES.chromium.html: retained component attribution and notices.

Product code is primarily bundled/transpiled JavaScript. Moonshot's original unbundled product source checkout, original TypeScript/React project and upstream build configuration were not found in the available inputs; they are not invented or claimed to be provided. Dependency source files do not establish that the complete proprietary product is available as an upstream source project.

## Excluded

Electron and native executables, native build/prebuild outputs, binary object/debug artifacts and generated build logs are available only where included in the released application packages. Local profiles, credentials, private signing material, unrelated Work/MK/SLF content and original project Git history are excluded. This tree cannot be launched as an application by itself; use the verified release artifacts.

SHA256SUMS records every file copied from the accepted runtime. It is a source inventory, separate from the root release-artifact manifest. This is not a claim of a reproducible proprietary upstream source build.

## Attribution

Moonshot AI is the upstream application author; ORDL maintains this Linux distribution and its local modifications. Existing component licenses and notices remain intact. No blanket open-source license is assigned to the whole application by publishing these available files. For Linux requirements and tested limits, see the repository README.
