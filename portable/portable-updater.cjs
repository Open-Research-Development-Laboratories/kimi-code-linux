"use strict";

const path = require("node:path");

const PORTABLE_LINUX_FEED_URL = "https://code.kimi.com/kimi-code/desktop/latest-linux.yml";
const PORTABLE_LINUX_FEED_ROOT = "https://code.kimi.com/kimi-code/desktop/";

function scalar(value) {
	return value.trim().replace(/^['"]|['"]$/g, "");
}

function versionParts(value) {
	const normalized = scalar(String(value)).replace(/^v/u, "");
	const match = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/u.exec(normalized);
	if (match === null) throw new Error(`invalid version: ${value}`);
	return [1, 2, 3, 4].map((index) => Number.parseInt(match[index] ?? "0", 10));
}

function compareVersions(left, right) {
	const a = versionParts(left);
	const b = versionParts(right);
	for (let index = 0; index < a.length; index += 1) {
		if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
	}
	return 0;
}

function officialDownloadUrl(assetPath, version) {
	const raw = scalar(assetPath);
	const candidate = /^https?:\/\//u.test(raw) ? raw : `${PORTABLE_LINUX_FEED_ROOT}${raw.startsWith("binaries/") ? raw : `binaries/${version}/${raw}`}`;
	const url = new URL(candidate);
	if (url.protocol !== "https:" || url.hostname !== "code.kimi.com" || !url.pathname.startsWith("/kimi-code/desktop/") || url.search !== "" || url.hash !== "") {
		throw new Error("Linux update asset is not an official Kimi Code URL");
	}
	if (!url.pathname.toLowerCase().endsWith(".appimage")) throw new Error("Linux update asset is not an AppImage");
	return url.toString();
}

function lineValue(text, expression) {
	const match = expression.exec(text);
	return match === null ? void 0 : scalar(match[1]);
}

function parseLinuxFeed(text) {
	if (typeof text !== "string" || text.trim() === "") throw new Error("Linux update feed is empty");
	const version = lineValue(text, /^version:\s*([^\r\n#]+)/mu);
	if (version === void 0) throw new Error("Linux update feed has no version");
	versionParts(version);
	const rootPath = lineValue(text, /^path:\s*([^\r\n#]+)/mu);
	const filePaths = [...text.matchAll(/^\s*-\s+url:\s*([^\r\n#]+)/gmu)].map((match) => scalar(match[1]));
	const appImagePath = [rootPath, ...filePaths].find((candidate) => candidate !== void 0 && candidate.toLowerCase().includes(".appimage"));
	if (appImagePath === void 0) throw new Error("Linux update feed has no AppImage asset");
	const sha512 = lineValue(text, /^sha512:\s*([^\r\n#]+)/mu);
	const sizeValue = lineValue(text, /^size:\s*(\d+)/mu);
	const releaseDate = lineValue(text, /^releaseDate:\s*([^\r\n#]+)/mu);
	return {
		version,
		downloadUrl: officialDownloadUrl(appImagePath, version),
		sha512,
		size: sizeValue === void 0 ? void 0 : Number.parseInt(sizeValue, 10),
		releaseDate,
		feedUrl: PORTABLE_LINUX_FEED_URL
	};
}

function checkLinuxFeed(text, currentVersion) {
	const info = parseLinuxFeed(text);
	const comparison = compareVersions(info.version, currentVersion);
	if (comparison <= 0) return { outcome: "latest", version: currentVersion, feed: info };
	return { outcome: "portable-available", ...info };
}

function withTimeout(promise, timeoutMs) {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
	let timer;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(() => reject(new Error("Linux update feed request timed out")), timeoutMs);
	});
	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function createPortableManualChecker({ currentVersion, fetchFeed, onStatus = () => {}, timeoutMs = 15_000 }) {
	let stopped = false;
	let current = { state: "idle" };
	const setStatus = (next) => {
		current = next;
		onStatus(current);
	};
	const check = async () => {
		if (stopped) return { outcome: "error", message: "update checker stopped" };
		try {
			const text = await withTimeout(Promise.resolve().then(() => fetchFeed({ url: PORTABLE_LINUX_FEED_URL, timeoutMs })), timeoutMs);
			const result = checkLinuxFeed(text, currentVersion);
			setStatus(result.outcome === "portable-available" ? {
				state: "available",
				version: result.version,
				downloadUrl: result.downloadUrl,
				releaseDate: result.releaseDate,
				sha512: result.sha512,
				size: result.size
			} : { state: "idle" });
			return result;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setStatus({ state: "error", message });
			return { outcome: "error", message };
		}
	};
	return {
		getStatus: () => current,
		check,
		download: () => ({ outcome: "unsupported" }),
		install: () => ({ outcome: "unsupported" }),
		setAutoDownload: () => {},
		stop: () => {
			stopped = true;
		}
	};
}

function isPortableLinuxPackage({ platform, appImage, resourcePath, existsSync }) {
	return platform === "linux" && !appImage && !existsSync(path.join(resourcePath, "package-type"));
}

module.exports = {
	PORTABLE_LINUX_FEED_URL,
	checkLinuxFeed,
	compareVersions,
	createPortableManualChecker,
	isPortableLinuxPackage,
	officialDownloadUrl,
	parseLinuxFeed
};
