const require_protocol = require("./protocol-r4z3gR8R.cjs");
const require_screenshot_windows = require("./screenshot-windows-DmeEaHMw.cjs");
let electron = require("electron");
let node_os = require("node:os");
let node_path = require("node:path");
let node_fs_promises = require("node:fs/promises");
let node_child_process = require("node:child_process");
let node_util = require("node:util");
//#region src/main/screenshot-diagnostics.ts
function edgeDifference(page, desktop) {
	const { width, height } = page.getSize();
	const other = desktop.getSize();
	if (width !== other.width || height !== other.height) return 1;
	const pixels = page.toBitmap();
	const screenPixels = desktop.toBitmap();
	let compared = 0;
	let different = 0;
	for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
		if (x >= 8 && x < width - 8 && y >= 8 && y < height - 8) continue;
		const offset = (y * width + x) * 4;
		compared++;
		if ([
			0,
			1,
			2
		].some((channel) => Math.abs(pixels[offset + channel] - screenPixels[offset + channel]) > 3)) different++;
	}
	return different / compared;
}
async function runScreenshotDiagnostics() {
	const directory = await (0, node_fs_promises.mkdtemp)((0, node_path.join)((0, node_os.tmpdir)(), "kimi-screenshot-diagnostics-"));
	electron.app.setPath("userData", (0, node_path.join)(directory, "user-data"));
	await electron.app.whenReady();
	electron.app.on("window-all-closed", () => {});
	let exitCode = 0;
	const fixtures = [];
	try {
		const permission = process.platform === "darwin" ? electron.systemPreferences.getMediaAccessStatus("screen") : "granted";
		if (permission !== "granted") throw new Error(`screen-permission:${permission}`);
		const displays = electron.screen.getAllDisplays();
		if (process.argv.includes("--screenshot-diagnostics-fixture")) {
			const display = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint());
			const origin = {
				x: display.workArea.x + 40,
				y: display.workArea.y + 40
			};
			for (const [index, rect] of [{
				...origin,
				width: 600,
				height: 500
			}, {
				x: origin.x + 140,
				y: origin.y + 110,
				width: 300,
				height: 220
			}].entries()) {
				const window = new electron.BrowserWindow({
					...rect,
					show: false,
					frame: index === 1,
					hasShadow: index === 1,
					backgroundColor: "#ffffff",
					title: "Screenshot diagnostics",
					webPreferences: { sandbox: true }
				});
				fixtures.push(window);
				if (process.platform === "darwin") await require_screenshot_windows.configureScreenshotOverlay(window);
				await window.loadURL("data:text/html,<html><body></body></html>");
				window.show();
			}
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
		const maxEdge = Math.max(...displays.map((display) => Math.max(display.bounds.width, display.bounds.height) * display.scaleFactor));
		const results = [];
		const modes = process.platform === "darwin" ? [
			"all-shadows",
			"electron",
			"default",
			"display-shadows"
		] : process.platform === "win32" ? [
			"electron",
			"electron-fast",
			"electron-bitmap"
		] : ["electron"];
		const candidates = await require_screenshot_windows.listScreenshotWindows(displays);
		if (process.platform === "win32") for (const fixture of fixtures) {
			const handle = fixture.getNativeWindowHandle();
			const id = (handle.length >= 8 ? handle.readBigUInt64LE() : BigInt(handle.readUInt32LE())).toString();
			if (![...candidates.values()].some((windows) => windows.some((window) => window.id === id))) throw new Error("diagnostics-own-window-missing");
		}
		const overlays = [];
		if (process.argv.includes("--screenshot-diagnostics-overlay")) {
			require_protocol.registerRendererProtocol(() => electron.app.isPackaged ? (0, node_path.join)(process.resourcesPath, "desktop-dist") : (0, node_path.join)(electron.app.getAppPath(), "desktop-dist"));
			const { initScreenshot, captureScreenshot, cancelScreenshotCapture } = await Promise.resolve().then(() => require("./screenshot-gqZU6x82.cjs"));
			initScreenshot();
			for (let attempt = 0; attempt < 3; attempt++) {
				if (attempt === 2) await new Promise((resolve) => setTimeout(resolve, 1800));
				const start = performance.now();
				const capture = captureScreenshot();
				try {
					let windows = [];
					while (performance.now() - start < 1e4) {
						windows = electron.BrowserWindow.getAllWindows().filter((window) => !fixtures.includes(window) && window.isVisible());
						if (windows.length === displays.length) break;
						await new Promise((resolve) => setTimeout(resolve, 20));
					}
					if (windows.length !== displays.length) throw new Error("diagnostics-overlay-timeout");
					const durationMs = Math.round(performance.now() - start);
					await new Promise((resolve) => setTimeout(resolve, 150));
					const frames = [];
					for (const [index, window] of windows.entries()) {
						const displayId = new URL(window.webContents.getURL()).searchParams.get("display");
						const display = displays.find((item) => String(item.id) === displayId);
						const contentBounds = window.getContentBounds();
						let native;
						if (process.platform === "win32") {
							const handle = window.getNativeWindowHandle();
							const hwnd = (handle.length >= 8 ? handle.readBigUInt64LE() : BigInt(handle.readUInt32LE())).toString();
							const executable = electron.app.isPackaged ? (0, node_path.join)(process.resourcesPath, "screenshot-window-list", "screenshot-window-list.exe") : (0, node_path.join)(electron.app.getAppPath(), "native", "screenshot-window-list", "dist", "screenshot-window-list.exe");
							const { stdout } = await (0, node_util.promisify)(node_child_process.execFile)(executable, [
								"inspect",
								hwnd,
								String(process.pid)
							], {
								windowsHide: true,
								timeout: 2e3
							});
							const inspection = JSON.parse(stdout);
							native = inspection;
							if (!inspection.covered) exitCode = 1;
						}
						const viewport = await window.webContents.executeJavaScript("({ width: innerWidth, height: innerHeight })");
						if (contentBounds.x !== display.bounds.x || contentBounds.y !== display.bounds.y || contentBounds.width !== display.bounds.width || contentBounds.height !== display.bounds.height || viewport.width !== display.bounds.width || viewport.height !== display.bounds.height) throw new Error("diagnostics-overlay-bounds-mismatch");
						const file = `overlay-${attempt}-${index}.png`;
						const page = await window.webContents.capturePage();
						const png = page.toPNG();
						await (0, node_fs_promises.writeFile)((0, node_path.join)(directory, file), png, {
							flag: "wx",
							mode: 384
						});
						const desktopFrame = (await electron.desktopCapturer.getSources({
							types: ["screen"],
							thumbnailSize: page.getSize()
						})).find((source) => source.display_id === displayId).thumbnail;
						const desktopFile = `desktop-${attempt}-${index}.png`;
						await (0, node_fs_promises.writeFile)((0, node_path.join)(directory, desktopFile), desktopFrame.toPNG(), {
							flag: "wx",
							mode: 384
						});
						const difference = edgeDifference(electron.nativeImage.createFromBuffer(png), desktopFrame);
						if (difference > .01) exitCode = 1;
						frames.push({
							bounds: window.getBounds(),
							contentBounds,
							viewport,
							native,
							edgeDifference: difference,
							file,
							desktopFile
						});
					}
					overlays.push({
						durationMs,
						frames
					});
				} finally {
					cancelScreenshotCapture();
					await capture;
				}
				await new Promise((resolve) => setTimeout(resolve, 150));
			}
		}
		for (const mode of modes) {
			const start = performance.now();
			try {
				let sourceDurationMs;
				let encodingDurationMs;
				let captured;
				let frames;
				if (mode === "electron" || mode === "electron-fast" || mode === "electron-bitmap") {
					captured = await electron.desktopCapturer.getSources({
						types: ["screen"],
						thumbnailSize: {
							width: maxEdge,
							height: maxEdge
						}
					});
					sourceDurationMs = Math.round(performance.now() - start);
					const encodingStart = performance.now();
					frames = await Promise.all(captured.map(async (source) => {
						const size = source.thumbnail.getSize();
						const data = mode === "electron-bitmap" ? require_screenshot_windows.screenshotBitmapFrame(source.thumbnail.toBitmap(), size.width, size.height) : mode === "electron-fast" ? await require_screenshot_windows.encodeScreenshotBitmap(source.thumbnail.toBitmap(), size.width, size.height) : source.thumbnail.toPNG();
						return {
							displayId: source.display_id,
							data
						};
					}));
					encodingDurationMs = Math.round(performance.now() - encodingStart);
				} else frames = (await require_screenshot_windows.captureNativeScreenshotFrames(mode)).map(({ displayId, png }) => ({
					displayId,
					data: png
				}));
				const durationMs = Math.round(performance.now() - start);
				let pixelsEqual = mode === "electron-fast" || mode === "electron-bitmap" ? true : void 0;
				const files = [];
				for (const [index, frame] of frames.entries()) {
					const file = `${mode}-${index}.${mode === "electron-bitmap" ? "bmp" : "png"}`;
					await (0, node_fs_promises.writeFile)((0, node_path.join)(directory, file), frame.data, {
						flag: "wx",
						mode: 384
					});
					let decoded;
					if (mode === "electron-bitmap") {
						const decoder = new electron.BrowserWindow({
							show: false,
							webPreferences: {
								sandbox: true,
								backgroundThrottling: false
							}
						});
						try {
							await decoder.loadFile((0, node_path.join)(directory, file));
							const png = await decoder.webContents.executeJavaScript(`(async () => {
                const image = document.querySelector('img');
                await image.decode();
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                canvas.getContext('2d').drawImage(image, 0, 0);
                return canvas.toDataURL('image/png');
              })()`);
							decoded = electron.nativeImage.createFromDataURL(png);
						} finally {
							decoder.destroy();
						}
					} else decoded = electron.nativeImage.createFromBuffer(frame.data);
					if (pixelsEqual !== void 0) pixelsEqual &&= decoded.toBitmap().equals(electron.nativeImage.createFromBuffer(captured[index].thumbnail.toPNG()).toBitmap());
					files.push({
						displayId: frame.displayId,
						...decoded.getSize(),
						file
					});
				}
				if (pixelsEqual === false) exitCode = 1;
				results.push({
					mode,
					durationMs,
					sourceDurationMs,
					encodingDurationMs,
					pixelsEqual,
					frames: files
				});
			} catch (error) {
				exitCode = 1;
				results.push({
					mode,
					durationMs: Math.round(performance.now() - start),
					frames: [],
					error: error instanceof Error ? error.message : String(error)
				});
			}
		}
		const report = {
			electron: process.versions.electron,
			chrome: process.versions.chrome,
			fixtures: fixtures.map((window) => window.getBounds()),
			displays: displays.map(({ id, bounds, scaleFactor }) => ({
				id,
				bounds,
				scaleFactor
			})),
			results,
			overlays
		};
		await (0, node_fs_promises.writeFile)((0, node_path.join)(directory, "report.json"), JSON.stringify(report, null, 2), {
			flag: "wx",
			mode: 384
		});
		process.stdout.write(`${JSON.stringify({
			directory,
			...report
		})}\n`);
	} catch (error) {
		exitCode = 1;
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	} finally {
		for (const window of fixtures) if (!window.isDestroyed()) window.destroy();
		electron.app.exit(exitCode);
	}
}
//#endregion
exports.runScreenshotDiagnostics = runScreenshotDiagnostics;
