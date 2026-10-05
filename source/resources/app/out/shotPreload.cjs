let electron = require("electron");
//#region src/main/screenshot-overlay-preload.ts
const CHANNELS = {
	loaded: "kimi:shot-loaded",
	setContext: "kimi:shot-set-context",
	windowCandidates: "kimi:shot-window-candidates",
	failed: "kimi:shot-failed",
	action: "kimi:shot-action",
	cancel: "kimi:shot-cancel",
	bandStart: "kimi:shot-band-start",
	bandEnd: "kimi:shot-band-end",
	previewEnabled: "kimi:shot-preview-enabled",
	ready: "kimi:shot-ready",
	editText: "kimi:shot-edit-text",
	clearSelection: "kimi:shot-clear-selection",
	pointerEnter: "kimi:shot-pointer-enter",
	pointerLeave: "kimi:shot-pointer-leave"
};
function finite(value) {
	return typeof value === "number" && Number.isFinite(value);
}
function validOutputPayload(value) {
	if (typeof value !== "object" || value === null) return false;
	const payload = value;
	if (typeof payload["captureId"] !== "string" || payload["captureId"] === "") return false;
	if (payload["action"] !== "add" && payload["action"] !== "copy" && payload["action"] !== "save" && payload["action"] !== "pin") return false;
	if (typeof payload["displayId"] !== "string" || payload["displayId"] === "") return false;
	if (!(payload["pngBytes"] instanceof Uint8Array)) return false;
	if (!finite(payload["width"]) || !finite(payload["height"])) return false;
	return typeof payload["comment"] === "string" && payload["comment"].length <= 2e4;
}
electron.contextBridge.exposeInMainWorld("shotBridge", {
	platform: process.platform,
	loaded: () => electron.ipcRenderer.send(CHANNELS.loaded),
	perform: async (payload) => {
		if (!validOutputPayload(payload)) return {
			status: "error",
			reason: "invalid-payload"
		};
		return electron.ipcRenderer.invoke(CHANNELS.action, payload);
	},
	cancel: (captureId) => electron.ipcRenderer.send(CHANNELS.cancel, captureId),
	bandStart: (captureId) => electron.ipcRenderer.send(CHANNELS.bandStart, captureId),
	bandEnd: (captureId) => electron.ipcRenderer.send(CHANNELS.bandEnd, captureId),
	pointerEnter: (captureId) => electron.ipcRenderer.send(CHANNELS.pointerEnter, captureId),
	ready: (captureId) => electron.ipcRenderer.send(CHANNELS.ready, captureId),
	editText: (captureId, command) => {
		if (command === "selectAll" || command === "cut" || command === "copy" || command === "paste" || command === "undo" || command === "redo") electron.ipcRenderer.send(CHANNELS.editText, captureId, command);
	},
	failed: (captureId, stage) => electron.ipcRenderer.send(CHANNELS.failed, captureId, stage),
	onContext: (cb) => {
		if (typeof cb !== "function") return () => void 0;
		const listener = (_event, context) => cb(context);
		electron.ipcRenderer.on(CHANNELS.setContext, listener);
		return () => electron.ipcRenderer.removeListener(CHANNELS.setContext, listener);
	},
	onWindowCandidates: (cb) => {
		if (typeof cb !== "function") return () => void 0;
		const listener = (_event, captureId, windows) => cb(captureId, windows);
		electron.ipcRenderer.on(CHANNELS.windowCandidates, listener);
		return () => electron.ipcRenderer.removeListener(CHANNELS.windowCandidates, listener);
	},
	onClearSelection: (cb) => {
		if (typeof cb !== "function") return () => void 0;
		const listener = (_event, captureId) => cb(captureId);
		electron.ipcRenderer.on(CHANNELS.clearSelection, listener);
		return () => electron.ipcRenderer.removeListener(CHANNELS.clearSelection, listener);
	},
	onPreviewEnabled: (cb) => {
		if (typeof cb !== "function") return () => void 0;
		const listener = (_event, captureId) => cb(captureId);
		electron.ipcRenderer.on(CHANNELS.previewEnabled, listener);
		return () => electron.ipcRenderer.removeListener(CHANNELS.previewEnabled, listener);
	},
	onPointerLeave: (cb) => {
		if (typeof cb !== "function") return () => void 0;
		const listener = (_event, captureId) => cb(captureId);
		electron.ipcRenderer.on(CHANNELS.pointerLeave, listener);
		return () => electron.ipcRenderer.removeListener(CHANNELS.pointerLeave, listener);
	}
});
//#endregion
