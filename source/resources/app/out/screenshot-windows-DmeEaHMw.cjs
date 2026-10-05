const require_protocol = require("./protocol-r4z3gR8R.cjs");
let electron = require("electron");
let node_path = require("node:path");
let node_fs_promises = require("node:fs/promises");
let node_child_process = require("node:child_process");
let node_util = require("node:util");
let node_zlib = require("node:zlib");
let node_module = require("node:module");
//#region src/main/screenshot-frame.ts
const compress = (0, node_util.promisify)(node_zlib.deflate);
const signature = Buffer.from([
	137,
	80,
	78,
	71,
	13,
	10,
	26,
	10
]);
function screenshotBitmapFrame(bitmap, width, height) {
	if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 || width > 2147483647 || height > 2147483647 || bitmap.length !== width * height * 4 || bitmap.length > 4294967173) throw new Error("invalid-screenshot-bitmap");
	const frame = Buffer.allocUnsafe(122 + bitmap.length);
	frame.fill(0, 0, 122);
	frame.write("BM");
	frame.writeUInt32LE(frame.length, 2);
	frame.writeUInt32LE(122, 10);
	frame.writeUInt32LE(108, 14);
	frame.writeInt32LE(width, 18);
	frame.writeInt32LE(-height, 22);
	frame.writeUInt16LE(1, 26);
	frame.writeUInt16LE(32, 28);
	frame.writeUInt32LE(3, 30);
	frame.writeUInt32LE(bitmap.length, 34);
	frame.writeUInt32LE(16711680, 54);
	frame.writeUInt32LE(65280, 58);
	frame.writeUInt32LE(255, 62);
	frame.writeUInt32LE(4278190080, 66);
	frame.writeUInt32LE(1934772034, 70);
	bitmap.copy(frame, 122);
	for (let offset = 122; offset < frame.length; offset += 4) {
		const alpha = frame[offset + 3];
		if (alpha === 255) continue;
		const factor = alpha === 0 ? 0 : 255 / alpha;
		for (let channel = 0; channel < 3; channel++) frame[offset + channel] = Math.min(255, Math.round(frame[offset + channel] * factor));
	}
	return frame;
}
function chunk(type, data) {
	const header = Buffer.alloc(8);
	header.writeUInt32BE(data.length);
	header.write(type, 4, "ascii");
	const checksum = Buffer.alloc(4);
	checksum.writeUInt32BE((0, node_zlib.crc32)(data, (0, node_zlib.crc32)(header.subarray(4))));
	return Buffer.concat([
		header,
		data,
		checksum
	]);
}
async function encodeScreenshotBitmap(bitmap, width, height) {
	if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 || bitmap.length !== width * height * 4) throw new Error("invalid-screenshot-bitmap");
	const stride = width * 4;
	const rows = Buffer.allocUnsafe((stride + 1) * height);
	for (let y = 0; y < height; y++) {
		let target = y * (stride + 1);
		rows[target++] = 0;
		for (let source = y * stride; source < (y + 1) * stride; source += 4) {
			const alpha = bitmap[source + 3];
			if (alpha === 255) {
				rows[target++] = bitmap[source + 2];
				rows[target++] = bitmap[source + 1];
				rows[target++] = bitmap[source];
			} else {
				const factor = alpha === 0 ? 0 : 255 / alpha;
				rows[target++] = Math.min(255, Math.round(bitmap[source + 2] * factor));
				rows[target++] = Math.min(255, Math.round(bitmap[source + 1] * factor));
				rows[target++] = Math.min(255, Math.round(bitmap[source] * factor));
			}
			rows[target++] = alpha;
		}
	}
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width);
	header.writeUInt32BE(height, 4);
	header[8] = 8;
	header[9] = 6;
	const compressed = await compress(rows, { level: 1 });
	return Buffer.concat([
		signature,
		chunk("IHDR", header),
		chunk("sRGB", Buffer.from([0])),
		chunk("IDAT", compressed),
		chunk("IEND", Buffer.alloc(0))
	]);
}
//#endregion
//#region src/main/screenshot-native.ts
let native;
let captureNative;
function nativeDirectory() {
	return electron.app.isPackaged ? (0, node_path.join)(process.resourcesPath, "screenshot-window-list") : (0, node_path.join)(electron.app.getAppPath(), "native", "screenshot-window-list", "dist");
}
function windowsOverlayHwnd(window) {
	const handle = window.getNativeWindowHandle();
	return (handle.length >= 8 ? handle.readBigUInt64LE(0) : BigInt(handle.readUInt32LE(0))).toString(10);
}
function windowsOverlayExecutable() {
	return (0, node_path.join)(nativeDirectory(), "screenshot-window-list.exe");
}
async function captureNativeScreenshotFrames(mode = "all-shadows") {
	if (process.platform !== "darwin") throw new Error("native-capture-unsupported");
	if (captureNative === void 0) captureNative = (0, node_module.createRequire)(require("url").pathToFileURL(__filename).href)((0, node_path.join)(nativeDirectory(), "screenshot-capture.node"));
	return captureNative.capture([
		"default",
		"display-shadows",
		"all-shadows"
	].indexOf(mode));
}
function configureScreenshotOverlay(window) {
	if (process.platform === "win32") {
		const hwnd = windowsOverlayHwnd(window);
		return new Promise((resolve, reject) => {
			const child = (0, node_child_process.execFile)(windowsOverlayExecutable(), [
				"configure",
				hwnd,
				String(process.pid)
			], {
				timeout: 2e3,
				windowsHide: true
			}, (error, stdout) => {
				window.removeListener("closed", cancel);
				if (error !== null) reject(error);
				else {
					require_protocol.log.info(`[screenshot] native-window=${hwnd} ${stdout.trim()}`);
					resolve(hwnd);
				}
			});
			const cancel = () => {
				child.kill();
			};
			window.once("closed", cancel);
		});
	}
	if (process.platform !== "darwin") return void 0;
	return windowNative().configure(window.getNativeWindowHandle());
}
function windowNative() {
	if (native === void 0) native = (0, node_module.createRequire)(require("url").pathToFileURL(__filename).href)((0, node_path.join)(nativeDirectory(), "screenshot-overlay.node"));
	return native;
}
function configurePinnedScreenshot(window) {
	if (process.platform === "darwin") windowNative().configurePin(window.getNativeWindowHandle());
}
//#endregion
//#region src/main/screenshot-windows.ts
const execFileAsync = (0, node_util.promisify)(node_child_process.execFile);
function executableName() {
	if (process.platform === "darwin") return "screenshot-window-list";
	if (process.platform === "win32") return "screenshot-window-list.exe";
	return null;
}
function executablePath(name) {
	return electron.app.isPackaged ? (0, node_path.join)(process.resourcesPath, "screenshot-window-list", name) : (0, node_path.join)(electron.app.getAppPath(), "native", "screenshot-window-list", "dist", name);
}
function isNativeWindow(value) {
	if (typeof value !== "object" || value === null) return false;
	const item = value;
	return (typeof item.id === "string" || typeof item.id === "number") && [
		item.x,
		item.y,
		item.width,
		item.height
	].every((part) => typeof part === "number" && Number.isFinite(part)) && (item.width ?? 0) > 0 && (item.height ?? 0) > 0;
}
function parseList(stdout) {
	try {
		const value = JSON.parse(stdout);
		if (value.units !== "points" && value.units !== "pixels" || !Array.isArray(value.windows)) return null;
		return {
			units: value.units,
			windows: value.windows.filter(isNativeWindow).slice(0, 2e3)
		};
	} catch {
		return null;
	}
}
function intersect(a, b) {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	const right = Math.min(a.x + a.width, b.x + b.width);
	const bottom = Math.min(a.y + a.height, b.y + b.height);
	if (right - x < 8 || bottom - y < 8) return null;
	return {
		x,
		y,
		width: right - x,
		height: bottom - y
	};
}
function candidatesByDisplay(list, displays) {
	const result = new Map(displays.map((display) => [String(display.id), []]));
	const regions = displays.map((display) => ({
		display,
		bounds: process.platform === "win32" && list.units === "pixels" ? electron.screen.dipToScreenRect(null, display.bounds) : display.bounds
	}));
	for (const window of list.windows) for (const { display, bounds } of regions) {
		const visible = intersect(window, bounds);
		if (visible === null) continue;
		const ratioX = display.bounds.width / bounds.width;
		const ratioY = display.bounds.height / bounds.height;
		if (visible.width * ratioX < 8 || visible.height * ratioY < 8) continue;
		result.get(String(display.id))?.push({
			id: String(window.id),
			x: (visible.x - bounds.x) * ratioX,
			y: (visible.y - bounds.y) * ratioY,
			width: visible.width * ratioX,
			height: visible.height * ratioY
		});
	}
	return result;
}
function fakeCandidatesByDisplay(displays) {
	return new Map(displays.map((display) => [String(display.id), [{
		id: `fake-${display.id}-1`,
		x: Math.round(display.bounds.width * .08),
		y: Math.round(display.bounds.height * .09),
		width: Math.round(display.bounds.width * .58),
		height: Math.round(display.bounds.height * .64)
	}, {
		id: `fake-${display.id}-2`,
		x: Math.round(display.bounds.width * .42),
		y: Math.round(display.bounds.height * .22),
		width: Math.round(display.bounds.width * .48),
		height: Math.round(display.bounds.height * .56)
	}]]));
}
async function listScreenshotWindows(displays, excludedWindowIds = []) {
	const name = executableName();
	if (name === null) return /* @__PURE__ */ new Map();
	const path = executablePath(name);
	try {
		await (0, node_fs_promises.access)(path);
		const args = [...excludedWindowIds];
		const { stdout } = await execFileAsync(path, args, {
			encoding: "utf8",
			timeout: 1e3,
			maxBuffer: 1024 * 1024,
			windowsHide: true
		});
		const list = parseList(stdout.trim());
		return list === null ? /* @__PURE__ */ new Map() : candidatesByDisplay(list, displays);
	} catch (error) {
		require_protocol.log.warn(`[screenshot] window detection unavailable: ${error instanceof Error ? error.message : String(error)}`);
		return /* @__PURE__ */ new Map();
	}
}
//#endregion
Object.defineProperty(exports, "captureNativeScreenshotFrames", {
	enumerable: true,
	get: function() {
		return captureNativeScreenshotFrames;
	}
});
Object.defineProperty(exports, "configurePinnedScreenshot", {
	enumerable: true,
	get: function() {
		return configurePinnedScreenshot;
	}
});
Object.defineProperty(exports, "configureScreenshotOverlay", {
	enumerable: true,
	get: function() {
		return configureScreenshotOverlay;
	}
});
Object.defineProperty(exports, "encodeScreenshotBitmap", {
	enumerable: true,
	get: function() {
		return encodeScreenshotBitmap;
	}
});
Object.defineProperty(exports, "fakeCandidatesByDisplay", {
	enumerable: true,
	get: function() {
		return fakeCandidatesByDisplay;
	}
});
Object.defineProperty(exports, "listScreenshotWindows", {
	enumerable: true,
	get: function() {
		return listScreenshotWindows;
	}
});
Object.defineProperty(exports, "screenshotBitmapFrame", {
	enumerable: true,
	get: function() {
		return screenshotBitmapFrame;
	}
});
