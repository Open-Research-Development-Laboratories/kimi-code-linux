# Release signature verification

ORDL uses one dedicated release-signing identity for Code and Work Linux distributions:

- Identity: ORDL Release Signing <ordl@ordl.org>
- Primary fingerprint: `606BBCE1D7B44959D5C434F6E41CCFC5CB03F0CA`
- Signing-subkey fingerprint: `7A5625562D3A08B2B4242034EF73A042FA8454D0`
- [Public key](keys/ORDL-RELEASE-SIGNING-KEY.asc)

The [Code signature supplement](https://github.com/Open-Research-Development-Laboratories/kimi-code-linux/releases/tag/v1.0.4-ordl.2-signatures) supplies detached signatures for the original four artifacts and SHA256SUMS from [v1.0.4-ordl.2](https://github.com/Open-Research-Development-Laboratories/kimi-code-linux/releases/tag/v1.0.4-ordl.2). Original artifact bytes and hashes are unchanged; no immutable asset was replaced.

Download ORDL-RELEASE-SIGNING-KEY.asc, SHA256SUMS and SHA256SUMS.asc from the supplement. Keep your chosen original artifacts in the same directory. Verify the expected primary fingerprint, then run:

```bash
gpg --show-keys --with-fingerprint ORDL-RELEASE-SIGNING-KEY.asc
gpg --dearmor --output ordl-release-keyring.gpg ORDL-RELEASE-SIGNING-KEY.asc
gpgv --keyring ./ordl-release-keyring.gpg SHA256SUMS.asc SHA256SUMS
sha256sum --check --ignore-missing SHA256SUMS
```

The `.asc` beside each artifact also verifies that individual file with gpgv and this keyring. These instructions do not import a key into your global trust database. Trust only the fingerprint intended for ORDL; successful cryptographic verification alone does not choose that trust for you.

Five detached signatures passed local verification. They are separate from native package-manager signatures: the RPM/DEB bytes were not modified and signed repository metadata is not configured. The original immutable release's GitHub attestation also passed `gh release verify v1.0.4-ordl.2 --repo Open-Research-Development-Laboratories/kimi-code-linux`.

Private keys, passphrases and revocation material are not published in this repository or any release asset.
