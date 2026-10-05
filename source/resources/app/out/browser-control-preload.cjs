let electron = require("electron");
//#region ../../node_modules/.pnpm/typebox@1.3.30/node_modules/typebox/build/guard/string.mjs
function IsBetween(value, min, max) {
	return value >= min && value <= max;
}
function IsZeroWidthJoiner(value) {
	return value === 8205;
}
function IsHighSurrogate(value) {
	return IsBetween(value, 55296, 56319);
}
function IsRegionalIndicator(value) {
	return IsBetween(value, 127462, 127487);
}
function IsVariationSelector(value) {
	return IsBetween(value, 65024, 65039);
}
function IsCombiningMark(value) {
	return IsBetween(value, 768, 879) || IsBetween(value, 6832, 6911) || IsBetween(value, 7616, 7679) || IsBetween(value, 65056, 65071);
}
function CodePointLength(value) {
	return value > 65535 ? 2 : 1;
}
function ConsumeModifiers(value, index) {
	while (index < value.length) {
		const point = value.codePointAt(index);
		if (IsCombiningMark(point) || IsVariationSelector(point)) index += CodePointLength(point);
		else break;
	}
	return index;
}
function NextGraphemeClusterIndex(value, clusterStart) {
	const startCP = value.codePointAt(clusterStart);
	let clusterEnd = clusterStart + CodePointLength(startCP);
	clusterEnd = ConsumeModifiers(value, clusterEnd);
	while (clusterEnd < value.length - 1 && IsZeroWidthJoiner(value.codePointAt(clusterEnd))) {
		const nextCP = value.codePointAt(clusterEnd + 1);
		clusterEnd += 1 + CodePointLength(nextCP);
		clusterEnd = ConsumeModifiers(value, clusterEnd);
	}
	if (IsRegionalIndicator(startCP) && clusterEnd < value.length && IsRegionalIndicator(value.codePointAt(clusterEnd))) clusterEnd += CodePointLength(value.codePointAt(clusterEnd));
	return clusterEnd;
}
function IsGraphemeCodePoint(value) {
	return value >= 768 && (IsHighSurrogate(value) || IsCombiningMark(value) || IsVariationSelector(value) || IsZeroWidthJoiner(value));
}
/** Checks if a string has at least a minimum number of grapheme clusters */
function IsMinLengthSegmented(value, minLength) {
	let count = 0;
	let index = 0;
	while (index < value.length) {
		index = NextGraphemeClusterIndex(value, index);
		if (++count >= minLength) return true;
	}
	return false;
}
/** Checks if a string has at most a maximum number of grapheme clusters */
function IsMaxLengthSegmented(value, maxLength) {
	let count = 0;
	let index = 0;
	while (index < value.length) {
		index = NextGraphemeClusterIndex(value, index);
		if (++count > maxLength) return false;
	}
	return true;
}
/** Fast check for minimum grapheme length, falls back to full check if needed */
function IsMinLength$1(value, minLength) {
	if (minLength === 0) return true;
	if (value.length < minLength) return false;
	let index = 0;
	while (true) {
		if (IsGraphemeCodePoint(value.charCodeAt(index))) return IsMinLengthSegmented(value, minLength);
		if (++index >= minLength) return true;
	}
}
/** Fast check for maximum grapheme length, falls back to full check if needed */
function IsMaxLength$1(value, maxLength) {
	if (value.length <= maxLength) return true;
	let index = 0;
	while (true) {
		if (IsGraphemeCodePoint(value.charCodeAt(index))) return IsMaxLengthSegmented(value, maxLength);
		if (++index > maxLength) return false;
	}
}
//#endregion
//#region ../../node_modules/.pnpm/typebox@1.3.30/node_modules/typebox/build/guard/guard.mjs
/** Returns true if the string has at most the given number of graphemes */
function IsMaxLength(value, length) {
	return IsMaxLength$1(value, length);
}
/** Returns true if the string has at least the given number of graphemes */
function IsMinLength(value, length) {
	return IsMinLength$1(value, length);
}
//#endregion
//#region \0browser-aot
const pattern0 = /* @__PURE__ */ new RegExp("^[A-Za-z0-9:_-]+$", "u");
const check_2 = ((value) => typeof value === "string" && IsMaxLength(value, 128) && IsMinLength(value, 1) && pattern0.test(value));
const check_3 = ((value) => typeof value === "boolean");
const check_41 = ((value) => check_2(value) || value === null);
const check_44 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "revision" in value && "startedAt" in value && "labels" in value && "colorScheme" in value && "reducedMotion" in value && "corners" in value && "insets" in value && check_2(value.browserId) && check_45(value.revision) && Number.isFinite(value.startedAt) && check_46(value.labels) && check_48(value.colorScheme) && check_3(value.reducedMotion) && check_49(value.corners) && check_49(value.insets) || value === null);
const check_45 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value <= 9007199254740991 && value >= -9007199254740991));
const check_46 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "running" in value && "elapsed" in value && "takeover" in value && "takeoverHint" in value && "pointer" in value && "typing" in value && "key" in value && "scrolling" in value && "activityTarget" in value && "activities" in value && check_47(value.running) && check_47(value.elapsed) && check_47(value.takeover) && check_47(value.takeoverHint) && check_47(value.pointer) && check_47(value.typing) && check_47(value.key) && check_47(value.scrolling) && check_47(value.activityTarget) && typeof value.activities === "object" && value.activities !== null && !Array.isArray(value.activities) && "reading" in value.activities && "inspecting" in value.activities && "capturing" in value.activities && "clicking" in value.activities && "hovering" in value.activities && "typing" in value.activities && "pressing" in value.activities && "selecting" in value.activities && "checking" in value.activities && "scrolling" in value.activities && "dragging" in value.activities && "navigating" in value.activities && "waiting" in value.activities && check_47(value.activities.reading) && check_47(value.activities.inspecting) && check_47(value.activities.capturing) && check_47(value.activities.clicking) && check_47(value.activities.hovering) && check_47(value.activities.typing) && check_47(value.activities.pressing) && check_47(value.activities.selecting) && check_47(value.activities.checking) && check_47(value.activities.scrolling) && check_47(value.activities.dragging) && check_47(value.activities.navigating) && check_47(value.activities.waiting));
const check_47 = ((value) => typeof value === "string" && IsMaxLength(value, 500));
const check_48 = ((value) => value === "light" || value === "dark");
const check_49 = ((value) => Array.isArray(value) && value.every((var_2, var_3) => var_3 < 4 || false) && (value.length <= 0 || check_50(value[0])) && (value.length <= 1 || check_50(value[1])) && (value.length <= 2 || check_50(value[2])) && (value.length <= 3 || check_50(value[3])) && value.length >= 4);
const check_50 = ((value) => Number.isFinite(value) && value <= 64 && value >= 0);
const check_51 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "revision" in value && "kind" in value && check_2(value.browserId) && check_45(value.revision) && (value.kind === "move" || value.kind === "down" || value.kind === "up" || value.kind === "type" || value.kind === "key" || value.kind === "scroll" || value.kind === "reset" || value.kind === "blocked") && (value.x === void 0 || !("x" in value) || Number.isFinite(value.x)) && (value.y === void 0 || !("y" in value) || Number.isFinite(value.y)) && (value.drag === void 0 || !("drag" in value) || check_3(value.drag)));
const check_52 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "revision" in value && "activity" in value && check_2(value.browserId) && check_45(value.revision) && (value.id === void 0 || !("id" in value) || check_53(value.id)) && (value.activity === "reading" || value.activity === "inspecting" || value.activity === "capturing" || value.activity === "clicking" || value.activity === "hovering" || value.activity === "typing" || value.activity === "pressing" || value.activity === "selecting" || value.activity === "checking" || value.activity === "scrolling" || value.activity === "dragging" || value.activity === "navigating" || value.activity === "waiting" || value.activity === null) && (value.scan === void 0 || !("scan" in value) || check_3(value.scan)) && (value.target === void 0 || !("target" in value) || typeof value.target === "string" && IsMaxLength(value.target, 80)) && (value.rect === void 0 || !("rect" in value) || typeof value.rect === "object" && value.rect !== null && !Array.isArray(value.rect) && "x" in value.rect && "y" in value.rect && "width" in value.rect && "height" in value.rect && Number.isFinite(value.rect.x) && Number.isFinite(value.rect.y) && Number.isFinite(value.rect.width) && Number.isFinite(value.rect.height)));
const check_53 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value <= 9007199254740991 && value >= 1));
const check_54 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "revision" in value && check_2(value.browserId) && check_45(value.revision));
const check_55 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "controls" in value && "labels" in value && "colorScheme" in value && "reducedMotion" in value && Array.isArray(value.controls) && value.controls.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "browserId" in element && "sessionId" in element && "turnId" in element && "status" in element && check_2(element.browserId) && check_2(element.sessionId) && check_41(element.turnId) && (element.status === "running" || element.status === "paused" || element.status === "unknown" || element.status === "idle")) && value.controls.length <= 1e3 && check_46(value.labels) && check_48(value.colorScheme) && check_3(value.reducedMotion));
const check_56 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "sessionIds" in value && "browserIds" in value && check_57(value.sessionIds) && check_57(value.browserIds));
const check_57 = ((value) => Array.isArray(value) && value.every((element, index) => check_2(element)));
const whole = (value) => value;
function pick(keys) {
	return (value) => Object.fromEntries(keys.filter((key) => Object.hasOwn(value, key)).map((key) => [key, value[key]]));
}
function validator(Check, project) {
	return {
		Check,
		Parse: (value) => Check(value) ? project(value) : null
	};
}
//#endregion
//#region src/shared/browser-control.ts
const browserValidators = {
	"surface": /* @__PURE__ */ validator(check_44, whole),
	"pointer": /* @__PURE__ */ validator(check_51, /* @__PURE__ */ pick([
		"browserId",
		"revision",
		"kind",
		"x",
		"y",
		"drag"
	])),
	"activity": /* @__PURE__ */ validator(check_52, /* @__PURE__ */ pick([
		"browserId",
		"revision",
		"id",
		"activity",
		"scan",
		"target",
		"rect"
	])),
	"takeover": /* @__PURE__ */ validator(check_54, /* @__PURE__ */ pick(["browserId", "revision"])),
	"BrowserControlConfigSchema": /* @__PURE__ */ validator(check_55, /* @__PURE__ */ pick([
		"controls",
		"labels",
		"colorScheme",
		"reducedMotion"
	])),
	"BrowserControlOwnershipSchema": /* @__PURE__ */ validator(check_56, /* @__PURE__ */ pick(["sessionIds", "browserIds"]))
};
//#endregion
//#region src/main/browser-control-preload.ts
electron.contextBridge.exposeInMainWorld("kimiBrowserControl", {
	ready: () => electron.ipcRenderer.send("kimi:browser-control-ready"),
	takeOver: (browserId, revision) => {
		if (browserValidators.takeover.Check({
			browserId,
			revision
		})) electron.ipcRenderer.send("kimi:browser-control-takeover", {
			browserId,
			revision
		});
	},
	onSurface: (cb) => {
		const listener = (_event, surface) => {
			if (browserValidators.surface.Check(surface)) cb(surface);
		};
		electron.ipcRenderer.on("kimi:browser-control-surface", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-control-surface", listener);
	},
	onActivity: (cb) => {
		const listener = (_event, activity) => {
			if (browserValidators.activity.Check(activity)) cb(activity);
		};
		electron.ipcRenderer.on("kimi:browser-control-activity", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-control-activity", listener);
	},
	onResizing: (cb) => {
		const listener = () => cb();
		electron.ipcRenderer.on("kimi:browser-control-resizing", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-control-resizing", listener);
	},
	onPointer: (cb) => {
		const listener = (_event, pointer) => {
			if (browserValidators.pointer.Check(pointer)) cb(pointer);
		};
		electron.ipcRenderer.on("kimi:browser-control-pointer", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-control-pointer", listener);
	}
});
//#endregion
