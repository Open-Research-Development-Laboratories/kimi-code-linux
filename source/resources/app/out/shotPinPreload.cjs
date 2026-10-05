let electron = require("electron");
//#region src/main/screenshot-pin-preload.ts
const CHANNELS = {
	close: "kimi:shot-pin-close",
	ready: "kimi:shot-pin-ready",
	resizeEdge: "kimi:shot-pin-resize-edge",
	resize: "kimi:shot-pin-resize",
	move: "kimi:shot-pin-move"
};
electron.contextBridge.exposeInMainWorld("pinBridge", {
	platform: process.platform,
	resizeFromEdge: (edge, deltaX, deltaY) => {
		if (typeof edge === "string" && typeof deltaX === "number" && Number.isFinite(deltaX) && typeof deltaY === "number" && Number.isFinite(deltaY)) electron.ipcRenderer.send(CHANNELS.resizeEdge, edge, deltaX, deltaY);
	},
	ready: () => electron.ipcRenderer.send(CHANNELS.ready, true),
	failed: () => electron.ipcRenderer.send(CHANNELS.ready, false),
	close: () => electron.ipcRenderer.send(CHANNELS.close),
	resize: (scaleDelta) => {
		if (typeof scaleDelta === "number" && Number.isFinite(scaleDelta)) electron.ipcRenderer.send(CHANNELS.resize, scaleDelta);
	},
	move: (deltaX, deltaY) => {
		if (typeof deltaX === "number" && Number.isFinite(deltaX) && typeof deltaY === "number" && Number.isFinite(deltaY)) electron.ipcRenderer.send(CHANNELS.move, deltaX, deltaY);
	}
});
//#endregion
