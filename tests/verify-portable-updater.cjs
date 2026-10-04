"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const {
	checkLinuxFeed,
	compareVersions,
	createPortableManualChecker,
	isPortableLinuxPackage,
	parseLinuxFeed
} = require(path.join(__dirname, "..", "portable", "portable-updater.cjs"));

const feed = [
	"version: 1.0.5",
	"files:",
	"  - url: KimiCode-1.0.5-linux-x86_64.AppImage",
	"    sha512: fixture-sha",
	"    size: 149086990",
	"path: KimiCode-1.0.5-linux-x86_64.AppImage",
	"sha512: fixture-sha",
	"size: 149086990",
	"releaseDate: 2026-10-04T00:00:00.000Z",
	""
].join("\n");

const parsed = parseLinuxFeed(feed);
assert.equal(parsed.version, "1.0.5");
assert.equal(parsed.downloadUrl, "https://code.kimi.com/kimi-code/desktop/binaries/1.0.5/KimiCode-1.0.5-linux-x86_64.AppImage");
assert.equal(parsed.sha512, "fixture-sha");
assert.equal(parsed.size, 149086990);
assert.equal(checkLinuxFeed(feed, "1.0.4").outcome, "portable-available");
assert.equal(checkLinuxFeed(feed, "1.0.5").outcome, "latest");
assert.equal(compareVersions("1.0.10", "1.0.9"), 1);
assert.equal(compareVersions("1.0.4", "1.0.4"), 0);
assert.throws(() => parseLinuxFeed("version: 1.0.5\npath: https://evil.example.invalid/update.AppImage\n"), /official Kimi Code URL/u);
assert.equal(isPortableLinuxPackage({
	platform: "linux",
	appImage: void 0,
	resourcePath: "/portable/resources",
	existsSync: () => false
}), true);
assert.equal(isPortableLinuxPackage({
	platform: "linux",
	appImage: "/tmp/KimiCode.AppImage",
	resourcePath: "/portable/resources",
	existsSync: () => false
}), false);
assert.equal(isPortableLinuxPackage({
	platform: "linux",
	appImage: void 0,
	resourcePath: "/portable/resources",
	existsSync: () => true
}), false);

(async () => {
	const statuses = [];
	const started = Date.now();
	const checker = createPortableManualChecker({
		currentVersion: "1.0.4",
		fetchFeed: async ({ url }) => {
			assert.equal(url, "https://code.kimi.com/kimi-code/desktop/latest-linux.yml");
			return feed;
		},
		onStatus: (status) => statuses.push(status),
		timeoutMs: 1000
	});
	const result = await checker.check();
	assert.equal(result.outcome, "portable-available");
	assert.equal(checker.getStatus().downloadUrl, parsed.downloadUrl);
	assert.equal(statuses.at(-1).state, "available");
	assert.ok(Date.now() - started < 1000, "manual portable check should not wait for the electron-updater 30 second event timeout");
	assert.deepEqual(checker.download(), { outcome: "unsupported" });
	assert.deepEqual(checker.install(), { outcome: "unsupported" });
	checker.stop();
	assert.equal((await checker.check()).outcome, "error");
	const timeoutChecker = createPortableManualChecker({
		currentVersion: "1.0.4",
		fetchFeed: () => new Promise(() => {}),
		timeoutMs: 5
	});
	const timeoutStarted = Date.now();
	const timeoutResult = await timeoutChecker.check();
	assert.equal(timeoutResult.outcome, "error");
	assert.match(timeoutResult.message, /timed out/u);
	assert.ok(Date.now() - timeoutStarted < 500, "portable feed timeout should be bounded");
	console.log("Portable updater verification passed");
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
