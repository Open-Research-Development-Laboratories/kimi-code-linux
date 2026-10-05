let electron = require("electron");
let node_fs = require("node:fs");
let node_os = require("node:os");
let node_path = require("node:path");
let node_fs_promises = require("node:fs/promises");
//#region src/main/track.ts
const MAX_PENDING_EVENTS = 200;
let impl = null;
let pending = [];
function setDesktopTrackImpl(next) {
	impl = next;
	if (impl === null) {
		pending = [];
		return;
	}
	const replay = pending;
	pending = [];
	for (const { event, properties } of replay) try {
		impl(event, properties);
	} catch {}
}
function trackDesktopEvent(event, properties) {
	const props = properties;
	if (impl === null) {
		if (pending.length >= MAX_PENDING_EVENTS) pending.shift();
		pending.push({
			event,
			properties: props
		});
		return;
	}
	impl(event, props);
}
let locale;
function setRuntimeLocale(next) {
	locale = next;
}
function getRuntimeLocale() {
	return locale;
}
//#endregion
//#region src/main/log.ts
const MAX_LOG_BYTES = 5 * 1024 * 1024;
let logFilePath = null;
let logFileBytes = 0;
let guardsInstalled = false;
let consoleMirror = true;
function kimiHome() {
	return process.env["KIMI_CODE_HOME"] ?? (0, node_path.join)((0, node_os.homedir)(), ".kimi-code");
}
function defaultMainLogPath() {
	return (0, node_path.join)(kimiHome(), "logs", "kimi-code-desktop.log");
}
function redactUrlForLog(raw) {
	try {
		const url = new URL(raw);
		url.username = "";
		url.password = "";
		url.search = "";
		url.hash = "";
		return url.toString();
	} catch {
		return raw.split(/[?#]/)[0] ?? raw;
	}
}
function rotateIfOversized(path) {
	try {
		if ((0, node_fs.statSync)(path).size > MAX_LOG_BYTES) (0, node_fs.renameSync)(path, `${path}.1`);
	} catch {}
}
function initMainLogging(path = defaultMainLogPath()) {
	try {
		(0, node_fs.mkdirSync)((0, node_path.dirname)(path), { recursive: true });
		rotateIfOversized(path);
		let size = 0;
		try {
			size = (0, node_fs.statSync)(path).size;
		} catch {}
		logFilePath = path;
		logFileBytes = size;
	} catch {
		logFilePath = null;
	}
	installCrashGuards();
}
function formatError(error) {
	if (error instanceof Error) return error.stack ?? error.message;
	return String(error);
}
function writeLine(level, message) {
	const line = `${(/* @__PURE__ */ new Date()).toISOString()} ${level}  ${message}\n`;
	if (logFilePath !== null) try {
		(0, node_fs.appendFileSync)(logFilePath, line);
		logFileBytes += Buffer.byteLength(line);
		if (logFileBytes > MAX_LOG_BYTES) {
			(0, node_fs.renameSync)(logFilePath, `${logFilePath}.1`);
			logFileBytes = 0;
		}
	} catch {}
	if (!consoleMirror) return;
	try {
		(level === "INFO" ? process.stdout : process.stderr).write(line);
	} catch {
		consoleMirror = false;
	}
}
const log = {
	info(message) {
		writeLine("INFO", message);
	},
	warn(message) {
		writeLine("WARN", message);
	},
	error(message, error) {
		writeLine("ERROR", error === void 0 ? message : `${message}  ${formatError(error)}`);
	}
};
function isUndiciStreamCloseRace(error) {
	return error instanceof Error && error.code === "ERR_INVALID_STATE" && error.message.includes("ReadableStream is already closed");
}
function surfaceUncaught(error) {
	try {
		const title = electron.app.getLocale().toLowerCase().startsWith("zh") ? "主进程发生 JavaScript 错误" : "A JavaScript error occurred in the main process";
		electron.dialog.showErrorBox(title, formatError(error));
	} catch {}
}
function installCrashGuards() {
	if (guardsInstalled) return;
	guardsInstalled = true;
	for (const stdio of [process.stdout, process.stderr]) stdio.on("error", () => {
		consoleMirror = false;
	});
	process.on("uncaughtException", (error) => {
		if (isUndiciStreamCloseRace(error)) {
			log.warn("ignored benign undici stream-close race (aborted fetch body)");
			return;
		}
		log.error("uncaughtException", error);
		trackDesktopEvent("app_crashed", {
			process: "main",
			kind: "uncaught_exception",
			error_name: error.name,
			app_uptime_ms: Math.round(process.uptime() * 1e3)
		});
		surfaceUncaught(error);
	});
	process.on("unhandledRejection", (reason) => {
		if (isUndiciStreamCloseRace(reason)) {
			log.warn("ignored benign undici stream-close race (aborted fetch body)");
			return;
		}
		log.error("unhandledRejection", reason);
		trackDesktopEvent("app_crashed", {
			process: "main",
			kind: "unhandled_rejection",
			error_name: reason instanceof Error ? reason.name : void 0,
			app_uptime_ms: Math.round(process.uptime() * 1e3)
		});
		surfaceUncaught(reason);
	});
}
const RENDERER_HOST = "renderer";
const MIME = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".map": "application/json; charset=utf-8"
};
function mimeFor(filePath) {
	return MIME[(0, node_path.extname)(filePath).toLowerCase()] ?? "application/octet-stream";
}
const priv = {
	standard: true,
	secure: true,
	supportFetchAPI: true,
	corsEnabled: true,
	codeCache: true
};
function registerAppSchemes() {
	electron.protocol.registerSchemesAsPrivileged([{
		scheme: "app",
		privileges: priv
	}, {
		scheme: "shot",
		privileges: priv
	}]);
}
async function isRegularFile(filePath) {
	try {
		return (await (0, node_fs_promises.stat)(filePath)).isFile();
	} catch {
		return false;
	}
}
const DEFAULT_RENDERER_BASE = `app://${RENDERER_HOST}/index.html`;
function rendererUrl(origin, token, base = DEFAULT_RENDERER_BASE, onboarded = false, vibrancy = true, embedded = false) {
	const params = new URLSearchParams({
		kimi_desktop: "1",
		platform: process.platform,
		kimi_origin: origin
	});
	if (embedded) params.set("kimi_embedded", "1");
	if (onboarded) params.set("kimi_onboarded", "1");
	params.set("kimi_vibrancy", vibrancy ? "1" : "0");
	const hash = token === void 0 ? "" : `#token=${encodeURIComponent(token)}`;
	return `${base}?${params.toString()}${hash}`;
}
function rendererDevBase(raw) {
	if (raw === void 0 || raw.trim() === "") return void 0;
	try {
		const url = new URL(raw);
		if (url.protocol !== "http:" && url.protocol !== "https:") return void 0;
		return url.toString();
	} catch {
		return;
	}
}
async function handleRendererRequest(request, getDistRoot) {
	const url = new URL(request.url);
	if ((request.url.slice(`${url.protocol}//${url.host}`.length).split(/[?#]/)[0] ?? "/").split("/").some((seg) => seg === "..")) return new Response("forbidden", { status: 403 });
	const decodedPathname = decodeURIComponent(url.pathname);
	if (decodedPathname.split("/").some((seg) => seg === "..")) return new Response("forbidden", { status: 403 });
	const root = getDistRoot();
	if (root === null) return new Response("not found", { status: 404 });
	const filePath = (0, node_path.resolve)((0, node_path.join)(root, decodedPathname === "/" ? "/index.html" : decodedPathname));
	if (!filePath.startsWith(root)) return new Response("forbidden", { status: 403 });
	let target = filePath;
	if (!await isRegularFile(target)) {
		if ((0, node_path.extname)(decodedPathname) !== "") return new Response("not found", { status: 404 });
		target = (0, node_path.join)(root, "index.html");
		if (!await isRegularFile(target)) return new Response("not found", { status: 404 });
	}
	const stream = (0, node_fs.createReadStream)(target);
	return new Response(stream, { headers: { "content-type": mimeFor(target) } });
}
function registerRendererProtocol(getRendererDistRoot) {
	electron.protocol.handle("app", (request) => handleRendererRequest(request, getRendererDistRoot));
}
function registerPreviewRendererProtocol(previewSession, getPreviewDistRoot) {
	previewSession.protocol.handle("app", (request) => handleRendererRequest(request, getPreviewDistRoot));
}
//#endregion
Object.defineProperty(exports, "defaultMainLogPath", {
	enumerable: true,
	get: function() {
		return defaultMainLogPath;
	}
});
Object.defineProperty(exports, "getRuntimeLocale", {
	enumerable: true,
	get: function() {
		return getRuntimeLocale;
	}
});
Object.defineProperty(exports, "initMainLogging", {
	enumerable: true,
	get: function() {
		return initMainLogging;
	}
});
Object.defineProperty(exports, "log", {
	enumerable: true,
	get: function() {
		return log;
	}
});
Object.defineProperty(exports, "redactUrlForLog", {
	enumerable: true,
	get: function() {
		return redactUrlForLog;
	}
});
Object.defineProperty(exports, "registerAppSchemes", {
	enumerable: true,
	get: function() {
		return registerAppSchemes;
	}
});
Object.defineProperty(exports, "registerPreviewRendererProtocol", {
	enumerable: true,
	get: function() {
		return registerPreviewRendererProtocol;
	}
});
Object.defineProperty(exports, "registerRendererProtocol", {
	enumerable: true,
	get: function() {
		return registerRendererProtocol;
	}
});
Object.defineProperty(exports, "rendererDevBase", {
	enumerable: true,
	get: function() {
		return rendererDevBase;
	}
});
Object.defineProperty(exports, "rendererUrl", {
	enumerable: true,
	get: function() {
		return rendererUrl;
	}
});
Object.defineProperty(exports, "setDesktopTrackImpl", {
	enumerable: true,
	get: function() {
		return setDesktopTrackImpl;
	}
});
Object.defineProperty(exports, "setRuntimeLocale", {
	enumerable: true,
	get: function() {
		return setRuntimeLocale;
	}
});
Object.defineProperty(exports, "trackDesktopEvent", {
	enumerable: true,
	get: function() {
		return trackDesktopEvent;
	}
});
