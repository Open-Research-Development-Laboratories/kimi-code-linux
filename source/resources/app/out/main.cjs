Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_protocol = require("./protocol-r4z3gR8R.cjs");
const require_release_channel = require("./release-channel-DelUHOC7.cjs");
let electron = require("electron");
let node_fs = require("node:fs");
let node_path = require("node:path");
let node_child_process = require("node:child_process");
//#region src/main/stable-settings-import.ts
const STABLE_USERDATA_NAME = "kimi-code-app";
const LOCAL_STORAGE_LEVELDB = (0, node_path.join)("Local Storage", "leveldb");
const MARKER_NAME = ".stable-ui-settings-import.json";
const BACKUP_DIR_NAME = "leveldb.bak";
function stableUserDataDir(appDataDir) {
	return (0, node_path.join)(appDataDir, STABLE_USERDATA_NAME);
}
function canImportStableSettings(version, platform) {
	return require_release_channel.isCanaryVersion(version) && platform === "darwin";
}
function isStableAppRunning(run = (file, args) => (0, node_child_process.execFileSync)(file, args, {
	encoding: "utf8",
	stdio: [
		"ignore",
		"pipe",
		"ignore"
	]
})) {
	try {
		run("pgrep", ["-f", "Kimi Code\\.app/Contents/MacOS/Kimi Code( |$)"]);
		return true;
	} catch (error) {
		return error?.status === 1 ? false : true;
	}
}
function stableSettingsPrecheck(version, platform, appDataDir, run) {
	if (!canImportStableSettings(version, platform)) return "unavailable";
	if (!(0, node_fs.existsSync)((0, node_path.join)(stableUserDataDir(appDataDir), LOCAL_STORAGE_LEVELDB))) return "no-stable-data";
	if (isStableAppRunning(run)) return "stable-running";
	return "ok";
}
function writeImportMarker(userDataDir, sourceDir) {
	const marker = {
		sourceDir,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	(0, node_fs.writeFileSync)((0, node_path.join)(userDataDir, MARKER_NAME), JSON.stringify(marker), "utf8");
}
function consumeImportMarker(userDataDir) {
	const markerPath = (0, node_path.join)(userDataDir, MARKER_NAME);
	if (!(0, node_fs.existsSync)(markerPath)) return null;
	let raw;
	try {
		raw = (0, node_fs.readFileSync)(markerPath, "utf8");
	} catch {
		raw = "";
	}
	(0, node_fs.rmSync)(markerPath, { force: true });
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed !== "object" || parsed === null) return null;
		const { sourceDir, createdAt } = parsed;
		if (typeof sourceDir !== "string" || sourceDir === "") return null;
		return {
			sourceDir,
			createdAt: typeof createdAt === "string" ? createdAt : ""
		};
	} catch {
		return null;
	}
}
function performStableSettingsImport(userDataDir, sourceDir) {
	const source = (0, node_path.join)(sourceDir, LOCAL_STORAGE_LEVELDB);
	const dest = (0, node_path.join)(userDataDir, LOCAL_STORAGE_LEVELDB);
	if (!(0, node_fs.existsSync)(source)) return {
		ok: false,
		backedUp: false,
		error: `stable localStorage not found: ${source}`
	};
	let backedUp = false;
	if ((0, node_fs.existsSync)(dest)) {
		const backup = (0, node_path.join)((0, node_path.dirname)(dest), BACKUP_DIR_NAME);
		(0, node_fs.rmSync)(backup, {
			recursive: true,
			force: true
		});
		(0, node_fs.renameSync)(dest, backup);
		backedUp = true;
	}
	(0, node_fs.mkdirSync)((0, node_path.dirname)(dest), { recursive: true });
	(0, node_fs.cpSync)(source, dest, { recursive: true });
	return {
		ok: true,
		backedUp
	};
}
function consumePendingStableImport(userDataDir, logger, run) {
	const marker = consumeImportMarker(userDataDir);
	if (marker === null) return;
	if (isStableAppRunning(run)) {
		logger.warn("[kimi-desktop] stable UI-settings import skipped: the stable app is running (marker consumed)");
		return;
	}
	const outcome = performStableSettingsImport(userDataDir, marker.sourceDir);
	if (outcome.ok) logger.info(`[kimi-desktop] imported UI settings from the stable app (backup=${outcome.backedUp ? "leveldb.bak" : "none"})`);
	else logger.warn(`[kimi-desktop] stable UI-settings import failed: ${outcome.error ?? "unknown error"}`);
}
//#endregion
//#region src/main/index.ts
if (require_release_channel.isCanaryVersion(electron.app.getVersion())) electron.app.setName("Kimi Code Canary");
else if (require_release_channel.isPreviewVersion(electron.app.getVersion())) electron.app.setName("Kimi Code Preview");
require_protocol.initMainLogging();
if (require_release_channel.isCanaryVersion(electron.app.getVersion())) try {
	consumePendingStableImport(electron.app.getPath("userData"), require_protocol.log);
} catch (error) {
	require_protocol.log.warn(`[kimi-desktop] stable UI-settings import errored: ${error instanceof Error ? error.message : String(error)}`);
}
require_protocol.registerAppSchemes();
require_release_channel.startShellEnvProbe();
if (process.platform === "linux") electron.app.commandLine.appendSwitch("enable-features", "GlobalShortcutsPortal");
if (process.argv.includes("--screenshot-diagnostics")) Promise.resolve().then(() => require("./screenshot-diagnostics-ui5hOg18.cjs")).then(({ runScreenshotDiagnostics }) => runScreenshotDiagnostics());
else Promise.resolve().then(() => require("./app-DKK15gTw.cjs")).then(({ main }) => main());
//#endregion
exports.stableSettingsPrecheck = stableSettingsPrecheck;
exports.stableUserDataDir = stableUserDataDir;
exports.writeImportMarker = writeImportMarker;
