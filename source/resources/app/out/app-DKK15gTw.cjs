const require_protocol = require("./protocol-r4z3gR8R.cjs");
const require_release_channel = require("./release-channel-DelUHOC7.cjs");
const require_main = require("./main.cjs");
const require_coerce = require("./coerce-C-b5JtTy.cjs");
const require_screenshot = require("./screenshot-gqZU6x82.cjs");
let electron = require("electron");
let node_fs = require("node:fs");
let node_os = require("node:os");
let node_path = require("node:path");
let node_fs_promises = require("node:fs/promises");
let node_child_process = require("node:child_process");
let node_util = require("node:util");
let node_url = require("node:url");
let electron_updater = require("electron-updater");
//#region src/main/taskbar.ts
const BADGE_RGB = {
	r: 229,
	g: 72,
	b: 77
};
const BADGE_GLYPHS = {
	"0": [
		"111",
		"101",
		"101",
		"101",
		"111"
	],
	"1": [
		"010",
		"110",
		"010",
		"010",
		"111"
	],
	"2": [
		"111",
		"001",
		"111",
		"100",
		"111"
	],
	"3": [
		"111",
		"001",
		"111",
		"001",
		"111"
	],
	"4": [
		"101",
		"101",
		"111",
		"001",
		"001"
	],
	"5": [
		"111",
		"100",
		"111",
		"001",
		"111"
	],
	"6": [
		"111",
		"100",
		"111",
		"101",
		"111"
	],
	"7": [
		"111",
		"001",
		"010",
		"010",
		"010"
	],
	"8": [
		"111",
		"101",
		"111",
		"101",
		"111"
	],
	"9": [
		"111",
		"101",
		"111",
		"001",
		"111"
	],
	"+": [
		"000",
		"010",
		"111",
		"010",
		"000"
	]
};
function badgeText(total) {
	if (total <= 0) return "";
	return total > 99 ? "99+" : String(Math.floor(total));
}
function roundedRectCoverage(pixelX, pixelY, box, scale) {
	const centerX = Math.min(Math.max(pixelX, box.x + box.radius), box.x + box.width - box.radius);
	const centerY = Math.min(Math.max(pixelY, box.y + box.radius), box.y + box.height - box.radius);
	const distance = Math.hypot(pixelX - centerX, pixelY - centerY);
	return Math.max(0, Math.min(1, (box.radius - distance) * scale + .5));
}
function badgePixels(size, total) {
	const pixels = Buffer.alloc(size * size * 4, 0);
	const text = badgeText(total);
	if (text === "") return pixels;
	const scale = size / 16;
	const textWidth = text.length * 3 + text.length - 1;
	const boxWidth = Math.max(10, textWidth + 4);
	const box = {
		x: (16 - boxWidth) / 2,
		y: 3,
		width: boxWidth,
		height: 10,
		radius: 5
	};
	for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
		const coverage = roundedRectCoverage((x + .5) / scale, (y + .5) / scale, box, scale);
		if (coverage === 0) continue;
		const offset = (y * size + x) * 4;
		pixels[offset] = Math.round(BADGE_RGB.b * coverage);
		pixels[offset + 1] = Math.round(BADGE_RGB.g * coverage);
		pixels[offset + 2] = Math.round(BADGE_RGB.r * coverage);
		pixels[offset + 3] = Math.round(255 * coverage);
	}
	const textX = Math.floor((16 - textWidth) / 2);
	const textY = 5;
	for (let charIndex = 0; charIndex < text.length; charIndex++) {
		const glyph = BADGE_GLYPHS[text[charIndex]];
		if (glyph === void 0) continue;
		for (let glyphY = 0; glyphY < glyph.length; glyphY++) for (let glyphX = 0; glyphX < 3; glyphX++) {
			if (glyph[glyphY][glyphX] !== "1") continue;
			const startX = (textX + charIndex * 4 + glyphX) * scale;
			const startY = (textY + glyphY) * scale;
			for (let py = startY; py < startY + scale; py++) for (let px = startX; px < startX + scale; px++) {
				const offset = (py * size + px) * 4;
				pixels[offset] = 255;
				pixels[offset + 1] = 255;
				pixels[offset + 2] = 255;
				pixels[offset + 3] = 255;
			}
		}
	}
	return pixels;
}
function createBadgeImage(total) {
	try {
		const image = electron.nativeImage.createFromBitmap(badgePixels(16, total), {
			width: 16,
			height: 16
		});
		image.addRepresentation({
			scaleFactor: 2,
			width: 32,
			height: 32,
			buffer: badgePixels(32, total)
		});
		return image.isEmpty() ? null : image;
	} catch {
		return null;
	}
}
function createTaskbarAttention(win, badgeForTotal) {
	let lastTotal = null;
	win.on("focus", () => win.flashFrame(false));
	return { update(total, description) {
		if (win.isDestroyed()) return;
		if (total > 0) {
			const badge = badgeForTotal(total);
			if (badge !== null) win.setOverlayIcon(badge, description);
			else win.setOverlayIcon(null, "");
		} else win.setOverlayIcon(null, "");
		if (lastTotal !== null && total > lastTotal && !win.isFocused()) win.flashFrame(true);
		if (total === 0) win.flashFrame(false);
		lastTotal = total;
	} };
}
const cachedBadges = /* @__PURE__ */ new Map();
let badgeWarningShown = false;
let controller = null;
let controllerWindow = null;
function badgeForTotal(total) {
	const key = badgeText(total);
	if (!cachedBadges.has(key)) cachedBadges.set(key, createBadgeImage(total));
	const badge = cachedBadges.get(key) ?? null;
	if (badge === null && !badgeWarningShown) {
		badgeWarningShown = true;
		console.warn("[taskbar] badge image creation failed, overlay icon disabled");
	}
	return badge;
}
function setTaskbarAttention(total, description) {
	if (process.platform !== "win32") return;
	const win = require_screenshot.getMainWindow();
	if (win === null || win.isDestroyed()) return;
	if (controllerWindow !== win || controller === null) {
		controller = createTaskbarAttention(win, badgeForTotal);
		controllerWindow = win;
	}
	controller.update(total, description);
}
//#endregion
//#region src/main/tray.ts
function trayIconPath(env) {
	const name = env.platform === "darwin" ? "trayTemplate.png" : env.platform === "win32" ? "tray.ico" : "tray.png";
	return (0, node_path.join)(env.isPackaged ? env.resourcesPath : env.appPath, "build", name);
}
const ZERO_ATTENTION = {
	unread: 0,
	approvals: 0,
	questions: 0,
	items: []
};
const MAX_MENU_ITEMS = 8;
const MAX_ITEMS = 50;
function asCount(value) {
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
	return Math.min(Math.floor(value), 999);
}
function asTrayAttentionItem(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.sessionId !== "string" || candidate.sessionId === "" || typeof candidate.title !== "string" || typeof candidate.unread !== "boolean") return null;
	const approvals = asCount(candidate.approvals);
	const questions = asCount(candidate.questions);
	if (approvals === null || questions === null) return null;
	return {
		sessionId: candidate.sessionId,
		title: candidate.title,
		unread: candidate.unread,
		approvals,
		questions
	};
}
function asTrayAttention(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	const unread = asCount(candidate.unread);
	const approvals = asCount(candidate.approvals);
	const questions = asCount(candidate.questions);
	if (unread === null || approvals === null || questions === null || !Array.isArray(candidate.items)) return null;
	const items = [];
	for (const raw of candidate.items.slice(0, MAX_ITEMS)) {
		const item = asTrayAttentionItem(raw);
		if (item === null) return null;
		items.push(item);
	}
	return {
		unread,
		approvals,
		questions,
		items
	};
}
function trayAttentionTitle(attention) {
	const total = attention.unread + attention.approvals + attention.questions;
	return total > 0 ? String(total) : "";
}
function dockBadgeText(attention) {
	const total = attention.unread + attention.approvals + attention.questions;
	return total > 0 ? String(total) : "";
}
const TRAY_STRINGS = {
	zh: {
		pending: "待处理",
		openApp: "打开 Kimi Code",
		quit: "退出",
		unnamedSession: "未命名会话",
		moreOverflow: (rest) => `还有 ${rest} 条待处理…`,
		unreadPart: (n) => `${n} 条未读`,
		approvalsPart: (n) => `${n} 个待审批`,
		questionsPart: (n) => `${n} 个待回答`,
		itemApprovalsSuffix: (n) => `${n} 待审批`,
		itemQuestionsSuffix: (n) => `${n} 待回答`
	},
	en: {
		pending: "Pending",
		openApp: "Open Kimi Code",
		quit: "Quit",
		unnamedSession: "Untitled session",
		moreOverflow: (rest) => `${rest} more…`,
		unreadPart: (n) => `${n} unread`,
		approvalsPart: (n) => `${n} to approve`,
		questionsPart: (n) => `${n} to answer`,
		itemApprovalsSuffix: (n) => `${n} to approve`,
		itemQuestionsSuffix: (n) => `${n} to answer`
	}
};
function osTrayLocale() {
	try {
		return electron.app.getLocale().toLowerCase().startsWith("zh") ? "zh" : "en";
	} catch {
		return "en";
	}
}
let trayLocale = null;
function effectiveTrayLocale() {
	return trayLocale ?? osTrayLocale();
}
function trayAttentionSummary(attention, locale) {
	const strings = TRAY_STRINGS[locale];
	const parts = [];
	if (attention.unread > 0) parts.push(strings.unreadPart(attention.unread));
	if (attention.approvals > 0) parts.push(strings.approvalsPart(attention.approvals));
	if (attention.questions > 0) parts.push(strings.questionsPart(attention.questions));
	return parts.join(" · ");
}
function trayAttentionItemLabel(item, locale) {
	const strings = TRAY_STRINGS[locale];
	const title = item.title.replace(/\s+/g, " ").trim();
	const clipped = title === "" ? strings.unnamedSession : title.length > 32 ? `${title.slice(0, 32)}…` : title;
	const parts = [];
	if (item.approvals > 0) parts.push(strings.itemApprovalsSuffix(item.approvals));
	if (item.questions > 0) parts.push(strings.itemQuestionsSuffix(item.questions));
	return parts.length > 0 ? `${clipped} · ${parts.join(" · ")}` : clipped;
}
function buildTrayMenu(actions, attention, locale) {
	const strings = TRAY_STRINGS[locale];
	const pendingCount = attention.unread + attention.approvals + attention.questions;
	const template = [];
	if (attention.items.length > 0) {
		template.push({
			label: strings.pending,
			enabled: false
		});
		for (const item of attention.items.slice(0, MAX_MENU_ITEMS)) template.push({
			label: trayAttentionItemLabel(item, locale),
			click: () => {
				require_protocol.trackDesktopEvent("tray_action", {
					action: "open-session",
					pending_count: pendingCount
				});
				actions.openSession(item.sessionId);
			}
		});
		const rest = attention.items.length - MAX_MENU_ITEMS;
		if (rest > 0) template.push({
			label: strings.moreOverflow(rest),
			click: () => {
				require_protocol.trackDesktopEvent("tray_action", {
					action: "show-window",
					pending_count: pendingCount
				});
				actions.showMainWindow();
			}
		});
		template.push({ type: "separator" });
	} else {
		const summary = trayAttentionSummary(attention, locale);
		if (summary !== "") template.push({
			label: summary,
			enabled: false
		}, { type: "separator" });
	}
	template.push({
		label: strings.openApp,
		click: () => {
			require_protocol.trackDesktopEvent("tray_action", {
				action: "show-window",
				pending_count: pendingCount
			});
			actions.showMainWindow();
		}
	}, { type: "separator" }, {
		label: strings.quit,
		click: () => {
			require_protocol.trackDesktopEvent("tray_action", {
				action: "quit",
				pending_count: pendingCount
			});
			actions.quit();
		}
	});
	return electron.Menu.buildFromTemplate(template);
}
let tray = null;
let trayActions = null;
let lastAttention = ZERO_ATTENTION;
function createTray(actions) {
	const iconPath = trayIconPath({
		platform: process.platform,
		isPackaged: electron.app.isPackaged,
		resourcesPath: process.resourcesPath,
		appPath: electron.app.getAppPath()
	});
	const image = electron.nativeImage.createFromPath(iconPath);
	if (image.isEmpty()) {
		console.warn("[tray] icon not found, tray disabled:", iconPath);
		return null;
	}
	if (process.platform === "darwin") image.setTemplateImage(true);
	tray = new electron.Tray(image);
	trayActions = actions;
	lastAttention = ZERO_ATTENTION;
	require_protocol.setRuntimeLocale(effectiveTrayLocale());
	renderTray();
	if (process.platform === "win32") {
		const showFromTray = () => {
			require_protocol.trackDesktopEvent("tray_action", {
				action: "show-window",
				pending_count: lastAttention.unread + lastAttention.approvals + lastAttention.questions
			});
			actions.showMainWindow();
		};
		tray.on("click", showFromTray);
		tray.on("double-click", () => actions.showMainWindow());
	}
	return tray;
}
function renderTray() {
	if (tray === null || trayActions === null) return;
	const locale = effectiveTrayLocale();
	if (process.platform === "darwin") {
		const title = trayAttentionTitle(lastAttention);
		tray.setTitle(electron.app.isPackaged ? title : `dev${title}`, { fontType: "monospacedDigit" });
	}
	electron.app.dock?.setBadge(dockBadgeText(lastAttention));
	const summary = trayAttentionSummary(lastAttention, locale);
	tray.setToolTip(summary === "" ? "Kimi Code" : `Kimi Code — ${summary}`);
	tray.setContextMenu(buildTrayMenu(trayActions, lastAttention, locale));
}
function setTrayAttention(attention) {
	lastAttention = attention;
	renderTray();
	syncTaskbarAttention();
}
function setTrayLocale(locale) {
	if (locale === trayLocale) return;
	trayLocale = locale;
	require_protocol.setRuntimeLocale(locale);
	renderTray();
	syncTaskbarAttention();
}
function syncTaskbarAttention() {
	setTaskbarAttention(lastAttention.unread + lastAttention.approvals + lastAttention.questions, trayAttentionSummary(lastAttention, effectiveTrayLocale()));
}
function destroyTray() {
	tray?.destroy();
	tray = null;
	trayActions = null;
}
//#endregion
//#region src/main/dock-icon.ts
function dockIconPath(env) {
	return (0, node_path.join)(env.isPackaged ? env.resourcesPath : env.appPath, "build", env.isDark ? "icon-dark.png" : "icon.png");
}
function isDockIconChoice(value) {
	return value === "light" || value === "dark";
}
let currentChoice = "light";
function setDockIconChoice(choice) {
	currentChoice = choice;
	require_screenshot.saveDockIconChoice(choice);
	applyDockIcon();
}
function applyDockIcon() {
	if (process.platform !== "darwin") return;
	electron.app.dock?.setIcon(electron.nativeImage.createFromPath(dockIconPath({
		isPackaged: electron.app.isPackaged,
		resourcesPath: process.resourcesPath,
		appPath: electron.app.getAppPath(),
		isDark: currentChoice === "dark"
	})));
}
function initDockIcon() {
	if (process.platform !== "darwin") return;
	currentChoice = require_screenshot.getDockIconChoice() ?? "light";
	applyDockIcon();
}
//#endregion
//#region src/main/shortcuts.ts
const registrations = /* @__PURE__ */ new Map([["summonApp", {
	binding: null,
	accelerator: null
}], ["captureScreenshot", {
	binding: null,
	accelerator: null
}]]);
const deferredBindings = /* @__PURE__ */ new Map();
let recordingSuspended = false;
let terminalSuspended = false;
function isSuspended(action) {
	return recordingSuspended || terminalSuspended && action === "summonApp";
}
function invokeAction(action) {
	require_protocol.trackDesktopEvent("global_shortcut_invoked", { action });
	if (action === "summonApp") {
		require_screenshot.showMainWindow();
		return;
	}
	require_screenshot.noteHotkeyTrigger(require_screenshot.getMainWindow()?.isVisible() ?? false);
	require_screenshot.sendToRenderer(require_screenshot.IPC.screenshotHotkey, null);
}
function deactivateAll() {
	for (const [action, registration] of registrations) {
		if (!isSuspended(action)) continue;
		if (registration.accelerator !== null) {
			electron.globalShortcut.unregister(registration.accelerator);
			registration.accelerator = null;
		}
	}
}
function activate(action, binding) {
	if (action === "captureScreenshot" && !require_release_channel.isScreenshotShortcutEnabled(electron.app.getVersion())) {
		require_protocol.log.warn(`[kimi-desktop] screenshot global shortcut is disabled on this build (${electron.app.getVersion()})`);
		return false;
	}
	const accelerator = require_screenshot.bindingToAccelerator(binding);
	if (accelerator === void 0) {
		require_protocol.log.warn(`[kimi-desktop] global shortcut binding ${binding} cannot be expressed as an accelerator`);
		require_protocol.trackDesktopEvent("global_shortcut_register_failed", {
			action,
			reason: "invalid"
		});
		return false;
	}
	const registration = registrations.get(action);
	if (accelerator === registration.accelerator) return true;
	if (!electron.globalShortcut.register(accelerator, () => invokeAction(action))) {
		require_protocol.log.warn(`[kimi-desktop] global shortcut ${accelerator} not registered (already taken)`);
		require_protocol.trackDesktopEvent("global_shortcut_register_failed", {
			action,
			reason: "conflicted"
		});
		return false;
	}
	if (registration.accelerator !== null) electron.globalShortcut.unregister(registration.accelerator);
	registration.accelerator = accelerator;
	return true;
}
function setGlobalShortcutForAction(action, binding) {
	if (isSuspended(action)) {
		deferredBindings.set(action, binding);
		return true;
	}
	const registration = registrations.get(action);
	if (binding === null) {
		registration.binding = null;
		if (registration.accelerator !== null) {
			electron.globalShortcut.unregister(registration.accelerator);
			registration.accelerator = null;
		}
		return true;
	}
	if (activate(action, binding)) {
		registration.binding = binding;
		return true;
	}
	return false;
}
function resumeIfUnsuspended() {
	let allOk = true;
	for (const [action, registration] of registrations) {
		if (isSuspended(action)) continue;
		if (!deferredBindings.has(action)) {
			if (registration.binding !== null && !activate(action, registration.binding)) allOk = false;
			continue;
		}
		const deferred = deferredBindings.get(action) ?? null;
		deferredBindings.delete(action);
		if (deferred === null) {
			registration.binding = null;
			continue;
		}
		if (activate(action, deferred)) {
			registration.binding = deferred;
			continue;
		}
		allOk = false;
		if (registration.binding !== null) activate(action, registration.binding);
	}
	return allOk;
}
function setGlobalShortcutSuspended(nextSuspended) {
	if (recordingSuspended === nextSuspended) return true;
	recordingSuspended = nextSuspended;
	if (recordingSuspended) {
		deactivateAll();
		return true;
	}
	return resumeIfUnsuspended();
}
function setGlobalShortcutTerminalFocus(focused) {
	if (terminalSuspended === focused) return;
	terminalSuspended = focused;
	if (terminalSuspended) {
		deactivateAll();
		return;
	}
	resumeIfUnsuspended();
}
function unregisterGlobalShortcuts() {
	deferredBindings.clear();
	electron.globalShortcut.unregisterAll();
	for (const registration of registrations.values()) registration.accelerator = null;
}
//#endregion
//#region src/main/browser-system-permissions.ts
const MEDIA_ACCESS_KINDS = {
	camera: "camera",
	microphone: "microphone"
};
const SETTINGS_URLS = {
	darwin: {
		camera: "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera",
		microphone: "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"
	},
	win32: {
		camera: "ms-settings:privacy-webcam",
		microphone: "ms-settings:privacy-microphone"
	}
};
function getBrowserSystemPermissionDenials() {
	if (process.platform !== "darwin" && process.platform !== "win32") return [];
	const denials = [];
	for (const [permission, mediaType] of Object.entries(MEDIA_ACCESS_KINDS)) {
		const status = electron.systemPreferences.getMediaAccessStatus(mediaType);
		if (status === "denied" || status === "restricted") denials.push(permission);
	}
	return denials;
}
async function openBrowserSystemPermissionSettings(permission) {
	const url = SETTINGS_URLS[process.platform]?.[permission];
	if (url === void 0) throw new Error(`No system settings page for "${permission}" on ${process.platform}`);
	await electron.shell.openExternal(url);
}
//#endregion
//#region src/main/browser-local-file.ts
const HTML_EXTENSIONS = /* @__PURE__ */ new Set([".html", ".htm"]);
const STAT_TIMEOUT_MS = 1e4;
var BrowserLocalFileError = class extends Error {
	constructor(message) {
		super(`browser-open-local-file: ${message}`);
		this.name = "BrowserLocalFileError";
	}
};
function localTarget(target) {
	if (!/^file:/i.test(target)) return {
		path: target,
		suffix: ""
	};
	try {
		const url = new URL(target);
		return {
			path: (0, node_url.fileURLToPath)(url),
			suffix: `${url.search}${url.hash}`
		};
	} catch {
		throw new BrowserLocalFileError("invalid file URL");
	}
}
async function statIsFile(path) {
	const settled = await Promise.race([(0, node_fs_promises.stat)(path).then((result) => ({
		timedOut: false,
		isFile: result.isFile()
	}), () => ({
		timedOut: false,
		isFile: null
	})), new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), STAT_TIMEOUT_MS))]);
	if (settled.timedOut) throw new BrowserLocalFileError("file validation timed out");
	if (settled.isFile === null) throw new BrowserLocalFileError("file not found");
	if (!settled.isFile) throw new BrowserLocalFileError("not a file");
	return true;
}
async function resolveLocalHtmlFileUrl(target, urlSuffix = "") {
	if (urlSuffix !== "" && !urlSuffix.startsWith("?") && !urlSuffix.startsWith("#")) throw new BrowserLocalFileError("invalid URL suffix");
	const { path: raw, suffix } = localTarget(target.trim());
	if (raw.includes("\0") || !(0, node_path.isAbsolute)(raw)) throw new BrowserLocalFileError("path must be absolute");
	const path = (0, node_path.resolve)(raw);
	if (!HTML_EXTENSIONS.has((0, node_path.extname)(path).toLowerCase())) throw new BrowserLocalFileError("not an HTML file");
	if (!await statIsFile(path)) throw new BrowserLocalFileError("file not found");
	const url = `${(0, node_url.pathToFileURL)(path).href}${suffix}${urlSuffix}`;
	if (url.length > 4096) throw new BrowserLocalFileError("path is too long");
	return url;
}
//#endregion
//#region src/main/local-pages-policy.ts
const SENTINEL = Buffer.from("dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX");
const FUSE_WIRE_VERSION = 1;
const GRANT_FILE_PROTOCOL_EXTRA_PRIVILEGES = 7;
const FUSE_DISABLED = 48;
const WIRE_BYTES = SENTINEL.length + 2 + GRANT_FILE_PROTOCOL_EXTRA_PRIVILEGES + 1;
const UNSAFE_LOCAL_PAGES_ENV = "KIMI_DESKTOP_UNSAFE_LOCAL_PAGES";
const FUSE_READ_TIMEOUT_MS = 1e4;
function electronFuseBinary(execPath, platform) {
	if (platform !== "darwin") return execPath;
	return (0, node_path.resolve)((0, node_path.dirname)(execPath), "..", "Frameworks", "Electron Framework.framework", "Electron Framework");
}
async function fileProtocolPrivilegesDisabled(binary, chunkSize = 1 << 20) {
	const handle = await (0, node_fs_promises.open)(binary, "r");
	try {
		let carry = Buffer.alloc(0);
		let position = 0;
		let found = false;
		for (;;) {
			const chunk = Buffer.alloc(chunkSize);
			const { bytesRead } = await handle.read(chunk, 0, chunkSize, position);
			if (bytesRead === 0) break;
			position += bytesRead;
			const data = Buffer.concat([carry, chunk.subarray(0, bytesRead)]);
			for (let index = data.indexOf(SENTINEL); index !== -1 && index + WIRE_BYTES <= data.length; index = data.indexOf(SENTINEL, index + 1)) {
				const wire = index + SENTINEL.length;
				if (data[wire] !== FUSE_WIRE_VERSION || data[wire + 1] <= GRANT_FILE_PROTOCOL_EXTRA_PRIVILEGES) return false;
				if (data[wire + 2 + GRANT_FILE_PROTOCOL_EXTRA_PRIVILEGES] !== FUSE_DISABLED) return false;
				found = true;
			}
			carry = Buffer.from(data.subarray(Math.max(0, data.length - WIRE_BYTES + 1)));
		}
		return found;
	} finally {
		await handle.close();
	}
}
function createLocalPagesPolicy(options) {
	let decision = null;
	let privileges = true;
	const allowed = () => {
		decision ??= decide(options, (value) => {
			privileges = value;
		});
		return decision;
	};
	return Object.assign(allowed, { extraPrivileges: () => privileges });
}
async function readFuseWithin(options) {
	const readFuse = options.readFuse ?? fileProtocolPrivilegesDisabled;
	let timer;
	try {
		return await Promise.race([readFuse(electronFuseBinary(options.execPath, options.platform)).catch(() => false), new Promise((resolve) => {
			timer = setTimeout(() => {
				options.warn(`[kimi-desktop] reading the grantFileProtocolExtraPrivileges fuse timed out after ${FUSE_READ_TIMEOUT_MS}ms: local HTML pages stay off for this run`);
				resolve(false);
			}, FUSE_READ_TIMEOUT_MS);
		})]);
	} finally {
		clearTimeout(timer);
	}
}
async function decide(options, keepPrivileges) {
	if (options.isPackaged) {
		if (await readFuseWithin(options)) {
			keepPrivileges(false);
			return true;
		}
	}
	if (options.env["KIMI_DESKTOP_UNSAFE_LOCAL_PAGES"] !== "1") return false;
	options.warn(`[kimi-desktop] ${UNSAFE_LOCAL_PAGES_ENV}=1: local HTML pages run with Electron's extra file:// privileges and can read other local files. This flag cannot reproduce shipped file:// behaviour, because grantFileProtocolExtraPrivileges is a build-time property of the binary: module scripts, workers, cross-frame DOM access, canvas tainting, service workers and storage all behave differently here than in a packaged build. See docs/browsers/local-pages-file-protocol.md`);
	return true;
}
//#endregion
//#region src/main/win-registry.ts
const CMD_EXE = "cmd.exe";
const REG_EXE = "reg.exe";
const QUERY_TIMEOUT_MS = 2e3;
function buildRegQueryCommand(args) {
	const quoted = args.map((arg) => arg.includes(" ") ? `"${arg}"` : arg);
	return `chcp 65001>nul & ${REG_EXE} ${quoted.join(" ")}`;
}
function runRegQuery(args) {
	return new Promise((resolve) => {
		let child;
		try {
			child = (0, node_child_process.spawn)(CMD_EXE, ["/c", buildRegQueryCommand(args)], {
				stdio: [
					"ignore",
					"pipe",
					"ignore"
				],
				windowsHide: true
			});
		} catch {
			resolve(null);
			return;
		}
		const chunks = [];
		let settled = false;
		const finish = (value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve(value);
		};
		const timer = setTimeout(() => {
			child.kill();
			finish(null);
		}, QUERY_TIMEOUT_MS);
		child.stdout?.on("data", (chunk) => {
			chunks.push(chunk);
		});
		child.once("error", () => finish(null));
		child.once("close", (code) => finish(code === 0 ? Buffer.concat(chunks).toString("utf-8") : null));
	});
}
function parseRegOutput(output) {
	for (const line of output.split(/\r?\n/)) {
		const value = /REG_(?:SZ|EXPAND_SZ)\s+(.+?)\s*$/.exec(line.trimEnd())?.[1];
		if (value !== void 0) return value;
	}
	return null;
}
function createRegQuery(run = runRegQuery) {
	const cache = /* @__PURE__ */ new Map();
	return (key, valueName) => {
		const cacheKey = `${key}::${valueName ?? ""}`;
		const cached = cache.get(cacheKey);
		if (cached !== void 0) return cached;
		const result = run(valueName === null ? [
			"query",
			key,
			"/ve"
		] : [
			"query",
			key,
			"/v",
			valueName
		]).then((output) => output === null ? null : parseRegOutput(output));
		cache.set(cacheKey, result);
		result.then((value) => {
			if (value === null) cache.delete(cacheKey);
		});
		return result;
	};
}
const queryRegValue = createRegQuery();
//#endregion
//#region src/main/open-in.ts
const APP_SPECS = [
	{
		id: "vscode",
		label: "VS Code",
		bundleName: "Visual Studio Code.app"
	},
	{
		id: "vscode-insiders",
		label: "VS Code Insiders",
		bundleName: "Visual Studio Code - Insiders.app"
	},
	{
		id: "cursor",
		label: "Cursor",
		bundleName: "Cursor.app"
	},
	{
		id: "zed",
		label: "Zed",
		bundleName: "Zed.app"
	},
	{
		id: "finder",
		label: "Finder"
	},
	{
		id: "terminal",
		label: "Terminal",
		bundleId: "com.apple.Terminal"
	},
	{
		id: "iterm",
		label: "iTerm2",
		bundleName: "iTerm.app"
	},
	{
		id: "ghostty",
		label: "Ghostty",
		bundleName: "Ghostty.app"
	},
	{
		id: "warp",
		label: "Warp",
		bundleName: "Warp.app"
	},
	{
		id: "kitty",
		label: "kitty",
		bundleName: "kitty.app"
	},
	{
		id: "xcode",
		label: "Xcode",
		bundleName: "Xcode.app"
	}
];
const BROWSER_SPECS = [
	{
		id: "chrome",
		label: "Chrome",
		bundleName: "Google Chrome.app"
	},
	{
		id: "safari",
		label: "Safari",
		bundleName: "Safari.app"
	},
	{
		id: "arc",
		label: "Arc",
		bundleName: "Arc.app"
	},
	{
		id: "edge",
		label: "Edge",
		bundleName: "Microsoft Edge.app"
	},
	{
		id: "firefox",
		label: "Firefox",
		bundleName: "Firefox.app"
	},
	{
		id: "brave",
		label: "Brave",
		bundleName: "Brave Browser.app"
	}
];
const PREVIEW_SPEC = {
	id: "preview",
	label: "Preview",
	bundleName: "Preview.app"
};
const BROWSER_FILE_EXTS = /* @__PURE__ */ new Set([
	".html",
	".htm",
	".svg"
]);
const PREVIEW_FILE_EXTS = /* @__PURE__ */ new Set([
	".pdf",
	".png",
	".jpg",
	".jpeg",
	".jfif",
	".gif",
	".webp",
	".bmp",
	".tiff",
	".tif",
	".ico",
	".heic",
	".avif"
]);
const WIN_IMAGE_FILE_EXTS = /* @__PURE__ */ new Set([
	".png",
	".jpg",
	".jpeg",
	".jfif",
	".gif",
	".webp",
	".bmp",
	".ico",
	".avif"
]);
const WIN_BROWSER_FILE_EXTS = /* @__PURE__ */ new Set([
	...BROWSER_FILE_EXTS,
	".pdf",
	...WIN_IMAGE_FILE_EXTS
]);
const EDITOR_IDS = /* @__PURE__ */ new Set([
	"vscode",
	"vscode-insiders",
	"cursor",
	"zed",
	"xcode"
]);
function defaultExists(path) {
	if ((0, node_fs.existsSync)(path)) return true;
	try {
		(0, node_fs.lstatSync)(path);
		return true;
	} catch {
		return false;
	}
}
function resolveBundlePath(spec, exists, home) {
	if (spec.bundleName === void 0) return null;
	for (const dir of [
		"/Applications",
		"/System/Applications",
		(0, node_path.join)(home, "Applications")
	]) {
		const candidate = (0, node_path.join)(dir, spec.bundleName);
		if (exists(candidate)) return candidate;
	}
	return null;
}
function isSystemProvided(spec) {
	return spec.id === "finder" || spec.bundleId !== void 0;
}
function fileExtension(filePath) {
	return filePath === void 0 ? "" : (0, node_path.extname)(filePath).toLowerCase();
}
function detectMacBrowsers(exists, home) {
	return BROWSER_SPECS.filter((spec) => resolveBundlePath(spec, exists, home) !== null).map((spec) => ({
		id: spec.id,
		label: spec.label,
		preferred: true
	}));
}
function detectMacFileExtras(ext, exists, home) {
	if (BROWSER_FILE_EXTS.has(ext)) return detectMacBrowsers(exists, home);
	if (PREVIEW_FILE_EXTS.has(ext)) {
		const preview = resolveBundlePath(PREVIEW_SPEC, exists, home) === null ? [] : [{
			id: PREVIEW_SPEC.id,
			label: PREVIEW_SPEC.label,
			preferred: true
		}];
		return ext === ".pdf" ? [...preview, ...detectMacBrowsers(exists, home)] : preview;
	}
	return [];
}
function dropEditorsForPdf(ext, apps) {
	return ext === ".pdf" ? apps.filter((app) => !EDITOR_IDS.has(app.id)) : apps;
}
async function listAvailableOpenInApps(deps = {}) {
	const platform = deps.platform ?? process.platform;
	if (platform === "win32") {
		const env = deps.env ?? process.env;
		const exists = deps.exists ?? defaultExists;
		const queryReg = deps.queryReg ?? queryRegValue;
		const detect = async (specs, preferred) => {
			return (await Promise.all(specs.map(async (spec) => {
				if (await spec.resolve(env, exists, queryReg) === null) return null;
				return preferred ? {
					id: spec.id,
					label: spec.label,
					preferred: true
				} : {
					id: spec.id,
					label: spec.label
				};
			}))).filter((info) => info !== null);
		};
		const base = await detect(WINDOWS_APP_SPECS, false);
		const ext = fileExtension(deps.filePath);
		if (!WIN_BROWSER_FILE_EXTS.has(ext)) return base;
		return [...await detect(WINDOWS_BROWSER_SPECS, true), ...dropEditorsForPdf(ext, base)];
	}
	if (platform !== "darwin") return [];
	const exists = deps.exists ?? node_fs.existsSync;
	const home = deps.home ?? (0, node_os.homedir)();
	const available = [];
	for (const spec of APP_SPECS) if (isSystemProvided(spec) || resolveBundlePath(spec, exists, home) !== null) available.push({
		id: spec.id,
		label: spec.label
	});
	const ext = fileExtension(deps.filePath);
	return [...detectMacFileExtras(ext, exists, home), ...dropEditorsForPdf(ext, available)];
}
const OPEN_IN_DIR_ENV = "KIMI_CODE_OPEN_IN_DIR";
function firstExisting(paths, exists) {
	for (const candidate of paths) if (exists(candidate)) return candidate;
	return null;
}
function editorExeCandidates(env, ...suffixes) {
	const roots = [
		env["LOCALAPPDATA"] === void 0 ? void 0 : (0, node_path.join)(env["LOCALAPPDATA"], "Programs"),
		env["ProgramFiles"],
		env["ProgramFiles(x86)"]
	].filter((root) => root !== void 0);
	const candidates = [];
	for (const suffix of suffixes) for (const root of roots) candidates.push((0, node_path.join)(root, suffix));
	return candidates;
}
function pathExeCandidates(env, executable) {
	return (env["Path"] ?? env["PATH"] ?? "").split(";").filter((entry) => entry !== "").map((entry) => (0, node_path.join)(entry, executable));
}
function terminalCommand(env, exists) {
	const wt = firstExisting([...env["LOCALAPPDATA"] === void 0 ? [] : [(0, node_path.join)(env["LOCALAPPDATA"], "Microsoft", "WindowsApps", "wt.exe")], ...pathExeCandidates(env, "wt.exe")], exists);
	if (wt !== null) return wt;
	return (0, node_path.join)(env["SystemRoot"] ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
}
const APP_PATHS_KEY = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths";
const UNINSTALL_KEY = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall";
function expandWindowsEnvVars(value, env) {
	if (!value.includes("%")) return value;
	return value.replace(/%([^%]+)%/g, (match, name) => {
		for (const key of Object.keys(env)) if (key.toUpperCase() === name.toUpperCase()) {
			const replacement = env[key];
			if (replacement !== void 0) return replacement;
		}
		return match;
	});
}
async function resolveWithInstallFallback(fixedCandidates, fallback, env, exists, queryReg) {
	const fixed = firstExisting(fixedCandidates, exists);
	if (fixed !== null) return fixed;
	const registryCandidates = [];
	if (fallback.appPathsExe !== void 0) for (const hive of ["HKCU", "HKLM"]) registryCandidates.push(queryReg(`${hive}\\${APP_PATHS_KEY}\\${fallback.appPathsExe}`, null));
	for (const { key, value } of fallback.registryInstallKeys ?? []) registryCandidates.push(queryReg(key, value).then((location) => location === null ? null : (0, node_path.join)(location, fallback.installDirExe)));
	for (const candidate of await Promise.all(registryCandidates)) {
		if (candidate === null) continue;
		const expanded = expandWindowsEnvVars(candidate, env);
		if (exists(expanded)) return expanded;
	}
	for (const { probe, exe } of fallback.pathProbes ?? []) for (const probePath of pathExeCandidates(env, probe)) {
		if (!exists(probePath)) continue;
		const candidate = (0, node_path.join)((0, node_path.dirname)(probePath), exe);
		if (exists(candidate)) return candidate;
	}
	return null;
}
function vscodeLikeFallback(appPathsExe, userUninstallGuid, systemUninstallGuid, pathCommand) {
	return {
		appPathsExe,
		registryInstallKeys: [{
			key: `HKCU\\${UNINSTALL_KEY}\\${userUninstallGuid}_is1`,
			value: "InstallLocation"
		}, {
			key: `HKLM\\${UNINSTALL_KEY}\\${systemUninstallGuid}_is1`,
			value: "InstallLocation"
		}],
		installDirExe: appPathsExe,
		pathProbes: [{
			probe: pathCommand,
			exe: (0, node_path.join)("..", appPathsExe)
		}]
	};
}
const WINDOWS_APP_SPECS = [
	{
		id: "vscode",
		label: "VS Code",
		resolve: (env, exists, queryReg) => resolveWithInstallFallback(editorExeCandidates(env, (0, node_path.join)("Microsoft VS Code", "Code.exe")), vscodeLikeFallback("Code.exe", "{F8A2A208-72B3-4D61-95FC-8A65D340689B}", "{EA457B21-F73E-494C-ACAB-524FDE069978}", "code.cmd"), env, exists, queryReg),
		args: (dir) => [dir]
	},
	{
		id: "vscode-insiders",
		label: "VS Code Insiders",
		resolve: (env, exists, queryReg) => resolveWithInstallFallback(editorExeCandidates(env, (0, node_path.join)("Microsoft VS Code Insiders", "Code - Insiders.exe")), vscodeLikeFallback("Code - Insiders.exe", "{C26E74D1-022E-4238-8B9D-5E6714DE1650}", "{1287CAD5-7C8D-410D-88B9-0D1EE4A83FF2}", "code-insiders.cmd"), env, exists, queryReg),
		args: (dir) => [dir]
	},
	{
		id: "cursor",
		label: "Cursor",
		resolve: (env, exists, queryReg) => resolveWithInstallFallback(editorExeCandidates(env, (0, node_path.join)("cursor", "Cursor.exe"), (0, node_path.join)("Cursor", "Cursor.exe")), {
			appPathsExe: "Cursor.exe",
			installDirExe: "Cursor.exe",
			pathProbes: [{
				probe: "cursor.cmd",
				exe: (0, node_path.join)("..", "Cursor.exe")
			}]
		}, env, exists, queryReg),
		args: (dir) => [dir]
	},
	{
		id: "zed",
		label: "Zed",
		resolve: (env, exists, queryReg) => resolveWithInstallFallback(editorExeCandidates(env, (0, node_path.join)("Zed", "Zed.exe")), {
			installDirExe: "Zed.exe",
			pathProbes: [{
				probe: "zed.exe",
				exe: "zed.exe"
			}]
		}, env, exists, queryReg),
		args: (dir) => [dir]
	},
	{
		id: "explorer",
		label: "File Explorer",
		resolve: () => "explorer.exe"
	},
	{
		id: "windows-terminal",
		label: "Terminal",
		resolve: terminalCommand,
		args: (dir) => ["-d", dir],
		consoleLaunch: (dir, command) => command.toLowerCase().endsWith("wt.exe") ? null : {
			command: "cmd.exe",
			args: [
				"/c",
				"start",
				"\"PowerShell\"",
				"/D",
				`"%${OPEN_IN_DIR_ENV}%"`,
				command
			],
			env: { [OPEN_IN_DIR_ENV]: dir }
		}
	},
	{
		id: "git-bash",
		label: "Git Bash",
		resolve: (env, exists, queryReg) => resolveWithInstallFallback(editorExeCandidates(env, (0, node_path.join)("Git", "git-bash.exe")), {
			registryInstallKeys: [{
				key: "HKCU\\SOFTWARE\\GitForWindows",
				value: "InstallPath"
			}, {
				key: "HKLM\\SOFTWARE\\GitForWindows",
				value: "InstallPath"
			}],
			installDirExe: "git-bash.exe",
			pathProbes: [{
				probe: "git-bash.exe",
				exe: "git-bash.exe"
			}, {
				probe: "git.exe",
				exe: (0, node_path.join)("..", "git-bash.exe")
			}]
		}, env, exists, queryReg),
		args: (dir) => [`--cd=${dir}`]
	}
];
const WINDOWS_BROWSER_SPECS = [
	{
		id: "chrome",
		label: "Chrome",
		resolve: (env, exists) => firstExisting([...env["LOCALAPPDATA"] === void 0 ? [] : [(0, node_path.join)(env["LOCALAPPDATA"], "Google", "Chrome", "Application", "chrome.exe")], ...editorExeCandidates(env, (0, node_path.join)("Google", "Chrome", "Application", "chrome.exe"))], exists),
		args: (file) => [file]
	},
	{
		id: "edge",
		label: "Edge",
		resolve: (env, exists) => firstExisting([...env["LOCALAPPDATA"] === void 0 ? [] : [(0, node_path.join)(env["LOCALAPPDATA"], "Microsoft", "Edge", "Application", "msedge.exe")], ...editorExeCandidates(env, (0, node_path.join)("Microsoft", "Edge", "Application", "msedge.exe"))], exists),
		args: (file) => [file]
	},
	{
		id: "firefox",
		label: "Firefox",
		resolve: (env, exists) => firstExisting([...env["LOCALAPPDATA"] === void 0 ? [] : [(0, node_path.join)(env["LOCALAPPDATA"], "Mozilla Firefox", "firefox.exe")], ...editorExeCandidates(env, (0, node_path.join)("Mozilla Firefox", "firefox.exe"))], exists),
		args: (file) => [file]
	},
	{
		id: "brave",
		label: "Brave",
		resolve: (env, exists) => firstExisting([...env["LOCALAPPDATA"] === void 0 ? [] : [(0, node_path.join)(env["LOCALAPPDATA"], "BraveSoftware", "Brave-Browser", "Application", "brave.exe")], ...editorExeCandidates(env, (0, node_path.join)("BraveSoftware", "Brave-Browser", "Application", "brave.exe"))], exists),
		args: (file) => [file]
	}
];
[...new Set([
	...APP_SPECS,
	...BROWSER_SPECS,
	PREVIEW_SPEC,
	...WINDOWS_APP_SPECS,
	...WINDOWS_BROWSER_SPECS
].map((spec) => spec.id))];
function defaultIsDir(path) {
	try {
		return (0, node_fs.statSync)(path).isDirectory();
	} catch {
		return true;
	}
}
function buildOpenArgs(spec, targetPath, exists, home, isDir) {
	if (spec.id === "finder") return isDir(targetPath) ? [targetPath] : ["-R", targetPath];
	if (spec.bundleId !== void 0) return [
		"-b",
		spec.bundleId,
		targetPath
	];
	const appPath = resolveBundlePath(spec, exists, home);
	if (appPath === null) return null;
	return [
		"-a",
		appPath,
		targetPath
	];
}
function defaultRun(command, args) {
	return new Promise((resolve, reject) => {
		const child = (0, node_child_process.spawn)(command, args, { stdio: [
			"ignore",
			"ignore",
			"pipe"
		] });
		let stderr = "";
		child.stderr.on("data", (chunk) => {
			stderr += chunk.toString();
		});
		child.once("error", reject);
		child.once("close", (code) => resolve({
			code,
			stderr: stderr.trim()
		}));
	});
}
function runDetached(command, args, options = {}) {
	return new Promise((resolve) => {
		let child;
		try {
			child = options.consoleWindow === true ? (0, node_child_process.spawn)(command, args, {
				stdio: "ignore",
				windowsHide: false,
				windowsVerbatimArguments: true,
				env: {
					...process.env,
					...options.env
				}
			}) : (0, node_child_process.spawn)(command, args, {
				detached: true,
				stdio: "ignore"
			});
		} catch (error) {
			resolve({ error: error instanceof Error ? error.message : String(error) });
			return;
		}
		child.once("error", (error) => resolve({ error: error.message }));
		child.once("spawn", () => {
			child.unref();
			resolve({ error: null });
		});
	});
}
async function openInAppWindows(appId, targetPath, deps) {
	const spec = [...WINDOWS_APP_SPECS, ...WINDOWS_BROWSER_SPECS].find((candidate) => candidate.id === appId);
	if (spec === void 0) return {
		ok: false,
		error: `unknown open-in app: ${appId}`
	};
	if (appId === "explorer") try {
		const path = node_path.win32.normalize(targetPath);
		const isDir = (deps.isDir ?? ((value) => (0, node_fs.statSync)(value).isDirectory()))(path);
		const shell = deps.shell ?? (await import("electron")).shell;
		if (isDir) {
			const error = await shell.openPath(path);
			return error === "" ? { ok: true } : {
				ok: false,
				error
			};
		}
		shell.showItemInFolder(path);
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
	const command = await spec.resolve(deps.env ?? process.env, deps.exists ?? defaultExists, deps.queryReg ?? queryRegValue);
	if (command === null) return {
		ok: false,
		error: `${spec.label} is not installed`
	};
	const isDir = deps.isDir ?? defaultIsDir;
	const consoleLaunch = spec.consoleLaunch?.(targetPath, command) ?? null;
	const launch = consoleLaunch ?? {
		command,
		args: spec.args?.(targetPath, command, isDir) ?? []
	};
	const { error } = await (deps.runDetached ?? runDetached)(launch.command, launch.args, {
		consoleWindow: consoleLaunch !== null,
		env: consoleLaunch?.env
	});
	return error === null ? { ok: true } : {
		ok: false,
		error
	};
}
async function openInApp(appId, targetPath, deps = {}) {
	const platform = deps.platform ?? process.platform;
	if (appId === "system") {
		const lstat = deps.lstat ?? ((path) => (0, node_fs.lstatSync)(path));
		let entry;
		try {
			entry = lstat(targetPath);
		} catch {
			return {
				ok: false,
				error: "path does not exist"
			};
		}
		if (!entry.isFile() || entry.isSymbolicLink()) return {
			ok: false,
			error: "system open only supports regular files"
		};
		if (!/\.(png|jpe?g|jfif|gif|webp|svg|avif|bmp|ico|tiff?|heic|html?)$/i.test(targetPath)) return {
			ok: false,
			error: "system open only supports image or HTML files"
		};
		const error = await (deps.shell ?? (await import("electron")).shell).openPath(targetPath);
		return error === "" ? { ok: true } : {
			ok: false,
			error
		};
	}
	if (platform === "win32") return openInAppWindows(appId, targetPath, deps);
	const spec = [
		...APP_SPECS,
		...BROWSER_SPECS,
		PREVIEW_SPEC
	].find((candidate) => candidate.id === appId);
	if (!spec) return {
		ok: false,
		error: `unknown open-in app: ${appId}`
	};
	if (platform !== "darwin") return {
		ok: false,
		error: "open-in is only supported on macOS and Windows"
	};
	const args = buildOpenArgs(spec, targetPath, deps.exists ?? node_fs.existsSync, deps.home ?? (0, node_os.homedir)(), deps.isDir ?? defaultIsDir);
	if (args === null) return {
		ok: false,
		error: `${spec.label} is not installed`
	};
	const run = deps.run ?? defaultRun;
	try {
		const { code, stderr } = await run("open", args);
		if (code !== 0) return {
			ok: false,
			error: stderr !== "" ? stderr : `open exited with code ${code}`
		};
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
//#endregion
//#region src/main/canary.ts
const CANARY_REPO = "MoonshotAI/kimi-code-app";
const CANARY_WORKFLOW = "desktop-build.yml";
const ACTIONS_URL = `https://github.com/${CANARY_REPO}/actions/workflows/${CANARY_WORKFLOW}`;
const GH_TIMEOUT_MS = 2e4;
const MAX_BUFFER = 16 * 1024 * 1024;
function resolveGhBinary(deps) {
	const candidates = deps.platform === "darwin" ? ["/opt/homebrew/bin/gh", "/usr/local/bin/gh"] : deps.platform === "win32" ? ["C:\\Program Files\\GitHub CLI\\gh.exe"] : [
		"/usr/local/bin/gh",
		"/usr/bin/gh",
		"/snap/bin/gh"
	];
	for (const candidate of candidates) if (deps.exists(candidate)) return candidate;
	return "gh";
}
function isEnoent(error) {
	return error instanceof Error && error.code === "ENOENT";
}
function errorMessage(error) {
	if (error instanceof Error) {
		const stderr = error.stderr;
		if (typeof stderr === "string" && stderr.trim() !== "") return stderr.trim().split("\n")[0];
		return error.message;
	}
	return String(error);
}
async function probeGh(deps) {
	const bin = resolveGhBinary(deps);
	try {
		await deps.exec(bin, ["--version"], {
			timeout: GH_TIMEOUT_MS,
			maxBuffer: MAX_BUFFER
		});
	} catch (error) {
		return isEnoent(error) ? "missing" : "error";
	}
	try {
		await deps.exec(bin, ["auth", "status"], {
			timeout: GH_TIMEOUT_MS,
			maxBuffer: MAX_BUFFER
		});
		return "ok";
	} catch {
		return "unauthenticated";
	}
}
async function triggerBuild(deps) {
	const gh = await probeGh(deps);
	if (gh !== "ok") return {
		ok: false,
		error: `gh not ready: ${gh}`
	};
	const bin = resolveGhBinary(deps);
	try {
		await deps.exec(bin, [
			"workflow",
			"run",
			CANARY_WORKFLOW,
			"--repo",
			CANARY_REPO,
			"--ref",
			"main",
			"-f",
			"canary=true"
		], {
			timeout: GH_TIMEOUT_MS,
			maxBuffer: MAX_BUFFER
		});
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: errorMessage(error)
		};
	}
}
const execFileAsync$1 = (0, node_util.promisify)(node_child_process.execFile);
function productionDeps() {
	return {
		exec: execFileAsync$1,
		platform: process.platform,
		exists: node_fs.existsSync
	};
}
async function getCanaryInfo() {
	return {
		enabled: require_release_channel.isCanaryChannelEnabled(electron.app.getVersion(), electron.app.isPackaged),
		isCanaryBuild: require_release_channel.isCanaryDisplay(electron.app.getVersion(), electron.app.isPackaged),
		isRealCanaryBuild: require_release_channel.isCanaryVersion(electron.app.getVersion()),
		gh: await probeGh(productionDeps()),
		actionsUrl: ACTIONS_URL
	};
}
function requestCanaryTrigger() {
	return triggerBuild(productionDeps());
}
//#endregion
//#region src/main/debug.ts
function getDebugFlags() {
	return { enabled: process.env["KIMI_CODE_DEBUG"] === "1" };
}
//#endregion
//#region src/main/quit-confirm.ts
const BUSY_SESSIONS_QUERY_TIMEOUT_MS = 1500;
const QUIT_CONFIRM_STRINGS = {
	zh: {
		title: "退出 Kimi Code？",
		detail: "本机有正在进行的会话，退出后这些会话将被中断。",
		cancel: "取消",
		quit: "退出"
	},
	en: {
		title: "Quit Kimi Code?",
		detail: "Sessions are still in progress on this machine and will be interrupted if you quit.",
		cancel: "Cancel",
		quit: "Quit"
	}
};
let quitConfirmLocale = null;
function setQuitConfirmLocale(locale) {
	quitConfirmLocale = locale;
}
function effectiveQuitConfirmLocale() {
	if (quitConfirmLocale !== null) return quitConfirmLocale;
	try {
		return electron.app.getLocale().toLowerCase().startsWith("zh") ? "zh" : "en";
	} catch {
		return "en";
	}
}
function quitConfirmStrings(locale) {
	return QUIT_CONFIRM_STRINGS[locale];
}
function hasBusySession(payload) {
	if (payload === null || typeof payload !== "object") return false;
	const data = payload.data;
	if (data === null || typeof data !== "object") return false;
	const items = data.items;
	return Array.isArray(items) && items.length > 0;
}
function busySessionsUrl(origin) {
	return `${origin}/api/v1/sessions?busy=true&page_size=1&include_archive=true`;
}
function trackQuitConfirmation(action) {
	try {
		require_protocol.trackDesktopEvent("quit_confirmation", { action });
	} catch {
		return;
	}
}
async function queryBusySessions(origin, token) {
	const headers = {};
	if (token !== void 0) headers["Authorization"] = `Bearer ${token}`;
	const response = await fetch(busySessionsUrl(origin), {
		headers,
		signal: AbortSignal.timeout(BUSY_SESSIONS_QUERY_TIMEOUT_MS)
	});
	if (!response.ok) return false;
	return hasBusySession(await response.json());
}
let pendingQuitConfirmResolve = null;
let pendingQuitConfirmRequestId = null;
let quitConfirmRequestSeq = 0;
let activeQuitChecks = 0;
function resolveQuitConfirmResponse(choice, requestId) {
	if (requestId !== void 0 && requestId !== pendingQuitConfirmRequestId) return;
	const resolve = pendingQuitConfirmResolve;
	pendingQuitConfirmResolve = null;
	pendingQuitConfirmRequestId = null;
	resolve?.(choice);
}
require_screenshot.onMainWindowGone(() => {
	const requestId = pendingQuitConfirmRequestId;
	resolveQuitConfirmResponse("cancel");
	if (requestId !== null) require_screenshot.sendToRenderer(require_screenshot.IPC.quitConfirmCancel, requestId);
});
require_screenshot.addMainWindowCloseInterceptor(() => {
	if (require_screenshot.isQuitConfirmSkipped()) {
		resolveQuitConfirmResponse("cancel");
		return false;
	}
	if (pendingQuitConfirmRequestId !== null) {
		const requestId = pendingQuitConfirmRequestId;
		resolveQuitConfirmResponse("cancel");
		require_screenshot.sendToRenderer(require_screenshot.IPC.quitConfirmCancel, requestId);
		return true;
	}
	return activeQuitChecks > 0;
});
let quitConfirmChain = Promise.resolve();
function enqueueQuitConfirm(task) {
	const run = quitConfirmChain.then(task, task);
	quitConfirmChain = run.then(() => void 0, () => void 0);
	return run;
}
const RENDERER_QUIT_CONFIRM_TIMEOUT_MS = 5e3;
function confirmQuitInApp(win) {
	return new Promise((resolve) => {
		const requestId = ++quitConfirmRequestSeq;
		const timer = setTimeout(() => {
			resolveQuitConfirmResponse("unavailable", requestId);
		}, RENDERER_QUIT_CONFIRM_TIMEOUT_MS);
		pendingQuitConfirmResolve = (choice) => {
			clearTimeout(timer);
			if (choice === "unavailable") {
				require_screenshot.sendToRenderer(require_screenshot.IPC.quitConfirmCancel, requestId);
				require_protocol.log.warn("[kimi-desktop] quit confirmation: renderer did not respond, falling back to native dialog");
				confirmQuitNative(win).then(resolve);
				return;
			}
			resolve(choice === "quit");
		};
		pendingQuitConfirmRequestId = requestId;
		require_screenshot.showMainWindow();
		require_screenshot.sendToRenderer(require_screenshot.IPC.quitConfirm, requestId);
	});
}
async function confirmQuitNative(win) {
	const strings = quitConfirmStrings(effectiveQuitConfirmLocale());
	const options = {
		type: "warning",
		message: strings.title,
		detail: strings.detail,
		buttons: [strings.cancel, strings.quit],
		defaultId: 0,
		cancelId: 0,
		noLink: true
	};
	try {
		const { response } = win !== null && !win.isDestroyed() && win.isVisible() ? await electron.dialog.showMessageBox(win, options) : await electron.dialog.showMessageBox(options);
		return response === 1;
	} catch (error) {
		require_protocol.log.warn(`[kimi-desktop] quit confirmation skipped: dialog failed (${error instanceof Error ? error.message : String(error)})`);
		return null;
	}
}
async function shouldBlockQuitForBusySessions(win, options = {}) {
	const origin = require_screenshot.embeddedServerOrigin();
	if (origin === null) return false;
	const interceptWindowClose = options.interceptWindowClose ?? true;
	if (interceptWindowClose) activeQuitChecks += 1;
	try {
		let busy;
		try {
			busy = await queryBusySessions(origin, require_screenshot.desktopServerSecret());
		} catch (error) {
			require_protocol.log.warn(`[kimi-desktop] quit confirmation skipped: busy session query failed (${error instanceof Error ? error.message : String(error)})`);
			return false;
		}
		if (!busy) return false;
		const quit = await enqueueQuitConfirm(() => {
			trackQuitConfirmation("shown");
			return win !== null && !win.isDestroyed() && require_screenshot.isRendererReady() ? confirmQuitInApp(win) : confirmQuitNative(win);
		});
		if (quit === null) return false;
		trackQuitConfirmation(quit ? "quit" : "cancel");
		return !quit;
	} finally {
		if (interceptWindowClose) activeQuitChecks -= 1;
	}
}
//#endregion
//#region src/main/renderer-log.ts
const MAX_MESSAGE_CHARS = 2e3;
const MAX_DETAIL_JSON_CHARS = 4096;
const RATE_LIMIT_WINDOW_MS = 6e4;
const RATE_LIMIT_MAX_LINES = 120;
const SENSITIVE_KEY_RE = /api[_-]?key|authorization|token|secret|password|cookie|credential|email|phone|nickname|avatar/i;
const BASE64ISH_RE = /^[A-Za-z0-9+/=_-]{200,}$/;
const INLINE_KEY_VALUE_RE = /([?#&\s]|^)([\w-]+)=/g;
const INLINE_SECRET_KEY_RE = /token|api[_-]?key|password|secret|cookie|credential|authorization/i;
const INLINE_AUTH_SCHEME_RE = /(Bearer|Basic)\s+\S+/gi;
function asRendererLogPayload(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
	const candidate = value;
	if (candidate.level !== "info" && candidate.level !== "warn" && candidate.level !== "error") return null;
	if (typeof candidate.message !== "string" || candidate.message === "") return null;
	const payload = {
		level: candidate.level,
		message: candidate.message
	};
	if (candidate.detail !== void 0) payload.detail = candidate.detail;
	return payload;
}
function sanitizeRendererLogMessage(message) {
	const schemes = message.replaceAll(INLINE_AUTH_SCHEME_RE, (_m, scheme) => `${scheme} [redacted]`);
	const parts = [];
	let cursor = 0;
	INLINE_KEY_VALUE_RE.lastIndex = 0;
	let match;
	while ((match = INLINE_KEY_VALUE_RE.exec(schemes)) !== null) {
		if (!INLINE_SECRET_KEY_RE.test(match[2])) continue;
		const start = INLINE_KEY_VALUE_RE.lastIndex;
		let end = start;
		while (end < schemes.length && !/[\s&#]/.test(schemes[end])) end += 1;
		if (end === start) continue;
		parts.push(schemes.slice(cursor, start), "[redacted]");
		cursor = end;
		INLINE_KEY_VALUE_RE.lastIndex = end;
	}
	const flattened = (parts.join("") + schemes.slice(cursor)).replaceAll("\r", "\\r").replaceAll("\n", "\\n");
	return flattened.length > MAX_MESSAGE_CHARS ? `${flattened.slice(0, MAX_MESSAGE_CHARS)}… [+${flattened.length - MAX_MESSAGE_CHARS} chars]` : flattened;
}
function sanitizeDetailValue(value, depth) {
	if (value === null || value === void 0) return value;
	const t = typeof value;
	if (t === "number" || t === "boolean") return value;
	if (t === "string") {
		const s = value;
		if (BASE64ISH_RE.test(s)) return `[base64-like, ${s.length} chars omitted]`;
		return sanitizeRendererLogMessage(s);
	}
	if (t !== "object") return String(value);
	if (value instanceof Error) {
		const out = {
			name: value.name,
			message: sanitizeRendererLogMessage(value.message)
		};
		if (value.stack !== void 0) out["stack"] = sanitizeRendererLogMessage(value.stack);
		if (value.cause !== void 0) out["cause"] = sanitizeDetailValue(value.cause, depth + 1);
		return out;
	}
	if (depth >= 6) return "[max depth]";
	if (Array.isArray(value)) {
		const out = value.slice(0, 50).map((v) => sanitizeDetailValue(v, depth + 1));
		if (value.length > 50) out.push(`[+${value.length - 50} more items]`);
		return out;
	}
	const out = {};
	const entries = Object.entries(value);
	for (const [k, v] of entries.slice(0, 50)) out[k] = SENSITIVE_KEY_RE.test(k) ? "[redacted]" : sanitizeDetailValue(v, depth + 1);
	if (entries.length > 50) out["_truncatedKeys"] = entries.length - 50;
	return out;
}
function serializeRendererLogDetail(detail) {
	if (detail === void 0) return void 0;
	let json;
	try {
		json = JSON.stringify(sanitizeDetailValue(detail, 0)) ?? "undefined";
	} catch {
		return "[unserializable detail]";
	}
	return json.length > MAX_DETAIL_JSON_CHARS ? `${json.slice(0, MAX_DETAIL_JSON_CHARS)}… [truncated]` : json;
}
function createRendererLogWriter(write = (level, line) => require_protocol.log[level](line), now = Date.now) {
	let windowStart = now();
	let written = 0;
	let dropped = 0;
	let flushTimer = null;
	const flushDropped = () => {
		if (dropped === 0) return;
		write("warn", `[renderer] dropped ${dropped} log line(s) in the last minute (rate limit)`);
		dropped = 0;
	};
	const rollWindow = () => {
		if (now() - windowStart < RATE_LIMIT_WINDOW_MS) return;
		flushDropped();
		windowStart = now();
		written = 0;
		if (flushTimer !== null) {
			clearTimeout(flushTimer);
			flushTimer = null;
		}
	};
	return (payload) => {
		const parsed = asRendererLogPayload(payload);
		if (parsed === null) return;
		rollWindow();
		if (written >= RATE_LIMIT_MAX_LINES) {
			dropped++;
			if (flushTimer === null) {
				flushTimer = setTimeout(() => {
					flushTimer = null;
					rollWindow();
				}, RATE_LIMIT_WINDOW_MS - (now() - windowStart));
				flushTimer.unref?.();
			}
			return;
		}
		written++;
		const detail = serializeRendererLogDetail(parsed.detail);
		const line = `[renderer] ${sanitizeRendererLogMessage(parsed.message)}`;
		write(parsed.level, detail === void 0 ? line : `${line}  ${detail}`);
	};
}
//#endregion
//#region src/shared/action-ids.ts
const APP_ACTION_IDS = [
	"newSession",
	"closeSessionView",
	"searchSessions",
	"archiveSession",
	"toggleSideChat",
	"toggleSidebar",
	"toggleRightPanel",
	"openFolder",
	"openInDefaultApp",
	"openSettings",
	"toggleTerminal",
	"newTerminalTab",
	"openDiffTab",
	"nextPanelTab",
	"previousPanelTab",
	"sidebarTabOpen",
	"sidebarTabDone",
	"sidebarTabWorkspaces",
	"selectPrevSibling",
	"selectNextSibling",
	"captureScreenshot"
];
const SHORTCUT_ACTION_IDS = [
	"summonApp",
	"newSession",
	"closeSessionView",
	"searchSessions",
	"archiveSession",
	"toggleSideChat",
	"toggleSidebar",
	"toggleRightPanel",
	"openFolder",
	"openInDefaultApp",
	"openSettings",
	"toggleTerminal",
	"openDiffTab",
	"nextPanelTab",
	"previousPanelTab",
	"sidebarTabOpen",
	"sidebarTabDone",
	"sidebarTabWorkspaces",
	"selectPrevSibling",
	"selectNextSibling",
	"captureScreenshot",
	"composer.send",
	"composer.newline"
];
const ACTION_INVOKED_IDS = [
	...APP_ACTION_IDS,
	"select-all",
	"retry-connection"
];
new Set(APP_ACTION_IDS);
//#endregion
//#region src/shared/track-events.ts
const shortStringSchema = require_coerce.string().min(1).max(64);
const optionalCappedStringSchema = require_coerce.string().max(64).optional().catch(void 0);
const optionalBooleanSchema = require_coerce.boolean$1().optional().catch(void 0);
const optionalDurationSchema = require_coerce.number$1().int().nonnegative().max(36e5).optional().catch(void 0);
const settingsSourcePanel = { source_panel: require_coerce._enum([
	"settings",
	"mobile_settings",
	"update_prompt",
	"user_menu"
]).optional().catch(void 0) };
const shortcutBindingChangedPropertiesSchema = require_coerce.discriminatedUnion("op", [require_coerce.object({
	action: require_coerce._enum(SHORTCUT_ACTION_IDS),
	op: require_coerce._enum([
		"assign",
		"reset",
		"clear"
	]),
	had_conflict: optionalBooleanSchema
}), require_coerce.object({
	action: require_coerce.literal("*"),
	op: require_coerce.literal("reset_all"),
	had_conflict: optionalBooleanSchema
})]);
const settingsChangedPropertiesSchema = require_coerce.discriminatedUnion("key", [
	require_coerce.object({
		key: require_coerce.literal("language"),
		value: require_coerce._enum(["en", "zh"]),
		...settingsSourcePanel
	}),
	require_coerce.object({
		key: require_coerce.literal("theme"),
		value: require_coerce._enum([
			"system",
			"light",
			"dark"
		]),
		...settingsSourcePanel
	}),
	require_coerce.object({
		key: require_coerce.literal("font-size"),
		value: require_coerce._enum([
			"small",
			"medium",
			"large",
			"xlarge"
		]),
		...settingsSourcePanel
	}),
	require_coerce.object({
		key: require_coerce.literal("vibrancy"),
		value: require_coerce._enum(["on", "off"]),
		...settingsSourcePanel
	}),
	require_coerce.object({
		key: require_coerce.literal("notifications"),
		value: require_coerce._enum(["on", "off"]),
		...settingsSourcePanel
	}),
	require_coerce.object({
		key: require_coerce.literal("open-in-default"),
		value: shortStringSchema,
		...settingsSourcePanel
	}),
	require_coerce.object({
		key: require_coerce.literal("dock-icon"),
		value: require_coerce._enum(["light", "dark"]),
		...settingsSourcePanel
	}),
	require_coerce.object({
		key: require_coerce.literal("sidebar-multi-tab"),
		value: require_coerce._enum(["on", "off"]),
		...settingsSourcePanel
	}),
	require_coerce.object({
		key: require_coerce.literal("update-auto-download"),
		value: require_coerce._enum(["on", "off"]),
		...settingsSourcePanel
	})
]);
const rendererTrackEventSchema = require_coerce.discriminatedUnion("event", [
	require_coerce.object({
		event: require_coerce.literal("action_invoked"),
		properties: require_coerce.object({
			action: require_coerce._enum(ACTION_INVOKED_IDS),
			source: require_coerce._enum([
				"shortcut",
				"menu",
				"button"
			])
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("update_prompt_shown"),
		properties: require_coerce.object({
			version: optionalCappedStringSchema,
			channel: require_coerce._enum(["stable", "canary"]).optional().catch(void 0)
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("update_prompt_action"),
		properties: require_coerce.object({
			action: require_coerce._enum([
				"skip",
				"download",
				"restart",
				"retry",
				"open-installer"
			]),
			version: optionalCappedStringSchema,
			channel: require_coerce._enum(["stable", "canary"]).optional().catch(void 0)
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("onboarding_step"),
		properties: require_coerce.object({
			step: require_coerce._enum(["preferences", "login"]),
			skipped: optionalBooleanSchema,
			step_index: require_coerce.number$1().int().nonnegative(),
			total_steps: require_coerce.number$1().int().min(1),
			duration_ms: optionalDurationSchema
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("onboarding_completed"),
		properties: require_coerce.object({ total_duration_ms: require_coerce.number$1().int().nonnegative().max(36e5) })
	}),
	require_coerce.object({
		event: require_coerce.literal("onboarding_abandoned"),
		properties: require_coerce.object({
			last_step: require_coerce._enum(["preferences", "login"]),
			total_duration_ms: require_coerce.number$1().int().nonnegative().max(36e5)
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("oauth_login_step"),
		properties: require_coerce.object({
			stage: require_coerce._enum([
				"starting",
				"device-code",
				"success",
				"denied",
				"expired",
				"error"
			]),
			ok: optionalBooleanSchema,
			method: require_coerce._enum([
				"oauth",
				"api_key",
				"none"
			]),
			duration_ms: optionalDurationSchema,
			error_class: require_coerce._enum([
				"start_failed",
				"poll_failed",
				"expired",
				"cancelled",
				"denied"
			]).optional().catch(void 0)
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("shortcut_binding_changed"),
		properties: shortcutBindingChangedPropertiesSchema
	}),
	require_coerce.object({
		event: require_coerce.literal("settings_changed"),
		properties: settingsChangedPropertiesSchema
	}),
	require_coerce.object({
		event: require_coerce.literal("native_feature_used"),
		properties: require_coerce.object({
			feature: require_coerce._enum([
				"workspace_drop",
				"workspace_picker",
				"open_in"
			]),
			fallback: optionalBooleanSchema
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("approval_decision"),
		properties: require_coerce.object({
			decision: require_coerce._enum([
				"approve",
				"approveSession",
				"reject",
				"approvePlan",
				"approveOption",
				"revisePlan",
				"rejectAndExit"
			]),
			via: require_coerce._enum([
				"button",
				"number-key",
				"shortcut-key"
			]),
			request_id: optionalCappedStringSchema
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("session_menu_action"),
		properties: require_coerce.object({ action: require_coerce._enum([
			"copyAll",
			"copyFinalSummary",
			"copySessionId",
			"pin",
			"unpin",
			"rename",
			"fork",
			"export",
			"archive",
			"restore",
			"openChanges",
			"openPr",
			"togglePanel"
		]) })
	}),
	require_coerce.object({
		event: require_coerce.literal("session_emoji_changed"),
		properties: require_coerce.object({
			action: require_coerce._enum([
				"set",
				"remove",
				"random"
			]),
			via: require_coerce._enum(["menu", "icon"])
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("attachment_added"),
		properties: require_coerce.object({
			via: require_coerce._enum([
				"drop",
				"click",
				"paste"
			]),
			kind: require_coerce._enum([
				"image",
				"video",
				"file"
			]).optional().catch(void 0),
			size_bucket: require_coerce._enum([
				"<1mb",
				"1-10mb",
				"10-50mb",
				"50mb+"
			]),
			count: require_coerce.number$1().int().min(1).max(100)
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("ui_element_toggled"),
		properties: require_coerce.object({
			element: require_coerce._enum(["thinking_block", "tool_call"]),
			expanded: require_coerce.boolean$1(),
			sample_rate: require_coerce.literal(1)
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("session_created"),
		properties: require_coerce.object({
			kind: require_coerce._enum(["new", "resumed"]),
			source: require_coerce._enum([
				"sidebar",
				"shortcut",
				"menu",
				"jump_list",
				"tray",
				"notification",
				"search",
				"slash_command"
			])
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("notification_shown"),
		properties: require_coerce.object({ kind: require_coerce._enum([
			"turn_complete",
			"question",
			"approval"
		]) })
	}),
	require_coerce.object({
		event: require_coerce.literal("notification_clicked"),
		properties: require_coerce.object({ kind: require_coerce._enum([
			"turn_complete",
			"question",
			"approval"
		]) })
	}),
	require_coerce.object({
		event: require_coerce.literal("search_opened"),
		properties: require_coerce.object({})
	}),
	require_coerce.object({
		event: require_coerce.literal("search_executed"),
		properties: require_coerce.object({
			scope: require_coerce.literal("current_session"),
			result_count_bucket: require_coerce._enum([
				"0",
				"1-10",
				"11-50",
				"50+"
			])
		})
	}),
	require_coerce.object({
		event: require_coerce.literal("logout"),
		properties: require_coerce.object({})
	}),
	require_coerce.object({
		event: require_coerce.literal("plan_usage_card_viewed"),
		properties: require_coerce.object({ usage_bucket: require_coerce._enum([
			"ok",
			"warn",
			"danger"
		]) })
	}),
	require_coerce.object({
		event: require_coerce.literal("upgrade_clicked"),
		properties: require_coerce.object({})
	}),
	require_coerce.object({
		event: require_coerce.literal("telemetry_consent_changed"),
		properties: require_coerce.object({ enabled: require_coerce.boolean$1() })
	}),
	require_coerce.object({
		event: require_coerce.literal("renderer_error"),
		properties: require_coerce.object({ error_class: shortStringSchema })
	}),
	require_coerce.object({
		event: require_coerce.literal("connection_lost"),
		properties: require_coerce.object({})
	}),
	require_coerce.object({
		event: require_coerce.literal("connection_restored"),
		properties: require_coerce.object({ duration_ms: require_coerce.number$1().int().nonnegative().max(864e5) })
	}),
	require_coerce.object({
		event: require_coerce.literal("workspace_added"),
		properties: require_coerce.object({ workspace_count: require_coerce.number$1().int().nonnegative().max(1e3) })
	}),
	require_coerce.object({
		event: require_coerce.literal("workspace_removed"),
		properties: require_coerce.object({ workspace_count: require_coerce.number$1().int().nonnegative().max(1e3) })
	})
]);
//#endregion
//#region src/main/ipc.ts
function isColorScheme(value) {
	return value === "light" || value === "dark" || value === "system";
}
function isWindowsMenuId(value) {
	return value === "file" || value === "edit" || value === "view" || value === "help";
}
function isMainRendererSender(sender) {
	const win = require_screenshot.getMainWindow();
	return win !== null && !win.isDestroyed() && sender === win.webContents;
}
function asTerminalCreateOptions(value) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
	const raw = value;
	const options = {};
	if (typeof raw["cwd"] === "string" && raw["cwd"] !== "") options.cwd = raw["cwd"];
	if (typeof raw["cols"] === "number" && Number.isFinite(raw["cols"])) options.cols = raw["cols"];
	if (typeof raw["rows"] === "number" && Number.isFinite(raw["rows"])) options.rows = raw["rows"];
	return options;
}
function asRendererTrackEvent(event, payload) {
	const result = rendererTrackEventSchema.safeParse({
		event,
		properties: payload
	});
	return result.success ? result.data : null;
}
const rendererLogWriter = createRendererLogWriter();
function registerIpcHandlers() {
	const localPagesAllowed = createLocalPagesPolicy({
		isPackaged: electron.app.isPackaged,
		env: process.env,
		execPath: process.execPath,
		platform: process.platform,
		warn: (message) => require_protocol.log.warn(message)
	});
	require_screenshot.setLocalPagesExtraPrivileges(localPagesAllowed.extraPrivileges);
	let browserSessions = null;
	const getBrowserSessions = () => {
		if (browserSessions === null) {
			browserSessions = new require_screenshot.BrowserSessionStore((0, node_path.join)(electron.app.getPath("userData"), "browser-tabs.json"));
			require_screenshot.setBrowserPagePersistence(browserSessions);
		}
		return browserSessions;
	};
	electron.ipcMain.on(require_screenshot.IPC.theme, (_event, scheme) => {
		if (isColorScheme(scheme)) electron.nativeTheme.themeSource = scheme;
	});
	electron.ipcMain.on(require_screenshot.IPC.dockIconChoice, (_event, choice) => {
		if (isDockIconChoice(choice)) setDockIconChoice(choice);
	});
	electron.ipcMain.handle(require_screenshot.IPC.openExternal, (_event, url) => {
		if (!require_screenshot.isHttpUrl(url)) {
			require_protocol.log.error(`[kimi-desktop] openExternal rejected non-http(s) url: ${require_protocol.redactUrlForLog(url)}`);
			throw new Error("openExternal only allows http(s) URLs");
		}
		return electron.shell.openExternal(url).catch((error) => {
			require_protocol.log.error(`[kimi-desktop] openExternal failed: ${require_protocol.redactUrlForLog(url)}`, error);
			throw error;
		});
	});
	electron.ipcMain.handle(require_screenshot.IPC.serverCredential, (_event, token) => {
		if (typeof token === "string" && token.length > 0) require_screenshot.updateServerRegionToken(token);
	});
	electron.ipcMain.handle(require_screenshot.IPC.dialogOpen, async (_event, opts = {}) => {
		const win = require_screenshot.getMainWindow();
		const result = await (win === null || win.isDestroyed() ? electron.dialog.showOpenDialog(opts) : electron.dialog.showOpenDialog(win, opts));
		require_protocol.trackDesktopEvent("native_ipc_used", { channel: "dialog-open" });
		return result;
	});
	electron.ipcMain.handle(require_screenshot.IPC.dialogSave, async (_event, opts = {}) => {
		const win = require_screenshot.getMainWindow();
		const result = await (win === null || win.isDestroyed() ? electron.dialog.showSaveDialog(opts) : electron.dialog.showSaveDialog(win, opts));
		require_protocol.trackDesktopEvent("native_ipc_used", { channel: "dialog-save" });
		return result;
	});
	electron.ipcMain.handle(require_screenshot.IPC.openInList, (_event, filePath) => listAvailableOpenInApps({ filePath: typeof filePath === "string" && filePath.trim() !== "" ? filePath : void 0 }));
	electron.ipcMain.handle(require_screenshot.IPC.openInApp, async (_event, appId, path) => {
		if (typeof appId !== "string" || typeof path !== "string" || path.trim() === "") return {
			ok: false,
			error: "invalid open-in arguments"
		};
		const result = await openInApp(appId, path);
		if (result.ok) require_protocol.trackDesktopEvent("native_ipc_used", { channel: "open-in" });
		return result;
	});
	electron.ipcMain.handle(require_screenshot.IPC.isFullscreen, () => {
		const win = require_screenshot.getMainWindow();
		return win !== null && !win.isDestroyed() && win.isFullScreen();
	});
	electron.ipcMain.handle(require_screenshot.IPC.menuPopup, (event, request) => {
		const win = require_screenshot.getMainWindow();
		if (win === null || win.isDestroyed() || event.sender !== win.webContents || request === null || typeof request !== "object") return { opened: false };
		const { id, x, y } = request;
		if (!isWindowsMenuId(id) || typeof x !== "number" || typeof y !== "number") return { opened: false };
		return require_screenshot.popupWindowsMenu(id, x, y);
	});
	electron.ipcMain.handle(require_screenshot.IPC.quitConfirmResponse, (event, payload) => {
		if (event.sender !== require_screenshot.getMainWindow()?.webContents) return;
		if (payload === null || typeof payload !== "object") return;
		const { choice, requestId } = payload;
		if ((choice === "quit" || choice === "cancel" || choice === "unavailable") && typeof requestId === "number") resolveQuitConfirmResponse(choice, requestId);
	});
	electron.ipcMain.handle(require_screenshot.IPC.updateGetStatus, () => require_screenshot.getUpdateStatus());
	electron.ipcMain.handle(require_screenshot.IPC.updateCheck, () => require_screenshot.requestUpdateCheck());
	electron.ipcMain.handle(require_screenshot.IPC.updateDownload, () => require_screenshot.requestUpdateDownload());
	electron.ipcMain.handle(require_screenshot.IPC.updateInstall, () => require_screenshot.requestUpdateInstall());
	electron.ipcMain.handle(require_screenshot.IPC.updateGetAutoDownload, () => require_screenshot.getUpdateAutoDownload());
	electron.ipcMain.handle(require_screenshot.IPC.updateSetAutoDownload, (_event, enabled) => {
		if (typeof enabled === "boolean") require_screenshot.setUpdateAutoDownload(enabled);
	});
	electron.ipcMain.handle(require_screenshot.IPC.canaryGetInfo, () => getCanaryInfo());
	electron.ipcMain.handle(require_screenshot.IPC.debugGetFlags, () => getDebugFlags());
	electron.ipcMain.handle(require_screenshot.IPC.canaryTrigger, () => requestCanaryTrigger());
	electron.ipcMain.handle(require_screenshot.IPC.canaryImportStableSettings, async () => {
		const precheck = require_main.stableSettingsPrecheck(electron.app.getVersion(), process.platform, electron.app.getPath("appData"));
		if (precheck !== "ok") return { status: precheck };
		if (await shouldBlockQuitForBusySessions(require_screenshot.getMainWindow(), { interceptWindowClose: false })) return { status: "cancelled" };
		try {
			require_main.writeImportMarker(electron.app.getPath("userData"), require_main.stableUserDataDir(electron.app.getPath("appData")));
		} catch (error) {
			return {
				status: "error",
				error: error instanceof Error ? error.message : String(error)
			};
		}
		setImmediate(() => {
			electron.app.relaunch();
			electron.app.exit(0);
		});
		return { status: "relaunching" };
	});
	electron.ipcMain.on(require_screenshot.IPC.trayAttention, (_event, payload) => {
		const attention = asTrayAttention(payload);
		if (attention !== null) setTrayAttention(attention);
	});
	electron.ipcMain.on(require_screenshot.IPC.locale, (_event, locale) => {
		if (locale === "en" || locale === "zh") {
			setTrayLocale(locale);
			require_screenshot.setMenuLocale(locale);
			require_screenshot.setContextMenuLocale(locale);
			require_screenshot.setJumpListLocale(locale);
			require_screenshot.setScreenshotLocale(locale);
			setQuitConfirmLocale(locale);
		}
	});
	electron.ipcMain.on(require_screenshot.IPC.jumpList, (_event, payload) => {
		const workspaces = require_screenshot.asJumpListWorkspaces(payload);
		if (workspaces !== null) require_screenshot.updateJumpList(workspaces);
	});
	electron.ipcMain.on(require_screenshot.IPC.menuShortcut, (event, payload) => {
		if (event.sender !== require_screenshot.getMainWindow()?.webContents) return;
		if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return;
		const bindings = {};
		for (const [id, value] of Object.entries(payload)) if (typeof value === "string" || value === null) bindings[id] = value;
		require_screenshot.setMenuShortcuts(bindings);
	});
	electron.ipcMain.on(require_screenshot.IPC.menuSuspend, (_event, suspended) => {
		if (typeof suspended === "boolean") require_screenshot.setMenuSuspended(suspended);
	});
	electron.ipcMain.on(require_screenshot.IPC.menuTerminalFocus, (_event, focused) => {
		if (typeof focused === "boolean") require_screenshot.setTerminalMenuFocus(focused);
	});
	require_screenshot.onTerminalMenuFocus(setGlobalShortcutTerminalFocus);
	electron.ipcMain.handle(require_screenshot.IPC.globalShortcut, (_event, payload) => {
		if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return false;
		const { action, binding } = payload;
		if (action !== "summonApp" && action !== "captureScreenshot" || binding !== null && typeof binding !== "string") return false;
		return setGlobalShortcutForAction(action, binding);
	});
	electron.ipcMain.handle(require_screenshot.IPC.globalShortcutSuspend, (_event, suspended) => {
		if (typeof suspended !== "boolean") return false;
		return setGlobalShortcutSuspended(suspended);
	});
	electron.ipcMain.handle(require_screenshot.IPC.screenshotCapture, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("screenshot-capture: unknown sender");
		return require_screenshot.captureScreenshot();
	});
	electron.ipcMain.on(require_screenshot.IPC.screenshotCancel, (event) => {
		if (!isMainRendererSender(event.sender)) return;
		require_screenshot.cancelScreenshotCapture();
	});
	electron.ipcMain.on(require_screenshot.IPC.showWindow, () => {
		require_screenshot.showMainWindow();
		require_protocol.trackDesktopEvent("native_ipc_used", { channel: "show-window" });
	});
	electron.ipcMain.on(require_screenshot.IPC.hideWindow, (event) => {
		electron.BrowserWindow.fromWebContents(event.sender)?.close();
		require_protocol.trackDesktopEvent("native_ipc_used", { channel: "hide-window" });
	});
	electron.ipcMain.on(require_screenshot.IPC.setOnboarded, () => {
		require_screenshot.markOnboarded();
	});
	electron.ipcMain.on(require_screenshot.IPC.vibrancy, (_event, enabled) => {
		if (typeof enabled !== "boolean") return;
		require_screenshot.setVibrancyEnabled(enabled);
		require_screenshot.applyWindowVibrancy(enabled);
		require_protocol.trackDesktopEvent("native_ipc_used", { channel: "vibrancy" });
	});
	electron.ipcMain.handle(require_screenshot.IPC.getVibrancy, () => require_screenshot.isVibrancyEnabled());
	electron.ipcMain.on(require_screenshot.IPC.rendererLog, (_event, payload) => {
		rendererLogWriter(payload);
	});
	electron.ipcMain.on(require_screenshot.IPC.track, (_event, eventName, payload) => {
		const parsed = asRendererTrackEvent(eventName, payload);
		if (parsed !== null) require_protocol.trackDesktopEvent(parsed.event, parsed.properties);
	});
	require_screenshot.initTerminalManager({
		locale: () => {
			try {
				return electron.app.getLocale();
			} catch {
				return "en";
			}
		},
		homeDir: (0, node_os.homedir)(),
		pathExists: (path) => (0, node_fs.existsSync)(path),
		isDirectory: (path) => {
			try {
				return (0, node_fs.statSync)(path).isDirectory();
			} catch {
				return false;
			}
		},
		pushOutput: (id, data) => require_screenshot.sendToRenderer(require_screenshot.IPC.terminalOutput, {
			id,
			data
		}),
		pushExit: (id, exitCode) => require_screenshot.sendToRenderer(require_screenshot.IPC.terminalExit, {
			id,
			exitCode
		})
	});
	electron.ipcMain.handle(require_screenshot.IPC.terminalInspect, (event, ids) => {
		if (!isMainRendererSender(event.sender)) throw new Error("terminal-inspect: unknown sender");
		if (!Array.isArray(ids) || ids.length > 512 || !ids.every((id) => typeof id === "string" && id.length > 0 && id.length <= 128)) throw new Error("terminal-inspect: invalid terminal ids");
		return require_screenshot.getTerminalManager().inspect([...new Set(ids)]);
	});
	electron.ipcMain.handle(require_screenshot.IPC.terminalCreate, async (event, payload) => {
		const win = require_screenshot.getMainWindow();
		if (win === null || win.isDestroyed() || event.sender !== win.webContents) throw new Error("terminal-create: unknown sender");
		const manager = require_screenshot.getTerminalManager();
		const gen = manager.generation();
		await require_release_channel.startShellEnvProbe();
		const winAfter = require_screenshot.getMainWindow();
		if (manager.generation() !== gen || winAfter === null || winAfter.isDestroyed() || event.sender !== winAfter.webContents) throw new Error("terminal-create superseded by a renderer navigation");
		return manager.create(asTerminalCreateOptions(payload));
	});
	electron.ipcMain.on(require_screenshot.IPC.terminalInput, (_event, payload) => {
		if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return;
		const { id, data } = payload;
		if (typeof id !== "string" || id === "" || typeof data !== "string") return;
		require_screenshot.getTerminalManager().write(id, data);
	});
	electron.ipcMain.on(require_screenshot.IPC.terminalResize, (_event, payload) => {
		if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return;
		const { id, cols, rows } = payload;
		if (typeof id !== "string" || id === "") return;
		if (typeof cols !== "number" || !Number.isFinite(cols)) return;
		if (typeof rows !== "number" || !Number.isFinite(rows)) return;
		require_screenshot.getTerminalManager().resize(id, cols, rows);
	});
	electron.ipcMain.on(require_screenshot.IPC.terminalClose, (_event, payload) => {
		if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return;
		const { id } = payload;
		if (typeof id !== "string" || id === "") return;
		require_screenshot.getTerminalManager().close(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserGetSessions, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-get-sessions: unknown sender");
		return getBrowserSessions().getSessions();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserSaveSessions, (event, value) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-save-sessions: unknown sender");
		const sessions = require_screenshot.asBrowserPanelSessions(value);
		if (sessions === null) throw new Error("browser-save-sessions: invalid state");
		getBrowserSessions().saveSessions(sessions.flatMap((session) => {
			const tabs = session.tabs.filter((tab) => !require_screenshot.browserShowsLocalFile(tab.browserId));
			if (tabs.length === 0) return [];
			return [{
				...session,
				tabs,
				activeBrowserId: tabs.some((tab) => tab.browserId === session.activeBrowserId) ? session.activeBrowserId : null
			}];
		}));
	});
	electron.ipcMain.on(require_screenshot.IPC.browserSuspend, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) return;
		const id = require_screenshot.asBrowserId(browserId);
		if (id !== null) require_screenshot.suspendBrowser(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserGetState, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-get-state: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-get-state: invalid browser id");
		return require_screenshot.restoreBrowser(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserTabCommand, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-tab-command: unknown sender");
		if (!require_screenshot.isBrowserTabCommand(payload)) throw new Error("browser-tab-command: invalid request");
		return require_screenshot.browserTabCommand(payload);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserClone, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-clone: unknown sender");
		const request = require_screenshot.asBrowserCloneRequest(payload);
		if (request === null) throw new Error("browser-clone: invalid browser ids");
		return require_screenshot.cloneBrowser(request.sourceId, request.targetId);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserNavigate, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-navigate: unknown sender");
		const request = require_screenshot.asBrowserNavigateRequest(payload);
		if (request === null) throw new Error("browser-navigate: invalid payload");
		require_screenshot.takeOverBrowser(request.browserId);
		if (require_screenshot.isLocalFileUrl(request.address)) {
			if (require_screenshot.takeLocalLinkGrant(request.address)) return require_screenshot.openBrowserLocalFile(request.browserId, request.address);
			const generation = require_screenshot.getTerminalManager().generation();
			const tabGeneration = require_screenshot.getBrowserGeneration(request.browserId);
			return localPagesAllowed().then((allowed) => {
				if (!allowed) throw new Error("browser-navigate: local pages need a build with file:// privileges turned off");
				return resolveLocalHtmlFileUrl(request.address);
			}).then((url) => {
				if (require_screenshot.getTerminalManager().generation() !== generation) return require_screenshot.getBrowserState(request.browserId);
				if (require_screenshot.getBrowserGeneration(request.browserId) !== tabGeneration) return require_screenshot.getBrowserState(request.browserId);
				return require_screenshot.openBrowserLocalFile(request.browserId, url);
			});
		}
		return require_screenshot.navigateBrowser(request.browserId, request.address);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserLocalPagesAllowed, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-local-pages-allowed: unknown sender");
		return localPagesAllowed();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserOpenLocalFile, async (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-open-local-file: unknown sender");
		const request = require_screenshot.asBrowserNavigateRequest(payload);
		if (request === null) throw new Error("browser-open-local-file: invalid payload");
		const generation = require_screenshot.getTerminalManager().generation();
		if (!await localPagesAllowed()) throw new Error("browser-open-local-file: local pages need a build with file:// privileges turned off");
		const url = await resolveLocalHtmlFileUrl(request.address, request.urlSuffix);
		if (!isMainRendererSender(event.sender)) throw new Error("browser-open-local-file: unknown sender");
		if (require_screenshot.getTerminalManager().generation() !== generation) return;
		require_screenshot.takeOverBrowser(request.browserId);
		let failure;
		try {
			failure = (await require_screenshot.openBrowserLocalFile(request.browserId, url)).error;
		} catch (error) {
			failure = error instanceof Error ? error.message : String(error);
		}
		if (require_screenshot.getTerminalManager().generation() !== generation) {
			require_screenshot.closeBrowser(request.browserId);
			return;
		}
		if (failure === void 0) return;
		require_screenshot.closeBrowser(request.browserId);
		throw new Error(`browser-open-local-file: ${failure}`);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserBack, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-back: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-back: invalid browser id");
		require_screenshot.takeOverBrowser(id);
		return require_screenshot.browserGoBack(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserForward, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-forward: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-forward: invalid browser id");
		require_screenshot.takeOverBrowser(id);
		return require_screenshot.browserGoForward(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserReload, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-reload: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-reload: invalid browser id");
		require_screenshot.takeOverBrowser(id);
		return require_screenshot.browserReload(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserFind, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-find: unknown sender");
		const request = require_screenshot.browserValidators$1.find.Parse(payload);
		if (request === null) throw new Error("browser-find: invalid payload");
		require_screenshot.takeOverBrowser(request.browserId);
		require_screenshot.browserFind(request.browserId, request.text, {
			forward: request.forward,
			findNext: request.findNext
		});
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserStopFind, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-stop-find: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-stop-find: invalid browser id");
		require_screenshot.browserStopFind(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserPrint, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-print: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-print: invalid browser id");
		require_screenshot.takeOverBrowser(id);
		return require_screenshot.browserPrint(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserSetFocusEmulation, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown browser focus sender");
		const request = require_screenshot.asBrowserFocusEmulationRequest(payload);
		if (request === null) throw new Error("Invalid focus emulation request");
		require_screenshot.takeOverBrowser(request.browserId);
		return require_screenshot.updateBrowserFocusEmulation(request.browserId, request.enabled);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserZoom, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-zoom: unknown sender");
		const request = require_screenshot.asBrowserZoomRequest(payload);
		if (request === null) throw new Error("browser-zoom: invalid payload");
		require_screenshot.takeOverBrowser(request.browserId);
		return require_screenshot.browserZoom(request.browserId, request.action);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserToggleDeviceMode, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-toggle-device-mode: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-toggle-device-mode: invalid browser id");
		require_screenshot.takeOverBrowser(id);
		return require_screenshot.toggleBrowserDeviceMode(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserSetDeviceMode, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-set-device-mode: unknown sender");
		const update = require_screenshot.asBrowserDeviceModeUpdate(payload);
		if (update === null) throw new Error("browser-set-device-mode: invalid payload");
		require_screenshot.takeOverBrowser(update.browserId);
		return require_screenshot.updateBrowserDeviceMode(update.browserId, update.request);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserCaptureBackdrop, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-capture-backdrop: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-capture-backdrop: invalid browser id");
		return require_screenshot.captureBrowserBackdrop(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserCaptureScreenshot, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-capture-screenshot: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-capture-screenshot: invalid browser id");
		require_screenshot.takeOverBrowser(id);
		return require_screenshot.captureBrowserScreenshot(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserFocusChrome, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown browser focus sender");
		const host = require_screenshot.getMainWindow();
		if (host?.isFocused()) host.webContents.focus();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserGetPermissionRequests, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown browser permission sender");
		return require_screenshot.getBrowserPermissionRequests();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserResolvePermissionRequest, (event, value) => {
		if (!isMainRendererSender(event.sender) || !require_screenshot.browserValidators$2.BrowserPermissionDecisionSchema.Check(value)) throw new Error("Invalid browser permission decision");
		return require_screenshot.resolveBrowserPermissionRequest(value);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserGetSites, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown site settings sender");
		return require_screenshot.getBrowserSites();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserGetSite, (event, value) => {
		const origin = require_screenshot.browserSiteOrigin(value);
		if (!isMainRendererSender(event.sender) || origin === null) throw new Error("Invalid site");
		return require_screenshot.getBrowserSite(origin);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserSetSitePermission, (event, value) => {
		const update = require_screenshot.asBrowserSitePermissionUpdate(value);
		if (!isMainRendererSender(event.sender) || update === null) throw new Error("Invalid site permission");
		return require_screenshot.updateBrowserSitePermission(update.origin, update.permission, update.setting);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserClearSiteData, (event, value) => {
		const origin = require_screenshot.browserSiteOrigin(value);
		if (!isMainRendererSender(event.sender) || origin === null) throw new Error("Invalid site");
		for (const browserId of require_screenshot.browserIdsForSite(origin)) require_screenshot.takeOverBrowser(browserId);
		return require_screenshot.clearBrowserSiteData(origin);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserGetSystemPermissionStates, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown system permission sender");
		return getBrowserSystemPermissionDenials();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserOpenSystemPermissionSettings, (event, value) => {
		if (!isMainRendererSender(event.sender) || !require_screenshot.isBrowserSitePermission(value)) throw new Error("Invalid system permission settings request");
		return openBrowserSystemPermissionSettings(value);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserGetData, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-get-data: unknown sender");
		return require_screenshot.getBrowserData();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserUpdatePreferences, (event, patch) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-update-preferences: unknown sender");
		if (!require_screenshot.isBrowserPreferencesPatch(patch)) throw new Error("browser-update-preferences: invalid payload");
		const raw = patch;
		const next = require_screenshot.updateBrowserPreferences(raw);
		if (raw["defaultZoomFactor"] !== void 0) {
			require_screenshot.takeOverAllBrowsers();
			require_screenshot.applyDefaultBrowserZoom(next.preferences.defaultZoomFactor);
		}
		return next;
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserClearHistory, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-clear-history: unknown sender");
		require_screenshot.forgetBrowserSiteVisits();
		return require_screenshot.clearBrowserHistory();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserClearDownloads, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-clear-downloads: unknown sender");
		return require_screenshot.clearBrowserDownloads();
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserOpenDownload, (event, payload) => {
		const request = isMainRendererSender(event.sender) ? require_screenshot.asBrowserDownloadAction(payload) : null;
		if (request === null) throw new Error("browser-open-download: invalid request");
		if (request.action === "retry") return require_screenshot.retryBrowserViewDownload(request.id);
		if (request.action !== "open" && request.action !== "show") return require_screenshot.controlBrowserDownload({
			id: request.id,
			action: request.action
		});
		return require_screenshot.openBrowserDownload({
			id: request.id,
			action: request.action
		}, {
			shell: electron.shell,
			showMessageBox: async (options) => {
				const host = require_screenshot.getMainWindow();
				if (host === null || host.isDestroyed()) return options.cancelId ?? -1;
				return (await electron.dialog.showMessageBox(host, options)).response;
			},
			strings: () => (require_screenshot.effectiveContextMenuLocale() === "zh" ? require_screenshot.browser_default : require_screenshot.browser_default$1).downloads
		});
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserRemoveDownload, (event, id) => {
		if (!isMainRendererSender(event.sender) || !require_screenshot.isBrowserDownloadId(id)) throw new Error("browser-remove-download: invalid request");
		return require_screenshot.removeBrowserDownload(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserGetDownloads, (event) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-get-downloads: unknown sender");
		return require_screenshot.readBrowserDownloads();
	});
	let downloadsWatched = false;
	let downloadsWatcher = null;
	electron.ipcMain.on(require_screenshot.IPC.browserWatchDownloads, (event, watch) => {
		if (!isMainRendererSender(event.sender) || !require_screenshot.isBrowserDownloadsWatch(watch)) return;
		downloadsWatched = watch;
		if (!watch || downloadsWatcher === event.sender) return;
		const contents = event.sender;
		downloadsWatcher = contents;
		const reset = () => {
			contents.removeListener("did-start-loading", reset);
			contents.removeListener("destroyed", reset);
			if (downloadsWatcher !== contents) return;
			downloadsWatcher = null;
			downloadsWatched = false;
		};
		contents.on("did-start-loading", reset);
		contents.on("destroyed", reset);
	});
	require_screenshot.onBrowserDownloadsChanged(() => {
		if (downloadsWatched) require_screenshot.sendToRenderer(require_screenshot.IPC.browserDownloads, require_screenshot.getBrowserDownloadItems());
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserClearData, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) throw new Error("browser-clear-data: unknown sender");
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) throw new Error("browser-clear-data: invalid browser id");
		require_screenshot.takeOverAllBrowsers();
		return require_screenshot.clearBrowserData(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserPickAnnotation, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown annotation sender");
		const request = require_screenshot.asBrowserAnnotationPickRequest(payload);
		if (request === null) throw new Error("Invalid annotation request");
		require_screenshot.takeOverBrowser(request.browserId);
		return require_screenshot.pickBrowserAnnotation(request.browserId, request.options);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserCancelAnnotationPick, (event, value) => {
		if (!isMainRendererSender(event.sender)) return;
		const id = require_screenshot.asBrowserId(value);
		if (id !== null) require_screenshot.cancelBrowserAnnotationPick(id);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserCompleteAnnotationCapture, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown annotation sender");
		const raw = require_screenshot.browserValidators$3.completion.Parse(payload);
		if (raw === null) throw new Error("Invalid annotation completion request");
		return require_screenshot.completeBrowserAnnotationCapture(raw.id, raw.action);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserCollectAnnotationAssets, (event, value) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown annotation sender");
		const retained = require_screenshot.browserValidators$3.retainedAssets.Parse(value);
		if (retained === null) throw new Error("Invalid annotation collection request");
		return require_screenshot.collectBrowserAnnotationAssets(retained);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserReadAnnotationAsset, (event, value) => {
		if (!isMainRendererSender(event.sender) || !require_screenshot.browserValidators$3.referenceId.Check(value)) throw new Error("Invalid annotation asset request");
		return require_screenshot.readBrowserAnnotationAsset(value);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserReadReceipt, (event, payload) => {
		const request = isMainRendererSender(event.sender) ? require_screenshot.browserValidators.read.Parse(payload) : null;
		if (request === null) throw new Error("Invalid receipt request");
		return require_screenshot.readBrowserReceipt(request.sessionId, request.receiptId);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserDeleteReceipts, (event, value) => {
		if (!isMainRendererSender(event.sender) || !require_screenshot.browserValidators.sessionId.Check(value)) throw new Error("Invalid receipt request");
		return require_screenshot.deleteBrowserReceipts(value);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserCopyReceipts, (event, payload) => {
		const request = isMainRendererSender(event.sender) ? require_screenshot.browserValidators.copy.Parse(payload) : null;
		if (request === null) throw new Error("Invalid receipt request");
		return require_screenshot.copyBrowserReceipts(request.sourceId, request.targetId);
	});
	electron.ipcMain.handle(require_screenshot.IPC.browserShowAnnotation, (event, payload) => {
		if (!isMainRendererSender(event.sender)) throw new Error("Unknown annotation sender");
		const raw = require_screenshot.browserValidators$3.marker.Parse(payload);
		if (raw === null) throw new Error("Invalid annotation marker request");
		return require_screenshot.showBrowserAnnotation(raw.id, raw.ordinal, raw.locate);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserHideAnnotation, (event, value) => {
		if (!isMainRendererSender(event.sender) || !require_screenshot.browserValidators$3.referenceId.Check(value)) return;
		require_screenshot.hideBrowserAnnotation(value);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserSetBounds, (event, payload) => {
		if (!isMainRendererSender(event.sender)) return;
		const request = require_screenshot.asBrowserBoundsRequest(payload);
		if (request !== null) require_screenshot.setBrowserBounds(request.browserId, request.bounds);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserControlReady, (event) => require_screenshot.markBrowserControlReady(event.sender));
	electron.ipcMain.on(require_screenshot.IPC.browserControlTakeover, (event, payload) => require_screenshot.handleBrowserControlTakeover(event.sender, payload));
	electron.ipcMain.on(require_screenshot.IPC.browserSetControls, (event, payload) => {
		if (isMainRendererSender(event.sender) && require_screenshot.isBrowserControlConfig(payload)) require_screenshot.setBrowserControls(payload);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserSetVisible, (event, payload) => {
		if (!isMainRendererSender(event.sender)) return;
		const request = require_screenshot.asBrowserVisibilityRequest(payload);
		if (request !== null) require_screenshot.setBrowserVisible(request.browserId, request.visible);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserClose, (event, browserId) => {
		if (!isMainRendererSender(event.sender)) return;
		const id = require_screenshot.asBrowserId(browserId);
		if (id === null) return;
		require_screenshot.takeOverClosedBrowser(id);
		require_screenshot.closeBrowser(id);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserAutomationUiResponse, (event, payload) => {
		require_screenshot.handleBrowserUiResponse(event.sender, payload);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayOpen, (event, payload) => {
		if (!isMainRendererSender(event.sender)) return;
		const request = require_screenshot.asBrowserOverlayMenuRequest(payload);
		if (request !== null) require_screenshot.openBrowserOverlayMenu(request);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayClose, (event, menuId) => {
		if (!isMainRendererSender(event.sender)) return;
		const id = require_screenshot.asBrowserOverlayMenuId(menuId);
		if (id !== null) require_screenshot.closeBrowserOverlayMenu(id);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayDialogOpen, (event, payload) => {
		if (!isMainRendererSender(event.sender)) return;
		const request = require_screenshot.asBrowserOverlayDialogRequest(payload);
		if (request !== null) require_screenshot.openBrowserOverlayDialog(request);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayDialogClose, (event, dialogId) => {
		if (!isMainRendererSender(event.sender)) return;
		const id = require_screenshot.asBrowserOverlayMenuId(dialogId);
		if (id !== null) require_screenshot.closeBrowserOverlayDialog(id, "programmatic");
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayReady, (event) => {
		if (require_screenshot.isBrowserOverlaySender(event.sender)) require_screenshot.markBrowserOverlayReady(event.sender);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayRendered, (event, payload) => {
		if (!require_screenshot.isBrowserOverlaySender(event.sender)) return;
		const rendered = require_screenshot.asBrowserOverlayRendered(payload);
		if (rendered !== null) require_screenshot.showBrowserOverlayRendered(event.sender, rendered);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayHidden, (event, payload) => {
		if (!require_screenshot.isBrowserOverlaySender(event.sender)) return;
		const hidden = require_screenshot.asBrowserOverlayVisibilityRequest(payload);
		if (hidden !== null) require_screenshot.markBrowserOverlayHidden(event.sender, hidden);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayActivate, (event, payload) => {
		if (!require_screenshot.isBrowserOverlaySender(event.sender)) return;
		const request = require_screenshot.asBrowserOverlayActivateRequest(payload);
		if (request !== null) require_screenshot.activateBrowserOverlayItem(event.sender, request);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayFormAction, (event, raw) => {
		if (!require_screenshot.isBrowserOverlaySender(event.sender)) return;
		const action = require_screenshot.asBrowserOverlayFormAction(raw);
		if (action !== null) require_screenshot.submitBrowserOverlayForm(event.sender, action);
	});
	electron.ipcMain.on(require_screenshot.IPC.browserOverlayDismiss, (event, payload) => {
		if (!require_screenshot.isBrowserOverlaySender(event.sender)) return;
		const request = require_screenshot.asBrowserOverlayDismissRequest(payload);
		if (request !== null) require_screenshot.dismissBrowserOverlay(event.sender, request);
	});
	require_screenshot.onStateChange((state) => require_screenshot.sendToRenderer(require_screenshot.IPC.prPreviewEvent, state));
	electron.ipcMain.handle(require_screenshot.IPC.prPreviewGetState, () => require_screenshot.isPrPreviewAvailable() ? require_screenshot.getState() : null);
	electron.ipcMain.handle(require_screenshot.IPC.prPreviewStart, async (_event, payload) => {
		let target;
		if (typeof payload === "number" && Number.isInteger(payload) && payload >= 1 && payload <= 999999) target = {
			kind: "pr",
			pr: payload
		};
		else if (payload !== null && typeof payload === "object" && !Array.isArray(payload)) {
			const raw = payload;
			if (raw.kind === "pr" && typeof raw.pr === "number" && Number.isInteger(raw.pr) && raw.pr >= 1 && raw.pr <= 999999) target = {
				kind: "pr",
				pr: raw.pr
			};
			else if (raw.kind === "ref" && typeof raw.ref === "string" && require_screenshot.isValidPreviewRef(raw.ref)) target = {
				kind: "ref",
				ref: raw.ref
			};
			else throw new Error("pr-preview-start: invalid target");
		} else throw new Error("pr-preview-start: invalid target");
		const distRootBefore = require_screenshot.getActiveDistRoot();
		const state = await require_screenshot.startPreview(target);
		if (state.phase === "active" && require_screenshot.getActiveDistRoot() !== distRootBefore) {
			const distRoot = require_screenshot.getActiveDistRoot();
			if (distRoot !== null) {
				const target2 = require_screenshot.resolveConnectTarget(process.env["KIMI_SERVER_URL"], require_screenshot.readServerToken);
				const origin = target2.external ? target2.origin : require_screenshot.embeddedServerOrigin();
				if (origin !== null) require_screenshot.openPreviewWindow({
					label: state.label ?? (state.pr !== void 0 ? `#${state.pr}` : "?"),
					distRoot,
					origin,
					...target2.external && target2.token !== void 0 ? { token: target2.token } : {},
					embedded: !target2.external
				}, require_screenshot.setPreviewDistRoot);
			}
		}
		return state;
	});
	electron.ipcMain.handle(require_screenshot.IPC.prPreviewListRefs, () => require_screenshot.listPreviewRefs());
	electron.ipcMain.handle(require_screenshot.IPC.prPreviewStop, async () => {
		require_screenshot.stopPreview();
		await require_screenshot.whenBuildSettled();
		require_screenshot.closePreviewWindow();
		require_screenshot.setPreviewDistRoot(null);
		return require_screenshot.getState();
	});
	electron.ipcMain.handle(require_screenshot.IPC.prPreviewCancel, async () => {
		require_screenshot.cancelPreview();
		await require_screenshot.whenBuildSettled();
		return require_screenshot.getState();
	});
	electron.ipcMain.handle(require_screenshot.IPC.prPreviewCleanup, () => require_screenshot.isPrPreviewAvailable() ? require_screenshot.cleanupPreviews() : 0);
}
//#endregion
//#region src/main/canary-updater.ts
const CANARY_REPO_SLUG = "MoonshotAI/kimi-code-app";
function patchGithubProviderForChannel(provider, channel) {
	provider.getDefaultChannelName = () => provider.getCustomChannelName(channel);
	provider.getBlockMapFiles = async (_zipFileUrl, oldVersion, newVersion) => {
		const listAssets = async (version) => {
			const body = await provider.httpRequest(new URL(`https://api.github.com/repos/${CANARY_REPO_SLUG}/releases/tags/v${version}`), provider.configureHeaders("application/vnd.github+json"));
			let parsed;
			try {
				parsed = JSON.parse(body ?? "{}");
			} catch {
				throw new Error(`cannot parse release assets for ${version}`);
			}
			if (!Array.isArray(parsed.assets)) throw new Error(`no assets on release ${version}`);
			return parsed.assets.filter((asset) => typeof asset.name === "string" && typeof asset.url === "string").map((asset) => ({
				name: asset.name,
				url: asset.url
			}));
		};
		const findBlockmap = (assets, version) => {
			const zip = assets.find((asset) => asset.name.endsWith(".zip") && asset.name.includes(`-${version}-`));
			const blockmap = zip === void 0 ? void 0 : assets.find((asset) => asset.name === `${zip.name}.blockmap`);
			if (blockmap === void 0) throw new Error(`blockmap asset for ${version} not found`);
			return new URL(blockmap.url);
		};
		const [newAssets, oldAssets] = await Promise.all([listAssets(newVersion), listAssets(oldVersion)]);
		return [findBlockmap(oldAssets, oldVersion), findBlockmap(newAssets, newVersion)];
	};
}
const execFileAsync = (0, node_util.promisify)(node_child_process.execFile);
async function resolveGhToken(deps = {
	exists: node_fs.existsSync,
	platform: process.platform
}) {
	const exec = deps.exec ?? execFileAsync;
	try {
		const { stdout } = await exec(resolveGhBinary(deps), ["auth", "token"], { timeout: 15e3 });
		const token = stdout.trim();
		return token === "" ? null : token;
	} catch {
		return null;
	}
}
function initCanaryGithubUpdater(setController) {
	if (!require_release_channel.isCanaryVersion(electron.app.getVersion())) return;
	const channel = require_screenshot.updateChannelFromVersion(electron.app.getVersion());
	(async () => {
		const token = await resolveGhToken();
		if (token === null) {
			require_protocol.log.warn("[kimi-desktop] canary auto-update unavailable: gh auth token missing (run gh auth login)");
			return;
		}
		const updater = electron_updater.autoUpdater;
		updater.allowPrerelease = true;
		updater.setFeedURL?.({
			provider: "github",
			owner: "MoonshotAI",
			repo: "kimi-code-app",
			private: true,
			token
		});
		updater.clientPromise?.then((provider) => patchGithubProviderForChannel(provider, channel)).catch((error) => {
			require_protocol.log.error("[kimi-desktop] failed to patch canary update provider", error);
		});
		setController(require_screenshot.startAutoUpdater({
			updater,
			send: (status) => require_screenshot.sendToRenderer(require_screenshot.IPC.updateStatus, status),
			isPackaged: electron.app.isPackaged,
			autoDownload: require_screenshot.isUpdateAutoDownloadEnabled(),
			fetchNotes: () => Promise.resolve({})
		}));
		require_protocol.log.info(`[kimi-desktop] canary auto-update enabled (github provider, channel=${channel})`);
	})();
}
//#endregion
//#region src/main/deep-link.ts
const DEEP_LINK_SCHEME = "kimi-code";
function isKnownDeepLink(url) {
	try {
		const parsed = new URL(url);
		return parsed.protocol === `kimi-code:` && parsed.host.toLowerCase() === "auth" && parsed.pathname === "/success" && parsed.search === "" && parsed.hash === "";
	} catch {
		return false;
	}
}
function extractDeepLink(argv) {
	const prefix = `${DEEP_LINK_SCHEME}://`;
	return argv.find((arg) => arg.toLowerCase().startsWith(prefix));
}
function registerDeepLinkScheme() {
	if (process.platform === "darwin") return;
	if (!(process.platform === "win32") && electron.app.isPackaged) return;
	try {
		if (electron.app.isPackaged) electron.app.setAsDefaultProtocolClient(DEEP_LINK_SCHEME);
		else electron.app.setAsDefaultProtocolClient(DEEP_LINK_SCHEME, process.execPath, [process.argv[1] ?? "."]);
	} catch (error) {
		require_protocol.log.error("[kimi-desktop] deep link scheme registration failed", error);
	}
}
function handleDeepLink(url, showMainWindow, notifyAuth) {
	if (!isKnownDeepLink(url)) {
		require_protocol.log.warn(`[kimi-desktop] ignoring unknown deep link: ${require_protocol.redactUrlForLog(url)}`);
		return;
	}
	showMainWindow();
	notifyAuth?.();
}
//#endregion
//#region src/main/app.ts
function forwardLaunchArgs(argv) {
	const launch = require_screenshot.parseLaunchArgs(argv);
	if (launch.newChat) require_screenshot.sendLaunchAction({ action: "new-chat" });
	if (launch.workspace !== void 0) require_screenshot.sendLaunchAction({
		action: "open-workspace",
		root: launch.workspace
	});
}
function notifyDeepLinkAuth() {
	require_screenshot.sendToRenderer(require_screenshot.IPC.deepLinkAuth, void 0);
}
function handleSecondInstanceArgv(argv) {
	const deepLink = extractDeepLink(argv);
	if (deepLink !== void 0) {
		handleDeepLink(deepLink, require_screenshot.showMainWindow, notifyDeepLinkAuth);
		return;
	}
	require_screenshot.showMainWindow();
	forwardLaunchArgs(argv);
}
function main() {
	if (process.platform === "win32") electron.app.setAppUserModelId(require_release_channel.windowsAppId(electron.app.isPackaged, electron.app.getVersion()));
	if (electron.app.isPackaged && !electron.app.requestSingleInstanceLock()) {
		electron.app.quit();
		return;
	}
	registerDeepLinkScheme();
	const pendingSecondInstanceArgv = [];
	const pendingDeepLinks = [];
	let launchRoutingReady = false;
	electron.app.on("second-instance", (_event, argv) => {
		if (!launchRoutingReady) {
			pendingSecondInstanceArgv.push(argv);
			return;
		}
		handleSecondInstanceArgv(argv);
	});
	electron.app.on("open-url", (event, url) => {
		event.preventDefault();
		if (!launchRoutingReady) {
			pendingDeepLinks.push(url);
			return;
		}
		handleDeepLink(url, require_screenshot.showMainWindow, notifyDeepLinkAuth);
	});
	registerIpcHandlers();
	let telemetryFlushArmed = true;
	let quitConfirmState = "idle";
	electron.app.on("before-quit", (event) => {
		if (quitConfirmState !== "confirmed" && !require_screenshot.isQuitConfirmSkipped()) {
			event.preventDefault();
			if (quitConfirmState === "checking") return;
			quitConfirmState = "checking";
			shouldBlockQuitForBusySessions(require_screenshot.getMainWindow()).then((blocked) => {
				if (quitConfirmState !== "checking") return;
				if (blocked) {
					quitConfirmState = "idle";
					require_screenshot.cancelQuitting();
					require_screenshot.showMainWindow();
				} else {
					quitConfirmState = "confirmed";
					require_screenshot.markQuitting();
					electron.app.quit();
				}
			}, (error) => {
				require_protocol.log.warn(`[kimi-desktop] quit confirmation skipped: busy session check failed (${error instanceof Error ? error.message : String(error)})`);
				if (quitConfirmState !== "checking") return;
				quitConfirmState = "confirmed";
				require_screenshot.markQuitting();
				electron.app.quit();
			});
			return;
		}
		quitConfirmState = "confirmed";
		require_protocol.log.info("[kimi-desktop] quitting");
		for (const cleanup of [
			require_screenshot.destroyBrowserView,
			require_screenshot.flushBrowserRecords,
			require_screenshot.finalizeWindowLifecycle,
			require_screenshot.shutdownScreenshot,
			require_release_channel.stopShellEnvProbe,
			require_screenshot.killAllTerminals,
			require_screenshot.killActiveBuild,
			destroyTray,
			unregisterGlobalShortcuts,
			require_screenshot.closeServerHandle
		]) try {
			Promise.resolve(cleanup()).catch((error) => {
				require_protocol.log.error("[kimi-desktop] shutdown step failed", error);
			});
		} catch (error) {
			require_protocol.log.error("[kimi-desktop] shutdown step failed", error);
		}
		if (telemetryFlushArmed) {
			const flush = require_screenshot.shutdownServerTelemetry();
			if (flush !== null) {
				telemetryFlushArmed = false;
				event.preventDefault();
				flush.then(() => electron.app.quit(), () => electron.app.quit());
			}
		}
	});
	electron.app.on("window-all-closed", () => {
		if (process.platform !== "darwin") electron.app.quit();
	});
	electron.app.whenReady().then(() => {
		require_protocol.log.info(`[kimi-desktop] app ready (version=${electron.app.getVersion()} platform=${process.platform} arch=${process.arch} packaged=${electron.app.isPackaged})`);
		const launch = require_screenshot.parseLaunchArgs(process.argv);
		require_protocol.trackDesktopEvent("app_launched", { launch_intent: launch.newChat || launch.workspace !== void 0 ? "jump_list" : "normal" });
		require_protocol.trackDesktopEvent("startup_timing", {
			phase: "main_ready",
			duration_ms: Math.round(process.uptime() * 1e3)
		});
		electron.app.on("child-process-gone", (_event, details) => {
			if (details.type === "GPU" && details.reason !== "clean-exit") require_protocol.trackDesktopEvent("app_crashed", {
				process: "gpu",
				kind: details.reason,
				app_uptime_ms: Math.round(process.uptime() * 1e3)
			});
		});
		initDockIcon();
		require_protocol.registerRendererProtocol(require_screenshot.rendererDistRoot);
		require_screenshot.initScreenshot();
		require_screenshot.scheduleBrowserReceiptPruning();
		require_screenshot.initPreviewSession(require_screenshot.getPreviewDistRoot);
		try {
			require_screenshot.sweepStalePreviews();
		} catch (error) {
			require_protocol.log.error("[kimi-desktop] PR preview boot sweep failed", error);
		}
		require_screenshot.buildMenu();
		require_screenshot.createWindow();
		createTray({
			showMainWindow: require_screenshot.showMainWindow,
			openSession: (sessionId) => {
				require_screenshot.showMainWindow();
				require_screenshot.selectSessionInRenderer(sessionId);
			},
			quit: () => electron.app.quit()
		});
		if (require_release_channel.isCanaryVersion(electron.app.getVersion())) initCanaryGithubUpdater(require_screenshot.setUpdateController);
		else if (!require_release_channel.isPreviewVersion(electron.app.getVersion())) require_screenshot.initAutoUpdater();
		forwardLaunchArgs(process.argv);
		for (const argv of pendingSecondInstanceArgv.splice(0)) handleSecondInstanceArgv(argv);
		const deepLinks = pendingDeepLinks.splice(0);
		launchRoutingReady = true;
		for (const url of deepLinks) handleDeepLink(url, require_screenshot.showMainWindow, notifyDeepLinkAuth);
		electron.app.on("activate", () => {
			require_screenshot.showMainWindow();
		});
	});
}
//#endregion
exports.main = main;
