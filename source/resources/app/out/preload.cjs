Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
const pattern1 = /* @__PURE__ */ new RegExp("^[A-Za-z0-9_-]{1,128}$", "u");
const pattern2 = /* @__PURE__ */ new RegExp("^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$", "u");
const pattern3 = /* @__PURE__ */ new RegExp("^[a-zA-Z-]{2,32}$", "u");
const pattern4 = /* @__PURE__ */ new RegExp("(^requestId$|^ok$|^state$|^error$)", "u");
const pattern5 = /* @__PURE__ */ new RegExp("(^searchEngine$|^askWhereToSave$|^defaultZoomFactor$)", "u");
const pattern6 = /* @__PURE__ */ new RegExp("(^enabled$|^orientation$|^profileId$|^width$|^height$|^scaleMode$|^scale$)", "u");
const pattern7 = /* @__PURE__ */ new RegExp("^[A-Za-z0-9:_.-]+$", "u");
const pattern8 = /* @__PURE__ */ new RegExp("(^preserveFocus$|^dismissible$|^dialogId$|^title$|^message$|^confirmLabel$|^cancelLabel$|^closeLabel$|^variant$|^loading$|^initialFocus$|^anchor$|^boundary$|^annotation$|^viewport$|^input$|^checkbox$|^preview$|^auxiliary$|^kind$|^requestId$)", "u");
const pattern9 = /* @__PURE__ */ new RegExp("^data:image\\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$", "u");
const pattern10 = /* @__PURE__ */ new RegExp("^r-[0-9a-f]{12}$", "u");
const pattern11 = /* @__PURE__ */ new RegExp("(.*|^location$|^camera$|^microphone$|^notifications$|^clipboard$|^clipboardWrite$|^fullscreen$|^midi$|^midiSysex$)", "u");
const pattern12 = /* @__PURE__ */ new RegExp(".*", "u");
const check_1 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "enabled" in value && check_2(value.browserId) && check_3(value.enabled));
const check_2 = ((value) => typeof value === "string" && IsMaxLength(value, 128) && IsMinLength(value, 1) && pattern0.test(value));
const check_3 = ((value) => typeof value === "boolean");
const check_4 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "address" in value && check_2(value.browserId) && typeof value.address === "string" && IsMaxLength(value.address, 4096) && IsMinLength(value.address, 1) && (value.urlSuffix === void 0 || !("urlSuffix" in value) || check_5(value.urlSuffix)));
const check_5 = ((value) => typeof value === "string" && IsMaxLength(value, 4096));
const check_6 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "sourceId" in value && "targetId" in value && check_2(value.sourceId) && check_2(value.targetId));
const check_7 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "url" in value && check_2(value.browserId) && check_8(value.url) && (value.background === void 0 || !("background" in value) || check_3(value.background)));
const check_8 = ((value) => typeof value === "string" && IsMaxLength(value, 32768));
const check_9 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "text" in value && "forward" in value && "findNext" in value && check_2(value.browserId) && check_5(value.text) && check_3(value.forward) && check_3(value.findNext));
const check_10 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "action" in value && check_2(value.browserId) && (value.action === "in" || value.action === "out" || value.action === "reset"));
const check_11 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "bounds" in value && check_2(value.browserId) && check_12(value.bounds));
const check_12 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "x" in value && "y" in value && "width" in value && "height" in value && check_13(value.x) && check_13(value.y) && check_13(value.width) && check_13(value.height));
const check_13 = ((value) => Number.isFinite(value) && value >= 0);
const check_14 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "visible" in value && check_2(value.browserId) && check_3(value.visible));
const check_15 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "url" in value && "title" in value && "loading" in value && "canGoBack" in value && "canGoForward" in value && check_5(value.url) && (value.urlTruncated === void 0 || !("urlTruncated" in value) || check_3(value.urlTruncated)) && check_16(value.title) && (value.favicon === void 0 || !("favicon" in value) || typeof value.favicon === "string" && IsMaxLength(value.favicon, 131072) && IsMinLength(value.favicon, 1)) && (value.zoomFactor === void 0 || !("zoomFactor" in value) || check_17(value.zoomFactor)) && (value.emulateFocus === void 0 || !("emulateFocus" in value) || check_3(value.emulateFocus)) && (value.device === void 0 || !("device" in value) || check_18(value.device)) && (value.muted === void 0 || !("muted" in value) || check_3(value.muted)) && check_3(value.loading) && check_3(value.canGoBack) && check_3(value.canGoForward) && (value.error === void 0 || !("error" in value) || typeof value.error === "string"));
const check_16 = ((value) => typeof value === "string" && IsMaxLength(value, 512));
const check_17 = ((value) => Number.isFinite(value) && value <= 5 && value >= .25);
const check_18 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "profileId" in value && "orientation" in value && "width" in value && "height" in value && "deviceScaleFactor" in value && "mobile" in value && "touch" in value && "scaleMode" in value && "requestedScale" in value && "displayScale" in value && "maxDisplayScale" in value && (value.profileId === "responsive" || value.profileId === "iphone-se" || value.profileId === "iphone-12-pro" || value.profileId === "iphone-14-pro" || value.profileId === "iphone-14-pro-max" || value.profileId === "pixel-7" || value.profileId === "galaxy-s20-ultra" || value.profileId === "ipad-mini" || value.profileId === "ipad-pro-13" || value.profileId === "iphone-duo-outer" || value.profileId === "iphone-duo-inner" || value.profileId === "iphone-16" || value.profileId === "iphone-16-pro" || value.profileId === "iphone-16-pro-max" || value.profileId === "pixel-8" || value.profileId === "pixel-9" || value.profileId === "desktop-1280" || value.profileId === "desktop-1440" || value.profileId === "desktop-1920") && check_19(value.orientation) && check_20(value.width) && check_20(value.height) && Number.isFinite(value.deviceScaleFactor) && value.deviceScaleFactor > 0 && value.deviceScaleFactor <= 10 && check_3(value.mobile) && check_3(value.touch) && (value.scaleMode === "fit" || value.scaleMode === "fixed") && check_21(value.requestedScale) && check_21(value.displayScale) && check_21(value.maxDisplayScale));
const check_19 = ((value) => value === "portrait" || value === "landscape");
const check_20 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value <= 9999 && value >= 50));
const check_21 = ((value) => Number.isFinite(value) && value <= 1 && value >= .01);
const check_22 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "state" in value && check_2(value.browserId) && check_15(value.state));
const check_23 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "action" in value && Object.getOwnPropertyNames(value).length === 2 && check_2(value.browserId) && (value.action === "copy-url" || value.action === "open-external" || value.action === "mute" || value.action === "unmute"));
const check_24 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "targetId" in value && check_2(value.browserId) && check_25(value.targetId));
const check_25 = ((value) => typeof value === "string" && pattern1.test(value));
const check_26 = ((value) => typeof value === "string" && pattern2.test(value));
const check_27 = ((value) => Array.isArray(value) && value.every((element, index) => check_26(element)) && value.length <= 1e5);
const check_28 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "id" in value && "action" in value && check_26(value.id) && check_29(value.action));
const check_29 = ((value) => value === "prepare" || value === "commit" || value === "cancel");
const check_30 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "id" in value && "ordinal" in value && "locate" in value && check_26(value.id) && check_31(value.ordinal) && check_3(value.locate));
const check_31 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value <= 1e6 && value >= 1));
const check_32 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "options" in value && check_2(value.browserId) && check_33(value.options));
const check_33 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "borderColor" in value && "ancestorColor" in value && "fillColor" in value && "borderRadius" in value && "transitionDuration" in value && "transitionTiming" in value && "labelColor" in value && "labelFont" in value && "labelFontSize" in value && "labelPadding" in value && "labelGap" in value && "labelMaxWidth" in value && "regionLabel" in value && check_16(value.borderColor) && check_16(value.ancestorColor) && check_16(value.fillColor) && check_16(value.borderRadius) && check_16(value.transitionDuration) && check_16(value.transitionTiming) && check_16(value.labelColor) && check_16(value.labelFont) && check_16(value.labelFontSize) && check_16(value.labelPadding) && check_16(value.labelGap) && check_16(value.labelMaxWidth) && check_16(value.regionLabel) && (value.contextTargetId === void 0 || !("contextTargetId" in value) || check_25(value.contextTargetId)) && (value.ordinal === void 0 || !("ordinal" in value) || check_31(value.ordinal)));
const check_34 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "capture" in value && "labels" in value && "locale" in value && check_35(value.labels) && typeof value.locale === "string" && pattern3.test(value.locale));
const check_35 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "annotation" in value && "classes" in value && "geometry" in value && "semantics" in value && "data" in value && "source" in value && "pageTitle" in value && "url" in value && "capturedAt" in value && "viewport" in value && "width" in value && "height" in value && "zoom" in value && "pixelRatio" in value && "size" in value && "position" in value && "copy" in value && "insert" in value && "more" in value && "less" in value && "items" in value && "item" in value && "base" in value && "interaction" in value && "responsive" in value && "theme" in value && "truncated" in value && "copied" in value && "copyFailed" in value && check_36(value.annotation) && check_36(value.classes) && check_36(value.geometry) && check_36(value.semantics) && check_36(value.data) && check_36(value.source) && check_36(value.pageTitle) && check_36(value.url) && check_36(value.capturedAt) && check_36(value.viewport) && check_36(value.width) && check_36(value.height) && check_36(value.zoom) && check_36(value.pixelRatio) && check_36(value.size) && check_36(value.position) && check_36(value.copy) && check_36(value.insert) && check_36(value.more) && check_36(value.less) && check_36(value.items) && check_36(value.item) && check_36(value.base) && check_36(value.interaction) && check_36(value.responsive) && check_36(value.theme) && check_36(value.truncated) && check_36(value.copied) && check_36(value.copyFailed));
const check_36 = ((value) => typeof value === "string" && IsMaxLength(value, 256));
const check_37 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "command" in value && check_38(value.requestId) && (value.sessionId === void 0 || !("sessionId" in value) || check_2(value.sessionId)) && (typeof value.command === "object" && value.command !== null && !Array.isArray(value.command) && "action" in value.command && Object.getOwnPropertyNames(value.command).length === 1 && typeof value.command.action === "string" && value.command.action === "get_state" || typeof value.command === "object" && value.command !== null && !Array.isArray(value.command) && "action" in value.command && Object.getOwnPropertyNames(value.command).length === 1 && typeof value.command.action === "string" && value.command.action === "activate_panel" || typeof value.command === "object" && value.command !== null && !Array.isArray(value.command) && "action" in value.command && Object.getOwnPropertyNames(value.command).length === 1 && typeof value.command.action === "string" && value.command.action === "create_tab" || typeof value.command === "object" && value.command !== null && !Array.isArray(value.command) && "action" in value.command && "tabId" in value.command && Object.getOwnPropertyNames(value.command).length === 2 && typeof value.command.action === "string" && value.command.action === "release_tab" && check_2(value.command.tabId) || typeof value.command === "object" && value.command !== null && !Array.isArray(value.command) && "action" in value.command && "tabId" in value.command && Object.getOwnPropertyNames(value.command).length === 2 && typeof value.command.action === "string" && value.command.action === "activate_tab" && check_2(value.command.tabId) || typeof value.command === "object" && value.command !== null && !Array.isArray(value.command) && "action" in value.command && "tabId" in value.command && Object.getOwnPropertyNames(value.command).length === 2 && typeof value.command.action === "string" && value.command.action === "switch_tab" && check_2(value.command.tabId) || typeof value.command === "object" && value.command !== null && !Array.isArray(value.command) && "action" in value.command && "tabId" in value.command && Object.getOwnPropertyNames(value.command).length === 2 && typeof value.command.action === "string" && value.command.action === "close_tab" && check_2(value.command.tabId)) || typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "cancel" in value && Object.getOwnPropertyNames(value).length === 2 && check_38(value.requestId) && check_39(value.cancel));
const check_38 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value >= 1));
const check_39 = ((value) => typeof value === "boolean" && value === true);
const check_40 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "turnId" in value && "panelVisible" in value && "activeTabId" in value && "tabs" in value && "controlledTabId" in value && "controlledLeaseId" in value && check_41(value.turnId) && check_3(value.panelVisible) && check_41(value.activeTabId) && check_42(value.tabs) && value.controlledTabId === null && value.controlledLeaseId === null || typeof value === "object" && value !== null && !Array.isArray(value) && "turnId" in value && "panelVisible" in value && "activeTabId" in value && "tabs" in value && "controlledTabId" in value && "controlledLeaseId" in value && check_41(value.turnId) && check_3(value.panelVisible) && check_41(value.activeTabId) && check_42(value.tabs) && check_2(value.controlledTabId) && check_2(value.controlledLeaseId));
const check_41 = ((value) => check_2(value) || value === null);
const check_42 = ((value) => Array.isArray(value) && value.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "tabId" in element && "browserId" in element && Object.getOwnPropertyNames(element).length === 2 && check_2(element.tabId) && check_2(element.browserId)));
const check_43 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "ok" in value && Object.getOwnPropertyNames(value).every((var_40, var_41) => pattern4.test(var_40) || false) && check_38(value.requestId) && check_3(value.ok) && (value.state === void 0 || !("state" in value) || check_40(value.state)) && (value.error === void 0 || !("error" in value) || typeof value.error === "string"));
const check_44 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "revision" in value && "startedAt" in value && "labels" in value && "colorScheme" in value && "reducedMotion" in value && "corners" in value && "insets" in value && check_2(value.browserId) && check_45(value.revision) && Number.isFinite(value.startedAt) && check_46(value.labels) && check_48(value.colorScheme) && check_3(value.reducedMotion) && check_49(value.corners) && check_49(value.insets) || value === null);
const check_45 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value <= 9007199254740991 && value >= -9007199254740991));
const check_46 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "running" in value && "elapsed" in value && "takeover" in value && "takeoverHint" in value && "pointer" in value && "typing" in value && "key" in value && "scrolling" in value && "activityTarget" in value && "activities" in value && check_47(value.running) && check_47(value.elapsed) && check_47(value.takeover) && check_47(value.takeoverHint) && check_47(value.pointer) && check_47(value.typing) && check_47(value.key) && check_47(value.scrolling) && check_47(value.activityTarget) && typeof value.activities === "object" && value.activities !== null && !Array.isArray(value.activities) && "reading" in value.activities && "inspecting" in value.activities && "capturing" in value.activities && "clicking" in value.activities && "hovering" in value.activities && "typing" in value.activities && "pressing" in value.activities && "selecting" in value.activities && "checking" in value.activities && "scrolling" in value.activities && "dragging" in value.activities && "navigating" in value.activities && "waiting" in value.activities && check_47(value.activities.reading) && check_47(value.activities.inspecting) && check_47(value.activities.capturing) && check_47(value.activities.clicking) && check_47(value.activities.hovering) && check_47(value.activities.typing) && check_47(value.activities.pressing) && check_47(value.activities.selecting) && check_47(value.activities.checking) && check_47(value.activities.scrolling) && check_47(value.activities.dragging) && check_47(value.activities.navigating) && check_47(value.activities.waiting));
const check_47 = ((value) => typeof value === "string" && IsMaxLength(value, 500));
const check_48 = ((value) => value === "light" || value === "dark");
const check_49 = ((value) => Array.isArray(value) && value.every((var_42, var_43) => var_43 < 4 || false) && (value.length <= 0 || check_50(value[0])) && (value.length <= 1 || check_50(value[1])) && (value.length <= 2 || check_50(value[2])) && (value.length <= 3 || check_50(value[3])) && value.length >= 4);
const check_50 = ((value) => Number.isFinite(value) && value <= 64 && value >= 0);
const check_51 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "revision" in value && "kind" in value && check_2(value.browserId) && check_45(value.revision) && (value.kind === "move" || value.kind === "down" || value.kind === "up" || value.kind === "type" || value.kind === "key" || value.kind === "scroll" || value.kind === "reset" || value.kind === "blocked") && (value.x === void 0 || !("x" in value) || Number.isFinite(value.x)) && (value.y === void 0 || !("y" in value) || Number.isFinite(value.y)) && (value.drag === void 0 || !("drag" in value) || check_3(value.drag)));
const check_52 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "revision" in value && "activity" in value && check_2(value.browserId) && check_45(value.revision) && (value.id === void 0 || !("id" in value) || check_53(value.id)) && (value.activity === "reading" || value.activity === "inspecting" || value.activity === "capturing" || value.activity === "clicking" || value.activity === "hovering" || value.activity === "typing" || value.activity === "pressing" || value.activity === "selecting" || value.activity === "checking" || value.activity === "scrolling" || value.activity === "dragging" || value.activity === "navigating" || value.activity === "waiting" || value.activity === null) && (value.scan === void 0 || !("scan" in value) || check_3(value.scan)) && (value.target === void 0 || !("target" in value) || typeof value.target === "string" && IsMaxLength(value.target, 80)) && (value.rect === void 0 || !("rect" in value) || typeof value.rect === "object" && value.rect !== null && !Array.isArray(value.rect) && "x" in value.rect && "y" in value.rect && "width" in value.rect && "height" in value.rect && Number.isFinite(value.rect.x) && Number.isFinite(value.rect.y) && Number.isFinite(value.rect.width) && Number.isFinite(value.rect.height)));
const check_53 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value <= 9007199254740991 && value >= 1));
const check_54 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "revision" in value && check_2(value.browserId) && check_45(value.revision));
const check_55 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "controls" in value && "labels" in value && "colorScheme" in value && "reducedMotion" in value && Array.isArray(value.controls) && value.controls.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "browserId" in element && "sessionId" in element && "turnId" in element && "status" in element && check_2(element.browserId) && check_2(element.sessionId) && check_41(element.turnId) && (element.status === "running" || element.status === "paused" || element.status === "unknown" || element.status === "idle")) && value.controls.length <= 1e3 && check_46(value.labels) && check_48(value.colorScheme) && check_3(value.reducedMotion));
const check_56 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "sessionIds" in value && "browserIds" in value && check_57(value.sessionIds) && check_57(value.browserIds));
const check_57 = ((value) => Array.isArray(value) && value.every((element, index) => check_2(element)));
const check_58 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && Object.getOwnPropertyNames(value).every((var_44, var_45) => pattern5.test(var_44) || false) && (value.searchEngine === void 0 || !("searchEngine" in value) || check_59(value.searchEngine)) && (value.askWhereToSave === void 0 || !("askWhereToSave" in value) || check_3(value.askWhereToSave)) && (value.defaultZoomFactor === void 0 || !("defaultZoomFactor" in value) || Number.isFinite(value.defaultZoomFactor) && value.defaultZoomFactor <= 2 && value.defaultZoomFactor >= .5));
const check_59 = ((value) => value === "google" || value === "bing" || value === "duckduckgo" || value === "baidu");
const check_60 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "history" in value && "preferences" in value && Array.isArray(value.history) && value.history.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "id" in element && "url" in element && "title" in element && "visitedAt" in element && check_61(element.id) && check_5(element.url) && check_16(element.title) && (element.favicon === void 0 || !("favicon" in element) || typeof element.favicon === "string") && Number.isFinite(element.visitedAt)) && value.history.length <= 200 && typeof value.preferences === "object" && value.preferences !== null && !Array.isArray(value.preferences) && "searchEngine" in value.preferences && "askWhereToSave" in value.preferences && "defaultZoomFactor" in value.preferences && check_59(value.preferences.searchEngine) && check_3(value.preferences.askWhereToSave) && check_17(value.preferences.defaultZoomFactor));
const check_61 = ((value) => typeof value === "string" && IsMaxLength(value, 128));
const check_62 = ((value) => Array.isArray(value) && value.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "id" in element && "url" in element && "filename" in element && "state" in element && "startedAt" in element && "receivedBytes" in element && "totalBytes" in element && check_61(element.id) && check_5(element.url) && (element.urlTruncated === void 0 || !("urlTruncated" in element) || check_3(element.urlTruncated)) && check_16(element.filename) && (element.savePath === void 0 || !("savePath" in element) || check_5(element.savePath)) && (element.pathTruncated === void 0 || !("pathTruncated" in element) || check_3(element.pathTruncated)) && check_63(element.state) && Number.isFinite(element.startedAt) && Number.isFinite(element.receivedBytes) && Number.isFinite(element.totalBytes) && (element.fileMissing === void 0 || !("fileMissing" in element) || check_3(element.fileMissing)) && (element.active === void 0 || !("active" in element) || check_3(element.active)) && (element.resumable === void 0 || !("resumable" in element) || check_3(element.resumable)) && (element.speed === void 0 || !("speed" in element) || Number.isFinite(element.speed))) && value.length <= 100);
const check_63 = ((value) => value === "progressing" || value === "completed" || value === "cancelled" || value === "interrupted");
const check_64 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "id" in value && "action" in value && Object.getOwnPropertyNames(value).length === 2 && check_65(value.id) && (value.action === "open" || value.action === "show" || value.action === "pause" || value.action === "resume" || value.action === "cancel" || value.action === "retry"));
const check_65 = ((value) => typeof value === "string" && IsMaxLength(value, 128) && IsMinLength(value, 1));
const check_68 = ((value) => typeof value === "string" && IsMaxLength(value, 1024));
const check_69 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "enabled" in value && check_3(value.enabled) && (value.profileId === void 0 || !("profileId" in value) || true) && (value.orientation === void 0 || !("orientation" in value) || true) && (value.scaleMode === void 0 || !("scaleMode" in value) || true) && (value.scale === void 0 || !("scale" in value) || true) && (value.width === void 0 || !("width" in value) || true) && (value.height === void 0 || !("height" in value) || true));
const check_70 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "browserId" in value && "request" in value && check_2(value.browserId) && check_71(value.request));
const check_71 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "enabled" in value && Object.getOwnPropertyNames(value).length === 1 && typeof value.enabled === "boolean" && value.enabled === false || typeof value === "object" && value !== null && !Array.isArray(value) && "enabled" in value && "orientation" in value && "profileId" in value && "scaleMode" in value && Object.getOwnPropertyNames(value).every((var_46, var_47) => pattern6.test(var_46) || false) && check_39(value.enabled) && check_19(value.orientation) && check_72(value.profileId) && (value.width === void 0 || !("width" in value) || false) && (value.height === void 0 || !("height" in value) || false) && check_73(value.scaleMode) && (value.scale === void 0 || !("scale" in value) || false) || typeof value === "object" && value !== null && !Array.isArray(value) && "enabled" in value && "orientation" in value && "profileId" in value && "scaleMode" in value && "scale" in value && Object.getOwnPropertyNames(value).every((var_48, var_49) => pattern6.test(var_48) || false) && check_39(value.enabled) && check_19(value.orientation) && check_72(value.profileId) && (value.width === void 0 || !("width" in value) || false) && (value.height === void 0 || !("height" in value) || false) && check_74(value.scaleMode) && check_21(value.scale) || typeof value === "object" && value !== null && !Array.isArray(value) && "enabled" in value && "orientation" in value && "profileId" in value && "width" in value && "height" in value && "scaleMode" in value && Object.getOwnPropertyNames(value).every((var_50, var_51) => pattern6.test(var_50) || false) && check_39(value.enabled) && check_19(value.orientation) && check_75(value.profileId) && check_20(value.width) && check_20(value.height) && check_73(value.scaleMode) && (value.scale === void 0 || !("scale" in value) || false) || typeof value === "object" && value !== null && !Array.isArray(value) && "enabled" in value && "orientation" in value && "profileId" in value && "width" in value && "height" in value && "scaleMode" in value && "scale" in value && Object.getOwnPropertyNames(value).length === 7 && check_39(value.enabled) && check_19(value.orientation) && check_75(value.profileId) && check_20(value.width) && check_20(value.height) && check_74(value.scaleMode) && check_21(value.scale));
const check_72 = ((value) => value === "iphone-se" || value === "iphone-12-pro" || value === "iphone-14-pro" || value === "iphone-14-pro-max" || value === "pixel-7" || value === "galaxy-s20-ultra" || value === "ipad-mini" || value === "ipad-pro-13" || value === "iphone-duo-outer" || value === "iphone-duo-inner" || value === "iphone-16" || value === "iphone-16-pro" || value === "iphone-16-pro-max" || value === "pixel-8" || value === "pixel-9" || value === "desktop-1280" || value === "desktop-1440" || value === "desktop-1920");
const check_73 = ((value) => typeof value === "string" && value === "fit");
const check_74 = ((value) => typeof value === "string" && value === "fixed");
const check_75 = ((value) => typeof value === "string" && value === "responsive");
const check_76 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "menuId" in value && "anchor" in value && "items" in value && "kind" in value && "requestId" in value && check_77(value.menuId) && check_12(value.anchor) && (value.placement === void 0 || !("placement" in value) || check_78(value.placement)) && (value.initialFocus === void 0 || !("initialFocus" in value) || check_79(value.initialFocus)) && (value.offset === void 0 || !("offset" in value) || check_80(value.offset)) && (value.width === void 0 || !("width" in value) || check_81(value.width)) && (value.autoWidth === void 0 || !("autoWidth" in value) || check_3(value.autoWidth)) && (value.preserveFocus === void 0 || !("preserveFocus" in value) || check_3(value.preserveFocus)) && check_82(value.items) && (value.footerStart === void 0 || !("footerStart" in value) || check_91(value.footerStart)) && (value.query === void 0 || !("query" in value) || check_68(value.query)) && typeof value.kind === "string" && value.kind === "menu" && check_53(value.requestId) && (value.minWidth === void 0 || !("minWidth" in value) || check_81(value.minWidth)) && (value.maxHeight === void 0 || !("maxHeight" in value) || check_81(value.maxHeight)));
const check_77 = ((value) => typeof value === "string" && IsMaxLength(value, 128) && IsMinLength(value, 1) && pattern7.test(value));
const check_78 = ((value) => value === "bottom-start" || value === "bottom-end" || value === "top-start" || value === "top-end");
const check_79 = ((value) => value === "none" || value === "first-item");
const check_80 = ((value) => Number.isFinite(value) && value <= 32 && value >= -16);
const check_81 = ((value) => Number.isFinite(value) && value >= 1);
const check_82 = ((value) => Array.isArray(value) && value.every((element, index) => check_83(element) || check_84(element) || check_85(element) || check_87(element) || check_89(element)) && value.length <= 2048 && value.length >= 1);
const check_83 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "kind" in value && typeof value.kind === "string" && value.kind === "separator");
const check_84 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "kind" in value && "id" in value && "label" in value && (value.kind === "section" || value.kind === "note") && check_77(value.id) && check_68(value.label));
const check_85 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "kind" in value && "id" in value && "label" in value && "value" in value && "options" in value && typeof value.kind === "string" && value.kind === "choices" && check_77(value.id) && check_68(value.label) && (value.icon === void 0 || !("icon" in value) || check_86(value.icon)) && typeof value.value === "string" && Array.isArray(value.options) && value.options.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "id" in element && "label" in element && check_77(element.id) && check_36(element.label)) && value.options.length <= 8 && value.options.length >= 1 && (value.disabled === void 0 || !("disabled" in value) || check_3(value.disabled)) && (value.notice === void 0 || !("notice" in value) || typeof value.notice === "object" && value.notice !== null && !Array.isArray(value.notice) && "message" in value.notice && "linkLabel" in value.notice && "action" in value.notice && check_36(value.notice.message) && typeof value.notice.linkLabel === "string" && IsMaxLength(value.notice.linkLabel, 64) && check_77(value.notice.action)));
const check_86 = ((value) => typeof value === "string" && IsMaxLength(value, 64) && IsMinLength(value, 1) && pattern7.test(value));
const check_87 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "kind" in value && "id" in value && "label" in value && "value" in value && "decreaseAction" in value && "decreaseLabel" in value && "increaseAction" in value && "increaseLabel" in value && "resetAction" in value && "resetLabel" in value && typeof value.kind === "string" && value.kind === "zoom" && check_77(value.id) && check_88(value.label) && (value.icon === void 0 || !("icon" in value) || check_86(value.icon)) && check_88(value.value) && check_77(value.decreaseAction) && check_88(value.decreaseLabel) && check_77(value.increaseAction) && check_88(value.increaseLabel) && check_77(value.resetAction) && check_88(value.resetLabel) && (value.decreaseDisabled === void 0 || !("decreaseDisabled" in value) || check_3(value.decreaseDisabled)) && (value.increaseDisabled === void 0 || !("increaseDisabled" in value) || check_3(value.increaseDisabled)) && (value.resetDisabled === void 0 || !("resetDisabled" in value) || check_3(value.resetDisabled)));
const check_88 = ((value) => typeof value === "string" && IsMaxLength(value, 256) && IsMinLength(value, 1));
const check_89 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "kind" in value && "id" in value && "label" in value && typeof value.kind === "string" && value.kind === "item" && check_77(value.id) && check_88(value.label) && (value.icon === void 0 || !("icon" in value) || check_86(value.icon)) && (value.favicon === void 0 || !("favicon" in value) || typeof value.favicon === "string") && (value.shortcut === void 0 || !("shortcut" in value) || Array.isArray(value.shortcut) && value.shortcut.every((element, index) => typeof element === "string" && IsMaxLength(element, 24) && IsMinLength(element, 1)) && value.shortcut.length <= 8) && (value.disabled === void 0 || !("disabled" in value) || check_3(value.disabled)) && (value.selected === void 0 || !("selected" in value) || check_3(value.selected)) && (value.danger === void 0 || !("danger" in value) || check_3(value.danger)) && (value.starred === void 0 || !("starred" in value) || check_3(value.starred)) && (value.keepOpen === void 0 || !("keepOpen" in value) || check_3(value.keepOpen)) && (value.labelRanges === void 0 || !("labelRanges" in value) || check_90(value.labelRanges)) && (value.descriptionRanges === void 0 || !("descriptionRanges" in value) || check_90(value.descriptionRanges)) && (value.metrics === void 0 || !("metrics" in value) || Array.isArray(value.metrics) && value.metrics.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "label" in element && "value" in element && check_88(element.label) && check_88(element.value)) && value.metrics.length <= 4) && (value.description === void 0 || !("description" in value) || check_68(value.description)) && (value.detail === void 0 || !("detail" in value) || check_68(value.detail)) && (value.tone === void 0 || !("tone" in value) || value.tone === "warning" || value.tone === "danger"));
const check_90 = ((value) => Array.isArray(value) && value.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "start" in element && "end" in element && Object.getOwnPropertyNames(element).length === 2 && check_91(element.start) && check_91(element.end)) && value.length <= 64);
const check_91 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value >= 0));
const check_92 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && check_53(value.requestId) && (value.placement === void 0 || !("placement" in value) || check_78(value.placement)));
const check_93 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "menuId" in value && "itemId" in value && check_77(value.menuId) && check_77(value.itemId) && (value.keepOpen === void 0 || !("keepOpen" in value) || check_3(value.keepOpen)));
const check_94 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "menuId" in value && "reason" in value && check_77(value.menuId) && check_95(value.reason));
const check_95 = ((value) => value === "action" || value === "dismiss" || value === "escape" || value === "replaced" || value === "window-blur" || value === "window-move" || value === "window-resize" || value === "host-closed" || value === "programmatic");
const check_96 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "action" in value && "dialogId" in value && check_97(value.action) && (value.value === void 0 || !("value" in value) || check_98(value.value)) && (value.checked === void 0 || !("checked" in value) || check_3(value.checked)) && check_77(value.dialogId));
const check_97 = ((value) => value === "confirm" || value === "cancel" || value === "auxiliary");
const check_98 = ((value) => typeof value === "string" && IsMaxLength(value, 1e4));
const check_99 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "dialogId" in value && "reason" in value && check_77(value.dialogId) && check_95(value.reason));
const check_100 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "action" in value && "value" in value && "requestId" in value && check_97(value.action) && check_98(value.value) && (value.checked === void 0 || !("checked" in value) || check_3(value.checked)) && check_53(value.requestId));
const check_101 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "menuId" in value && "anchor" in value && "items" in value && check_77(value.menuId) && check_12(value.anchor) && (value.placement === void 0 || !("placement" in value) || check_78(value.placement)) && (value.initialFocus === void 0 || !("initialFocus" in value) || check_79(value.initialFocus)) && (value.offset === void 0 || !("offset" in value) || check_80(value.offset)) && (value.width === void 0 || !("width" in value) || Number.isFinite(value.width) && value.width >= 180) && (value.autoWidth === void 0 || !("autoWidth" in value) || check_3(value.autoWidth)) && (value.preserveFocus === void 0 || !("preserveFocus" in value) || check_3(value.preserveFocus)) && check_82(value.items) && (value.footerStart === void 0 || !("footerStart" in value) || check_91(value.footerStart)) && (value.query === void 0 || !("query" in value) || check_68(value.query)));
const check_102 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "dialogId" in value && "title" in value && "confirmLabel" in value && "cancelLabel" in value && "closeLabel" in value && Object.getOwnPropertyNames(value).every((var_52, var_53) => pattern8.test(var_52) || false) && (value.preserveFocus === void 0 || !("preserveFocus" in value) || check_3(value.preserveFocus)) && (value.dismissible === void 0 || !("dismissible" in value) || check_3(value.dismissible)) && check_77(value.dialogId) && check_88(value.title) && (value.message === void 0 || !("message" in value) || check_5(value.message)) && check_65(value.confirmLabel) && check_65(value.cancelLabel) && check_65(value.closeLabel) && (value.variant === void 0 || !("variant" in value) || value.variant === "primary" || value.variant === "danger") && (value.loading === void 0 || !("loading" in value) || check_3(value.loading)) && (value.initialFocus === void 0 || !("initialFocus" in value) || value.initialFocus === "confirm" || value.initialFocus === "cancel") && (value.anchor === void 0 || !("anchor" in value) || check_103(value.anchor)) && (value.boundary === void 0 || !("boundary" in value) || check_103(value.boundary)) && (value.annotation === void 0 || !("annotation" in value) || true) && (value.viewport === void 0 || !("viewport" in value) || typeof value.viewport === "object" && value.viewport !== null && !Array.isArray(value.viewport) && "width" in value.viewport && "height" in value.viewport && Object.getOwnPropertyNames(value.viewport).length === 2 && check_105(value.viewport.width) && check_105(value.viewport.height)) && (value.input === void 0 || !("input" in value) || typeof value.input === "object" && value.input !== null && !Array.isArray(value.input) && "label" in value.input && "value" in value.input && check_36(value.input.label) && check_98(value.input.value) && (value.input.placeholder === void 0 || !("placeholder" in value.input) || check_36(value.input.placeholder)) && (value.input.readOnly === void 0 || !("readOnly" in value.input) || check_3(value.input.readOnly))) && (value.checkbox === void 0 || !("checkbox" in value) || typeof value.checkbox === "object" && value.checkbox !== null && !Array.isArray(value.checkbox) && "label" in value.checkbox && "checked" in value.checkbox && check_36(value.checkbox.label) && check_3(value.checkbox.checked) && (value.checkbox.disabled === void 0 || !("disabled" in value.checkbox) || check_3(value.checkbox.disabled))) && (value.preview === void 0 || !("preview" in value) || typeof value.preview === "object" && value.preview !== null && !Array.isArray(value.preview) && "src" in value.preview && "alt" in value.preview && typeof value.preview.src === "string" && IsMaxLength(value.preview.src, 4194304) && pattern9.test(value.preview.src) && check_68(value.preview.alt)) && (value.auxiliary === void 0 || !("auxiliary" in value) || typeof value.auxiliary === "object" && value.auxiliary !== null && !Array.isArray(value.auxiliary) && "label" in value.auxiliary && check_36(value.auxiliary.label) && (value.auxiliary.disabled === void 0 || !("disabled" in value.auxiliary) || check_3(value.auxiliary.disabled))) && (value.kind === void 0 || !("kind" in value) || true) && (value.requestId === void 0 || !("requestId" in value) || true));
const check_103 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "x" in value && "y" in value && "width" in value && "height" in value && check_104(value.x) && check_104(value.y) && check_104(value.width) && check_104(value.height));
const check_104 = ((value) => Number.isFinite(value) && value <= 32768 && value >= 0);
const check_105 = ((value) => Number.isFinite(value) && value <= 16384 && value >= 1);
const check_106 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "width" in value && "height" in value && check_53(value.requestId) && check_105(value.width) && check_105(value.height));
const check_107 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && check_53(value.requestId));
const check_108 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "kind" in value && typeof value.kind === "string" && value.kind === "dialog");
const check_109 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "itemId" in value && Object.getOwnPropertyNames(value).length === 2 && check_53(value.requestId) && check_77(value.itemId));
const check_110 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "reason" in value && Object.getOwnPropertyNames(value).length === 2 && check_53(value.requestId) && (value.reason === "dismiss" || value.reason === "escape"));
const check_111 = ((value) => Array.isArray(value) && value.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "sessionId" in element && "tabs" in element && "activeBrowserId" in element && "visible" in element && check_2(element.sessionId) && Array.isArray(element.tabs) && element.tabs.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "browserId" in element && check_2(element.browserId) && (element.title === void 0 || !("title" in element) || check_16(element.title)) && (element.customTitle === void 0 || !("customTitle" in element) || check_16(element.customTitle))) && check_41(element.activeBrowserId) && check_3(element.visible)));
const check_112 = ((value) => typeof value === "string" && pattern10.test(value));
const check_113 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "sessionId" in value && "receiptId" in value && check_25(value.sessionId) && check_112(value.receiptId));
const check_114 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "sourceId" in value && "targetId" in value && check_25(value.sourceId) && check_25(value.targetId));
const check_115 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "id" in value && "mimeType" in value && "data" in value && "width" in value && "height" in value && check_112(value.id) && typeof value.mimeType === "string" && value.mimeType === "image/jpeg" && typeof value.data === "string" && IsMaxLength(value.data, 16e6) && IsMinLength(value.data, 1) && check_116(value.width) && check_116(value.height) && (value.point === void 0 || !("point" in value) || typeof value.point === "object" && value.point !== null && !Array.isArray(value.point) && "x" in value.point && "y" in value.point && check_117(value.point.x) && check_117(value.point.y)) && (value.box === void 0 || !("box" in value) || typeof value.box === "object" && value.box !== null && !Array.isArray(value.box) && "x" in value.box && "y" in value.box && "width" in value.box && "height" in value.box && check_117(value.box.x) && check_117(value.box.y) && check_117(value.box.width) && check_117(value.box.height)));
const check_116 = ((value) => Number.isFinite(value) && value > 0 && value <= 1e5);
const check_117 = ((value) => Number.isFinite(value) && value <= 1 && value >= 0);
const check_118 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "origin" in value && "permission" in value && "setting" in value && check_8(value.origin) && check_119(value.permission) && check_120(value.setting));
const check_119 = ((value) => value === "location" || value === "camera" || value === "microphone" || value === "notifications" || value === "clipboard" || value === "clipboardWrite" || value === "fullscreen" || value === "midi" || value === "midiSysex");
const check_120 = ((value) => value === "ask" || value === "allow" || value === "block");
const check_121 = ((value) => Array.isArray(value) && value.every((element, index) => typeof element === "object" && element !== null && !Array.isArray(element) && "requestId" in element && "browserId" in element && "origin" in element && "permissions" in element && check_2(element.requestId) && check_2(element.browserId) && check_8(element.origin) && Array.isArray(element.permissions) && element.permissions.every((element, index) => check_119(element)) && element.permissions.length <= 9 && element.permissions.length >= 1) && value.length <= 64);
const check_122 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "decision" in value && Object.getOwnPropertyNames(value).length === 2 && check_2(value.requestId) && (value.decision === "allow-once" || value.decision === "allow-always" || value.decision === "block"));
const check_123 = ((value) => Array.isArray(value) && value.every((element, index) => check_119(element)) && value.length <= 9);
const check_124 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "origin" in value && "lastVisitedAt" in value && "permissions" in value && check_8(value.origin) && Number.isFinite(value.lastVisitedAt) && check_125(value.permissions));
const check_125 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && Object.getOwnPropertyNames(value).every((var_54, var_55) => pattern11.test(var_54) || false) && Object.entries(value).every(([var_56, var_57], _) => !pattern12.test(var_56) || check_120(var_57)) && (value.location === void 0 || !("location" in value) || check_120(value.location)) && (value.camera === void 0 || !("camera" in value) || check_120(value.camera)) && (value.microphone === void 0 || !("microphone" in value) || check_120(value.microphone)) && (value.notifications === void 0 || !("notifications" in value) || check_120(value.notifications)) && (value.clipboard === void 0 || !("clipboard" in value) || check_120(value.clipboard)) && (value.clipboardWrite === void 0 || !("clipboardWrite" in value) || check_120(value.clipboardWrite)) && (value.fullscreen === void 0 || !("fullscreen" in value) || check_120(value.fullscreen)) && (value.midi === void 0 || !("midi" in value) || check_120(value.midi)) && (value.midiSysex === void 0 || !("midiSysex" in value) || check_120(value.midiSysex)) && Object.getOwnPropertyNames(value).every((var_58, var_59) => check_119(var_58)));
const check_126 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "origin" in value && "lastVisitedAt" in value && "permissions" in value && "cookieCount" in value && check_8(value.origin) && Number.isFinite(value.lastVisitedAt) && check_125(value.permissions) && Number.isInteger(value.cookieCount) && (!(Number.isFinite(value.cookieCount) || typeof value.cookieCount === "bigint") || value.cookieCount <= 9007199254740991 && value.cookieCount >= 0));
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
const v0 = /* @__PURE__ */ validator(check_1, /* @__PURE__ */ pick(["browserId", "enabled"]));
const v1 = /* @__PURE__ */ validator(check_4, /* @__PURE__ */ pick([
	"browserId",
	"address",
	"urlSuffix"
]));
const v2 = /* @__PURE__ */ validator(check_6, /* @__PURE__ */ pick(["sourceId", "targetId"]));
const v3 = /* @__PURE__ */ validator(check_7, /* @__PURE__ */ pick([
	"browserId",
	"url",
	"background"
]));
const v4 = /* @__PURE__ */ validator(check_9, /* @__PURE__ */ pick([
	"browserId",
	"text",
	"forward",
	"findNext"
]));
const v5 = /* @__PURE__ */ validator(check_10, /* @__PURE__ */ pick(["browserId", "action"]));
const v6 = /* @__PURE__ */ validator(check_11, /* @__PURE__ */ pick(["browserId", "bounds"]));
const v7 = /* @__PURE__ */ validator(check_14, /* @__PURE__ */ pick(["browserId", "visible"]));
const v8 = /* @__PURE__ */ validator(check_15, /* @__PURE__ */ pick([
	"url",
	"urlTruncated",
	"title",
	"favicon",
	"zoomFactor",
	"emulateFocus",
	"device",
	"muted",
	"loading",
	"canGoBack",
	"canGoForward",
	"error"
]));
const v9 = /* @__PURE__ */ validator(check_2, whole);
const v10 = /* @__PURE__ */ validator(check_22, /* @__PURE__ */ pick(["browserId", "state"]));
const v11 = /* @__PURE__ */ validator(check_12, /* @__PURE__ */ pick([
	"x",
	"y",
	"width",
	"height"
]));
const v12 = /* @__PURE__ */ validator(check_23, /* @__PURE__ */ pick(["browserId", "action"]));
const v13 = /* @__PURE__ */ validator(check_24, /* @__PURE__ */ pick(["browserId", "targetId"]));
const v14 = /* @__PURE__ */ validator(check_26, whole);
const v15 = /* @__PURE__ */ validator(check_27, whole);
const v16 = /* @__PURE__ */ validator(check_28, /* @__PURE__ */ pick(["id", "action"]));
const v17 = /* @__PURE__ */ validator(check_30, /* @__PURE__ */ pick([
	"id",
	"ordinal",
	"locate"
]));
const v18 = /* @__PURE__ */ validator(check_29, whole);
const v19 = /* @__PURE__ */ validator(check_32, /* @__PURE__ */ pick(["browserId", "options"]));
const v20 = /* @__PURE__ */ validator(check_33, /* @__PURE__ */ pick([
	"borderColor",
	"ancestorColor",
	"fillColor",
	"borderRadius",
	"transitionDuration",
	"transitionTiming",
	"labelColor",
	"labelFont",
	"labelFontSize",
	"labelPadding",
	"labelGap",
	"labelMaxWidth",
	"regionLabel",
	"contextTargetId",
	"ordinal"
]));
const v21 = /* @__PURE__ */ validator(check_34, /* @__PURE__ */ pick([
	"capture",
	"labels",
	"locale"
]));
const v22 = /* @__PURE__ */ validator(check_35, /* @__PURE__ */ pick([
	"annotation",
	"classes",
	"geometry",
	"semantics",
	"data",
	"source",
	"pageTitle",
	"url",
	"capturedAt",
	"viewport",
	"width",
	"height",
	"zoom",
	"pixelRatio",
	"size",
	"position",
	"copy",
	"insert",
	"more",
	"less",
	"items",
	"item",
	"base",
	"interaction",
	"responsive",
	"theme",
	"truncated",
	"copied",
	"copyFailed"
]));
const v23 = /* @__PURE__ */ validator(check_37, whole);
const v24 = /* @__PURE__ */ validator(check_40, whole);
const v25 = /* @__PURE__ */ validator(check_43, /* @__PURE__ */ pick([
	"requestId",
	"ok",
	"state",
	"error"
]));
const v26 = /* @__PURE__ */ validator(check_44, whole);
const v27 = /* @__PURE__ */ validator(check_51, /* @__PURE__ */ pick([
	"browserId",
	"revision",
	"kind",
	"x",
	"y",
	"drag"
]));
const v28 = /* @__PURE__ */ validator(check_52, /* @__PURE__ */ pick([
	"browserId",
	"revision",
	"id",
	"activity",
	"scan",
	"target",
	"rect"
]));
const v29 = /* @__PURE__ */ validator(check_54, /* @__PURE__ */ pick(["browserId", "revision"]));
const v30 = /* @__PURE__ */ validator(check_55, /* @__PURE__ */ pick([
	"controls",
	"labels",
	"colorScheme",
	"reducedMotion"
]));
const v31 = /* @__PURE__ */ validator(check_56, /* @__PURE__ */ pick(["sessionIds", "browserIds"]));
const v32 = /* @__PURE__ */ validator(check_58, /* @__PURE__ */ pick([
	"searchEngine",
	"askWhereToSave",
	"defaultZoomFactor"
]));
const v33 = /* @__PURE__ */ validator(check_60, /* @__PURE__ */ pick(["history", "preferences"]));
const v34 = /* @__PURE__ */ validator(check_62, whole);
const v35 = /* @__PURE__ */ validator(check_64, /* @__PURE__ */ pick(["id", "action"]));
const v36 = /* @__PURE__ */ validator(check_65, whole);
const v37 = /* @__PURE__ */ validator(check_3, whole);
const v40 = /* @__PURE__ */ validator(check_69, /* @__PURE__ */ pick([
	"enabled",
	"profileId",
	"orientation",
	"scaleMode",
	"scale",
	"width",
	"height"
]));
const v41 = /* @__PURE__ */ validator(check_70, /* @__PURE__ */ pick(["browserId", "request"]));
const v42 = /* @__PURE__ */ validator(check_71, whole);
const v43 = /* @__PURE__ */ validator(check_18, /* @__PURE__ */ pick([
	"profileId",
	"orientation",
	"width",
	"height",
	"deviceScaleFactor",
	"mobile",
	"touch",
	"scaleMode",
	"requestedScale",
	"displayScale",
	"maxDisplayScale"
]));
const v44 = /* @__PURE__ */ validator(check_76, /* @__PURE__ */ pick([
	"menuId",
	"anchor",
	"placement",
	"initialFocus",
	"offset",
	"width",
	"autoWidth",
	"preserveFocus",
	"items",
	"footerStart",
	"query",
	"kind",
	"requestId",
	"minWidth",
	"maxHeight"
]));
const v45 = /* @__PURE__ */ validator(check_92, /* @__PURE__ */ pick(["requestId", "placement"]));
const v46 = /* @__PURE__ */ validator(check_93, /* @__PURE__ */ pick([
	"menuId",
	"itemId",
	"keepOpen"
]));
const v47 = /* @__PURE__ */ validator(check_94, /* @__PURE__ */ pick(["menuId", "reason"]));
const v48 = /* @__PURE__ */ validator(check_96, /* @__PURE__ */ pick([
	"action",
	"value",
	"checked",
	"dialogId"
]));
const v49 = /* @__PURE__ */ validator(check_99, /* @__PURE__ */ pick(["dialogId", "reason"]));
const v50 = /* @__PURE__ */ validator(check_100, /* @__PURE__ */ pick([
	"action",
	"value",
	"checked",
	"requestId"
]));
const v51 = /* @__PURE__ */ validator(check_77, whole);
const v52 = /* @__PURE__ */ validator(check_101, /* @__PURE__ */ pick([
	"menuId",
	"anchor",
	"placement",
	"initialFocus",
	"offset",
	"width",
	"autoWidth",
	"preserveFocus",
	"items",
	"footerStart",
	"query"
]));
const v53 = /* @__PURE__ */ validator(check_102, /* @__PURE__ */ pick([
	"preserveFocus",
	"dismissible",
	"dialogId",
	"title",
	"message",
	"confirmLabel",
	"cancelLabel",
	"closeLabel",
	"variant",
	"loading",
	"initialFocus",
	"anchor",
	"boundary",
	"annotation",
	"viewport",
	"input",
	"checkbox",
	"preview",
	"auxiliary",
	"kind",
	"requestId"
]));
const v54 = /* @__PURE__ */ validator(check_106, /* @__PURE__ */ pick([
	"requestId",
	"width",
	"height"
]));
const v55 = /* @__PURE__ */ validator(check_107, /* @__PURE__ */ pick(["requestId"]));
const v56 = /* @__PURE__ */ validator(check_108, /* @__PURE__ */ pick(["kind"]));
const v57 = /* @__PURE__ */ validator(check_109, /* @__PURE__ */ pick(["requestId", "itemId"]));
const v58 = /* @__PURE__ */ validator(check_110, /* @__PURE__ */ pick(["requestId", "reason"]));
const v59 = /* @__PURE__ */ validator(check_83, /* @__PURE__ */ pick(["kind"]));
const v60 = /* @__PURE__ */ validator(check_84, /* @__PURE__ */ pick([
	"kind",
	"id",
	"label"
]));
const v61 = /* @__PURE__ */ validator(check_85, /* @__PURE__ */ pick([
	"kind",
	"id",
	"label",
	"icon",
	"value",
	"options",
	"disabled",
	"notice"
]));
const v62 = /* @__PURE__ */ validator(check_87, /* @__PURE__ */ pick([
	"kind",
	"id",
	"label",
	"icon",
	"value",
	"decreaseAction",
	"decreaseLabel",
	"increaseAction",
	"increaseLabel",
	"resetAction",
	"resetLabel",
	"decreaseDisabled",
	"increaseDisabled",
	"resetDisabled"
]));
const v63 = /* @__PURE__ */ validator(check_89, /* @__PURE__ */ pick([
	"kind",
	"id",
	"label",
	"icon",
	"favicon",
	"shortcut",
	"disabled",
	"selected",
	"danger",
	"starred",
	"keepOpen",
	"labelRanges",
	"descriptionRanges",
	"metrics",
	"description",
	"detail",
	"tone"
]));
const v64 = /* @__PURE__ */ validator(check_111, whole);
const v65 = /* @__PURE__ */ validator(check_112, whole);
const v66 = /* @__PURE__ */ validator(check_25, whole);
const v67 = /* @__PURE__ */ validator(check_113, /* @__PURE__ */ pick(["sessionId", "receiptId"]));
const v68 = /* @__PURE__ */ validator(check_114, /* @__PURE__ */ pick(["sourceId", "targetId"]));
const v69 = /* @__PURE__ */ validator(check_115, /* @__PURE__ */ pick([
	"id",
	"mimeType",
	"data",
	"width",
	"height",
	"point",
	"box"
]));
const v71 = /* @__PURE__ */ validator(check_118, /* @__PURE__ */ pick([
	"origin",
	"permission",
	"setting"
]));
const v72 = /* @__PURE__ */ validator(check_121, whole);
const v73 = /* @__PURE__ */ validator(check_122, /* @__PURE__ */ pick(["requestId", "decision"]));
const v74 = /* @__PURE__ */ validator(check_123, whole);
const v75 = /* @__PURE__ */ validator(check_119, whole);
const v76 = /* @__PURE__ */ validator(check_120, whole);
const v77 = /* @__PURE__ */ validator(check_124, /* @__PURE__ */ pick([
	"origin",
	"lastVisitedAt",
	"permissions"
]));
const v78 = /* @__PURE__ */ validator(check_126, /* @__PURE__ */ pick([
	"origin",
	"lastVisitedAt",
	"permissions",
	"cookieCount"
]));
//#endregion
//#region src/shared/browser-annotation.ts
function asBrowserAnnotationPickOptions(value) {
	const options = browserValidators$10.BrowserAnnotationPickOptionsSchema.Parse(value);
	return options === null ? null : {
		...options,
		contextTargetId: options.contextTargetId,
		ordinal: options.ordinal
	};
}
function asBrowserAnnotationPickRequest(value) {
	const request = browserValidators$10.pick.Parse(value);
	const options = request === null ? null : asBrowserAnnotationPickOptions(request.options);
	return request === null || options === null ? null : {
		browserId: request.browserId,
		options
	};
}
const browserValidators$10 = {
	"context": v13,
	"referenceId": v14,
	"retainedAssets": v15,
	"completion": v16,
	"marker": v17,
	"captureAction": v18,
	"pick": v19,
	"BrowserAnnotationPickOptionsSchema": v20
};
//#endregion
//#region src/shared/browser-receipt.ts
const browserValidators$9 = {
	"receiptId": v65,
	"sessionId": v66,
	"read": v67,
	"copy": v68,
	"image": v69
};
//#endregion
//#region src/shared/browser-device.ts
const IOS_USER_AGENT = "Mozilla/5.0 (%s) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const ANDROID_USER_AGENT = "Mozilla/5.0 (Linux; Android 13; %s) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%c Mobile Safari/537.36";
ANDROID_USER_AGENT.replace("%s", "Pixel 7"), IOS_USER_AGENT.replace("%s", "iPhone; CPU iPhone OS 18_5 like Mac OS X"), IOS_USER_AGENT.replace("%s", "iPhone; CPU iPhone OS 18_5 like Mac OS X"), IOS_USER_AGENT.replace("%s", "iPhone; CPU iPhone OS 18_5 like Mac OS X"), IOS_USER_AGENT.replace("%s", "iPhone; CPU iPhone OS 18_5 like Mac OS X"), ANDROID_USER_AGENT.replace("%s", "Pixel 7"), ANDROID_USER_AGENT.replace("%s", "SM-G981B"), IOS_USER_AGENT.replace("%s", "iPad; CPU OS 18_5 like Mac OS X"), IOS_USER_AGENT.replace("18.5", "27.0").replace("%s", "iPhone; CPU iPhone OS 27_0 like Mac OS X"), IOS_USER_AGENT.replace("18.5", "27.0").replace("%s", "iPhone; CPU iPhone OS 27_0 like Mac OS X"), IOS_USER_AGENT.replace("%s", "iPhone; CPU iPhone OS 18_5 like Mac OS X"), IOS_USER_AGENT.replace("%s", "iPhone; CPU iPhone OS 18_5 like Mac OS X"), IOS_USER_AGENT.replace("%s", "iPhone; CPU iPhone OS 18_5 like Mac OS X"), ANDROID_USER_AGENT.replace("Android 13", "Android 14").replace("%s", "Pixel 8"), ANDROID_USER_AGENT.replace("Android 13", "Android 14").replace("%s", "Pixel 9");
function asBrowserDeviceModeRequest(value) {
	const input = browserValidators$8.DeviceInput.Parse(value);
	if (input === null) return null;
	if (input.enabled === false) return { enabled: false };
	const candidate = Object.fromEntries(Object.entries(input).filter(([, field]) => field !== void 0));
	return browserValidators$8.BrowserDeviceModeRequestSchema.Check(candidate) ? candidate : null;
}
function asBrowserDeviceModeUpdate(value) {
	const update = browserValidators$8.update.Parse(value);
	const request = update === null ? null : asBrowserDeviceModeRequest(update.request);
	return update === null || request === null ? null : {
		browserId: update.browserId,
		request
	};
}
const browserValidators$8 = {
	"DeviceInput": v40,
	"update": v41,
	"BrowserDeviceModeRequestSchema": v42,
	"BrowserDeviceStateSchema": v43
};
const EMPTY_BROWSER_STATE = {
	url: "",
	title: "",
	loading: false,
	canGoBack: false,
	canGoForward: false
};
function asBrowserFavicon(value) {
	if (typeof value !== "string" || value.length < 1 || value.length > 131072) return null;
	if (value.startsWith("data:image/")) return value;
	try {
		const protocol = new URL(value).protocol;
		return protocol === "http:" || protocol === "https:" ? value : null;
	} catch {
		return null;
	}
}
function isBrowserState(value) {
	return browserValidators$7.BrowserStateSchema.Check(value) && (value.favicon === void 0 || asBrowserFavicon(value.favicon) !== null);
}
function asBrowserId(value) {
	return browserValidators$7.BrowserIdSchema.Check(value) ? value : null;
}
function isBrowserStateEvent(value) {
	return browserValidators$7.BrowserStateEventSchema.Check(value) && isBrowserState(value.state);
}
function asBrowserBounds(value) {
	const bounds = browserValidators$7.BrowserBoundsSchema.Parse(value);
	return bounds === null ? null : {
		x: Math.round(bounds.x),
		y: Math.round(bounds.y),
		width: Math.round(bounds.width),
		height: Math.round(bounds.height)
	};
}
function isBrowserTabCommand(value) {
	return browserValidators$7.BrowserTabCommandSchema.Check(value);
}
function asBrowserFocusEmulationRequest(value) {
	return browserValidators$7.focusEmulation.Parse(value);
}
function asBrowserNavigateRequest(value) {
	const request = browserValidators$7.navigate.Parse(value);
	return request !== null && request.address.trim() !== "" ? request : null;
}
function asBrowserCloneRequest(value) {
	const request = browserValidators$7.clone.Parse(value);
	return request !== null && request.sourceId !== request.targetId ? request : null;
}
function asBrowserZoomRequest(value) {
	return browserValidators$7.zoom.Parse(value);
}
function asBrowserBoundsRequest(value) {
	const request = browserValidators$7.bounds.Parse(value);
	const bounds = request === null ? null : asBrowserBounds(request.bounds);
	return request === null || bounds === null ? null : {
		browserId: request.browserId,
		bounds
	};
}
function asBrowserVisibilityRequest(value) {
	return browserValidators$7.visibility.Parse(value);
}
const browserValidators$7 = {
	"focusEmulation": v0,
	"navigate": v1,
	"clone": v2,
	"openLink": v3,
	"find": v4,
	"zoom": v5,
	"bounds": v6,
	"visibility": v7,
	"BrowserStateSchema": v8,
	"BrowserIdSchema": v9,
	"BrowserStateEventSchema": v10,
	"BrowserBoundsSchema": v11,
	"BrowserTabCommandSchema": v12
};
//#endregion
//#region src/shared/browser-sites.ts
function browserSiteOrigin(value) {
	if (typeof value !== "string" || value.length > 32768) return null;
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
	} catch {
		return null;
	}
}
function isBrowserSitePermission(value) {
	return browserValidators$6.BrowserSitePermissionSchema.Check(value);
}
function asBrowserSiteRecord(value) {
	const record = browserValidators$6.BrowserSiteRecordSchema.Parse(value);
	if (record === null) return null;
	const origin = browserSiteOrigin(record.origin);
	return origin === null ? null : {
		...record,
		origin,
		permissions: { ...record.permissions }
	};
}
function asBrowserSiteInfo(value) {
	if (!browserValidators$6.BrowserSiteInfoSchema.Check(value)) return null;
	const site = asBrowserSiteRecord(value);
	return site === null ? null : {
		...site,
		cookieCount: value.cookieCount
	};
}
function asBrowserSitePermissionUpdate(value) {
	const update = browserValidators$6.permissionUpdate.Parse(value);
	const origin = update === null ? null : browserSiteOrigin(update.origin);
	return update === null || origin === null ? null : {
		...update,
		origin
	};
}
function asBrowserSystemPermissionStates(value) {
	const states = browserValidators$6.BrowserSystemPermissionStatesSchema.Parse(value);
	return states === null ? null : [...new Set(states)];
}
const browserValidators$6 = {
	"permissionUpdate": v71,
	"BrowserPermissionRequestsSchema": v72,
	"BrowserPermissionDecisionSchema": v73,
	"BrowserSystemPermissionStatesSchema": v74,
	"BrowserSitePermissionSchema": v75,
	"BrowserSiteSettingSchema": v76,
	"BrowserSiteRecordSchema": v77,
	"BrowserSiteInfoSchema": v78
};
//#endregion
//#region src/shared/browser-control.ts
function isBrowserControlConfig(value) {
	return browserValidators$5.BrowserControlConfigSchema.Check(value);
}
function isBrowserControlOwnership(value) {
	return browserValidators$5.BrowserControlOwnershipSchema.Check(value);
}
const browserValidators$5 = {
	"surface": v26,
	"pointer": v27,
	"activity": v28,
	"takeover": v29,
	"BrowserControlConfigSchema": v30,
	"BrowserControlOwnershipSchema": v31
};
//#endregion
//#region ../../packages/app-core/src/browserReference.ts
function isBrowserReferenceId(value) {
	return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(value);
}
function record(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value, max) {
	return typeof value === "string" && value["length"] <= max;
}
function number(value, min, max = 1e6) {
	return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}
function optionalText(value, max) {
	return value === void 0 || text(value, max);
}
function parseRect(value) {
	if (!record(value) || !number(value["x"], -1e6) || !number(value["y"], -1e6) || !number(value["width"], .01) || !number(value["height"], .01)) return null;
	return {
		x: value["x"],
		y: value["y"],
		width: value["width"],
		height: value["height"]
	};
}
function parseTarget(value) {
	if (!record(value)) return null;
	const bounds = parseRect(value["bounds"]);
	if (bounds === null) return null;
	if (value["kind"] === "region") return {
		kind: "region",
		bounds
	};
	if (value["kind"] !== "element" || !text(value["tagName"], 128) || value["tagName"]["length"] === 0 || !optionalText(value["role"], 128) || !optionalText(value["accessibleName"], 2e3) || !optionalText(value["text"], 4e3)) return null;
	let attributes;
	if (value["attributes"] !== void 0) {
		if (!record(value["attributes"]) || Object.keys(value["attributes"]).length > 128) return null;
		const entries = Object.entries(value["attributes"]);
		if (entries.some(([key, entry]) => !/^(id|class|href|target|src|alt|type|name|placeholder|disabled|readonly|data-[a-zA-Z0-9_.:-]+)$/.test(key) || key.length > 128 || !text(entry, 4096))) return null;
		if (entries.reduce((total, [key, entry]) => total + key.length + entry.length, 0) > 32768) return null;
		attributes = Object.fromEntries(entries);
	}
	if (value["attributesTruncated"] !== void 0 && typeof value["attributesTruncated"] !== "boolean") return null;
	let locator;
	if (value["locator"] !== void 0) {
		if (!record(value["locator"]) || !optionalText(value["locator"]["selector"], 4096) || !optionalText(value["locator"]["xpath"], 4096)) return null;
		const framePath = value["locator"]["framePath"];
		if (framePath !== void 0 && (!Array.isArray(framePath) || framePath.length > 16 || !framePath.every((frame) => text(frame, 4096)))) return null;
		locator = {
			xpath: value["locator"]["xpath"],
			selector: value["locator"]["selector"],
			framePath: framePath === void 0 ? void 0 : [...framePath]
		};
	}
	return {
		kind: "element",
		...attributes === void 0 ? {} : { attributes },
		...value["attributesTruncated"] === void 0 ? {} : { attributesTruncated: value["attributesTruncated"] },
		tagName: value["tagName"],
		role: value["role"],
		accessibleName: value["accessibleName"],
		text: value["text"],
		locator,
		bounds
	};
}
function parseBrowserCapture(value) {
	if (record(value) && value["bindingId"] !== void 0 && !isBrowserReferenceId(value["bindingId"])) return null;
	if (!record(value) || value["version"] !== 1 || !isBrowserReferenceId(value["id"]) || !number(value["ordinal"], 1) || !Number.isInteger(value["ordinal"]) || !text(value["label"], 256) || value["label"]["length"] === 0) return null;
	if (!text(value["capturedAt"], 64) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value["capturedAt"]) || !Number.isFinite(Date.parse(value["capturedAt"]))) return null;
	if (new Date(value["capturedAt"]).toISOString() !== value["capturedAt"]) return null;
	if (!record(value["page"]) || !text(value["page"]["url"], 32768) || !text(value["page"]["title"], 1024)) return null;
	try {
		if (!["http:", "https:"].includes(new URL(value["page"]["url"]).protocol)) return null;
	} catch {
		return null;
	}
	const target = parseTarget(value["target"]);
	const viewport = value["viewport"];
	if (target === null || !record(viewport) || !number(viewport["width"], 1) || !number(viewport["height"], 1) || !number(viewport["scrollX"], -1e6) || !number(viewport["scrollY"], -1e6) || !number(viewport["zoomFactor"], .01, 64) || !number(viewport["devicePixelRatio"], .01, 64)) return null;
	let screenshot;
	if (value["screenshot"] !== void 0) {
		const raw = value["screenshot"];
		if (!record(raw) || !isBrowserReferenceId(raw["attachmentId"]) || !number(raw["pixelWidth"], 1, 32768) || !number(raw["pixelHeight"], 1, 32768) || !Number.isInteger(raw["pixelWidth"]) || !Number.isInteger(raw["pixelHeight"])) return null;
		const crop = parseRect(raw["crop"]);
		if (crop === null || crop.x < 0 || crop.y < 0 || crop.x + crop.width > viewport["width"] + 1 || crop.y + crop.height > viewport["height"] + 1) return null;
		screenshot = {
			attachmentId: raw["attachmentId"],
			crop,
			pixelWidth: raw["pixelWidth"],
			pixelHeight: raw["pixelHeight"]
		};
	}
	return {
		version: 1,
		id: value["id"],
		...value["bindingId"] === void 0 ? {} : { bindingId: value["bindingId"] },
		ordinal: value["ordinal"],
		label: value["label"],
		capturedAt: value["capturedAt"],
		page: {
			url: value["page"]["url"],
			title: value["page"]["title"]
		},
		target,
		viewport: {
			width: viewport["width"],
			height: viewport["height"],
			scrollX: viewport["scrollX"],
			scrollY: viewport["scrollY"],
			zoomFactor: viewport["zoomFactor"],
			devicePixelRatio: viewport["devicePixelRatio"]
		},
		screenshot
	};
}
//#endregion
//#region src/shared/browser-annotation-details.ts
function parseBrowserAnnotationDetails(value) {
	const details = browserValidators$4.DetailsInput.Parse(value);
	if (details === null) return null;
	const capture = parseBrowserCapture(details.capture);
	if (capture === null) return null;
	try {
		Intl.getCanonicalLocales(details.locale);
	} catch {
		return null;
	}
	const labels = browserValidators$4.BrowserAnnotationDetailLabelsSchema.Parse(details.labels);
	return labels === null ? null : {
		capture,
		locale: details.locale,
		labels
	};
}
const browserValidators$4 = {
	"DetailsInput": v21,
	"BrowserAnnotationDetailLabelsSchema": v22
};
//#endregion
//#region src/shared/browser-overlay.ts
function isBrowserOverlayAction(value) {
	return browserValidators$3.Action.Check(value);
}
function isBrowserOverlayClosed(value) {
	return browserValidators$3.Closed.Check(value);
}
function isBrowserOverlayDialogAction(value) {
	return browserValidators$3.DialogAction.Check(value);
}
function isBrowserOverlayDialogClosed(value) {
	return browserValidators$3.DialogClosed.Check(value);
}
function asBrowserOverlayMenuId(value) {
	return browserValidators$3.Id.Check(value) ? value : null;
}
function asMenuItem(value) {
	const validator = [
		browserValidators$3.menuItem0,
		browserValidators$3.menuItem1,
		browserValidators$3.menuItem2,
		browserValidators$3.menuItem3,
		browserValidators$3.menuItem4
	].find((branch) => branch.Check(value));
	if (validator === void 0) return null;
	const item = validator.Parse(value);
	if (item.kind === "choices") {
		item.options = item.options.map(({ id, label }) => ({
			id,
			label
		}));
		if (new Set(item.options.map((option) => option.id)).size !== item.options.length) return null;
		if (item.value !== "" && !item.options.some((option) => option.id === item.value)) return null;
		if (item.disabled !== true) delete item.disabled;
		if (item.notice !== void 0) item.notice = {
			message: item.notice.message,
			linkLabel: item.notice.linkLabel,
			action: item.notice.action
		};
	}
	if (item.kind === "zoom") {
		if (item.decreaseDisabled !== true) delete item.decreaseDisabled;
		if (item.increaseDisabled !== true) delete item.increaseDisabled;
		if (item.resetDisabled !== true) delete item.resetDisabled;
	}
	if (item.kind === "item") {
		if (item.shortcut !== void 0) item.shortcut = [...item.shortcut];
		if (item.favicon !== void 0 && asBrowserFavicon(item.favicon) === null) return null;
		if (item.disabled !== true) delete item.disabled;
		if (item.danger !== true) delete item.danger;
		if (item.starred !== true) delete item.starred;
		if (item.keepOpen !== true) delete item.keepOpen;
	}
	return item;
}
function asBrowserOverlayMenuRequest(value) {
	const request = browserValidators$3.BrowserOverlayMenuRequestSchema.Parse(value);
	if (request === null) return null;
	const anchor = asBrowserBounds(request.anchor);
	if (request.width !== void 0 && request.width > Math.max(640, request.preserveFocus === true ? Math.ceil(anchor.width) : 0)) return null;
	if (request.footerStart !== void 0 && request.footerStart > request.items.length) return null;
	const items = [];
	const ids = /* @__PURE__ */ new Set();
	for (const raw of request.items) {
		const item = asMenuItem(raw);
		if (item === null) return null;
		if (item.kind !== "separator") {
			const itemIds = item.kind === "zoom" ? [
				item.id,
				item.decreaseAction,
				item.increaseAction,
				item.resetAction
			] : item.kind === "choices" ? [
				item.id,
				...item.options.map((option) => option.id),
				...item.notice === void 0 ? [] : [item.notice.action]
			] : [item.id];
			if (new Set(itemIds).size !== itemIds.length) return null;
			if (itemIds.some((id) => ids.has(id))) return null;
			for (const id of itemIds) ids.add(id);
		}
		items.push(item);
	}
	if (items.every((item) => item.kind === "separator")) return null;
	return {
		menuId: request.menuId,
		anchor,
		items,
		placement: request.placement ?? "bottom-end",
		offset: Math.round(request.offset ?? 4),
		width: Math.round(request.width ?? 220),
		...request.initialFocus === void 0 ? {} : { initialFocus: request.initialFocus },
		...request.autoWidth === true ? { autoWidth: true } : {},
		...request.preserveFocus === true ? { preserveFocus: true } : {},
		...request.footerStart === void 0 ? {} : { footerStart: request.footerStart },
		...request.query ? { query: request.query } : {}
	};
}
function asBrowserOverlayDialogRequest(value) {
	const input = browserValidators$3.DialogInput.Parse(value);
	if (input === null) return null;
	const annotation = input.annotation === void 0 ? void 0 : parseBrowserAnnotationDetails(input.annotation);
	if (annotation === null) return null;
	return {
		...input.preserveFocus === void 0 ? {} : { preserveFocus: input.preserveFocus },
		...input.dismissible === void 0 ? {} : { dismissible: input.dismissible },
		dialogId: input.dialogId,
		title: input.title,
		confirmLabel: input.confirmLabel,
		cancelLabel: input.cancelLabel,
		closeLabel: input.closeLabel,
		anchor: input.anchor === void 0 ? void 0 : asBrowserBounds(input.anchor),
		...input.boundary === void 0 ? {} : { boundary: asBrowserBounds(input.boundary) },
		...annotation === void 0 ? {} : { annotation },
		...input.message === void 0 ? {} : { message: input.message },
		...input.input === void 0 ? {} : { input: {
			label: input.input.label,
			value: input.input.value,
			placeholder: input.input.placeholder,
			readOnly: input.input.readOnly
		} },
		...input.checkbox === void 0 ? {} : { checkbox: {
			label: input.checkbox.label,
			checked: input.checkbox.checked,
			disabled: input.checkbox.disabled
		} },
		...input.preview === void 0 ? {} : { preview: {
			src: input.preview.src,
			alt: input.preview.alt
		} },
		...input.auxiliary === void 0 ? {} : { auxiliary: {
			label: input.auxiliary.label,
			disabled: input.auxiliary.disabled
		} },
		variant: input.variant === "primary" ? "primary" : "danger",
		...input.loading === true ? { loading: true } : {},
		...input.initialFocus === void 0 ? {} : { initialFocus: input.initialFocus },
		...input.viewport === void 0 ? {} : { viewport: {
			width: Math.round(input.viewport.width),
			height: Math.round(input.viewport.height)
		} }
	};
}
const browserValidators$3 = {
	"MenuConfig": v44,
	"Shown": v45,
	"Action": v46,
	"Closed": v47,
	"DialogAction": v48,
	"DialogClosed": v49,
	"FormAction": v50,
	"Id": v51,
	"BrowserOverlayMenuRequestSchema": v52,
	"DialogInput": v53,
	"Rendered": v54,
	"Visibility": v55,
	"DialogKind": v56,
	"Activate": v57,
	"Dismiss": v58,
	"menuItem0": v59,
	"menuItem1": v60,
	"menuItem2": v61,
	"menuItem3": v62,
	"menuItem4": v63
};
//#endregion
//#region src/shared/browser-data.ts
function isBrowserPreferencesPatch(value) {
	return browserValidators$2.BrowserPreferencesPatchSchema.Check(value);
}
function isBrowserDataSnapshot(value) {
	return browserValidators$2.BrowserDataSnapshotSchema.Check(value);
}
function isBrowserDownloadItems(value) {
	return browserValidators$2.BrowserDownloadItemsSchema.Check(value);
}
function isBrowserDownloadsWatch(value) {
	return browserValidators$2.BrowserDownloadsWatchSchema.Check(value);
}
function isBrowserDownloadId(value) {
	return browserValidators$2.BrowserDownloadIdSchema.Check(value);
}
function asBrowserDownloadAction(value) {
	return browserValidators$2.BrowserDownloadActionSchema.Parse(value);
}
const browserValidators$2 = {
	"BrowserPreferencesPatchSchema": v32,
	"BrowserDataSnapshotSchema": v33,
	"BrowserDownloadItemsSchema": v34,
	"BrowserDownloadActionSchema": v35,
	"BrowserDownloadIdSchema": v36,
	"BrowserDownloadsWatchSchema": v37
};
//#endregion
//#region src/shared/browser-panel-state.ts
const browserValidators$1 = { "BrowserPanelSessionsSchema": v64 };
const RESERVED_IDS = /* @__PURE__ */ new Set([
	"__proto__",
	"constructor",
	"prototype"
]);
function asBrowserPanelSessions(value) {
	const parsed = browserValidators$1.BrowserPanelSessionsSchema.Parse(value);
	if (parsed === null) return null;
	const sessions = /* @__PURE__ */ new Set();
	const browsers = /* @__PURE__ */ new Set();
	const result = [];
	for (const item of parsed) {
		if (RESERVED_IDS.has(item.sessionId) || sessions.has(item.sessionId)) return null;
		sessions.add(item.sessionId);
		const tabs = [];
		for (const tab of item.tabs) {
			if (RESERVED_IDS.has(tab.browserId) || browsers.has(tab.browserId)) return null;
			browsers.add(tab.browserId);
			tabs.push({
				browserId: tab.browserId,
				...tab.title === void 0 ? {} : { title: tab.title },
				...tab.customTitle === void 0 ? {} : { customTitle: tab.customTitle }
			});
		}
		if (item.activeBrowserId !== null && !tabs.some((tab) => tab.browserId === item.activeBrowserId)) return null;
		result.push({
			sessionId: item.sessionId,
			tabs,
			activeBrowserId: item.activeBrowserId,
			visible: item.visible
		});
	}
	return result;
}
//#endregion
//#region src/shared/terminal-activity.ts
function isTerminalActivityList(value) {
	return Array.isArray(value) && value.every((item) => item !== null && typeof item === "object" && typeof item.id === "string" && [
		"idle",
		"busy",
		"unknown",
		"exited"
	].includes(item.state) && typeof item.binary === "string" && typeof item.cwd === "string" && Array.isArray(item.processes) && item.processes.every((process) => {
		if (process === null || typeof process !== "object") return false;
		const entry = process;
		return Number.isSafeInteger(entry["pid"]) && entry["pid"] > 0 && typeof entry["binary"] === "string";
	}));
}
//#endregion
//#region src/shared/debug-flags.ts
function asDebugFlags(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.enabled !== "boolean") return null;
	return { enabled: candidate.enabled };
}
//#endregion
//#region src/shared/browser-automation-ui.ts
function isBrowserUiRequest(value) {
	return browserValidators.UiRequest.Check(value);
}
function isBrowserUiResponse(value) {
	return browserValidators.UiResponse.Check(value);
}
const browserValidators = {
	"UiRequest": v23,
	"UiState": v24,
	"UiResponse": v25
};
//#endregion
//#region src/main/preload.ts
const UPDATE_STATES = /* @__PURE__ */ new Set([
	"idle",
	"available",
	"downloading",
	"downloaded",
	"error"
]);
const UPDATE_CHECK_OUTCOMES = /* @__PURE__ */ new Set([
	"available",
	"latest",
	"unsupported",
	"error"
]);
const CANARY_GH_STATES = /* @__PURE__ */ new Set([
	"ok",
	"missing",
	"unauthenticated",
	"error"
]);
const CANARY_STABLE_IMPORT_STATUSES = /* @__PURE__ */ new Set([
	"relaunching",
	"unavailable",
	"no-stable-data",
	"stable-running",
	"error",
	"cancelled"
]);
function asCanaryStableImportResult(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.status !== "string" || !CANARY_STABLE_IMPORT_STATUSES.has(candidate.status)) return null;
	return {
		status: candidate.status,
		...typeof candidate.error === "string" ? { error: candidate.error } : {}
	};
}
function asCanaryInfo(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.enabled !== "boolean" || typeof candidate.isCanaryBuild !== "boolean" || typeof candidate.gh !== "string" || !CANARY_GH_STATES.has(candidate.gh) || typeof candidate.actionsUrl !== "string") return null;
	return {
		enabled: candidate.enabled,
		isCanaryBuild: candidate.isCanaryBuild,
		isRealCanaryBuild: candidate.isRealCanaryBuild === true,
		gh: candidate.gh,
		actionsUrl: candidate.actionsUrl
	};
}
function asCanaryTriggerResult(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.ok !== "boolean") return null;
	return candidate.ok ? { ok: true } : {
		ok: false,
		error: typeof candidate.error === "string" ? candidate.error : "unknown error"
	};
}
function asCount(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function asTrayAttentionItem(value) {
	if (typeof value !== "object" || value === null) return false;
	const candidate = value;
	return typeof candidate.sessionId === "string" && candidate.sessionId !== "" && typeof candidate.title === "string" && typeof candidate.unread === "boolean" && asCount(candidate.approvals) && asCount(candidate.questions);
}
function asTrayAttention(value) {
	if (typeof value !== "object" || value === null) return false;
	const candidate = value;
	return asCount(candidate.unread) && asCount(candidate.approvals) && asCount(candidate.questions) && Array.isArray(candidate.items) && candidate.items.every(asTrayAttentionItem);
}
function asUpdateStatus(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.state !== "string" || !UPDATE_STATES.has(candidate.state)) return null;
	const status = { state: candidate.state };
	if (typeof candidate.version === "string") status.version = candidate.version;
	if (typeof candidate.percent === "number") status.percent = candidate.percent;
	if (typeof candidate.message === "string") status.message = candidate.message;
	if (typeof candidate.releaseDate === "string") status.releaseDate = candidate.releaseDate;
	if (typeof candidate.releaseNotes === "object" && candidate.releaseNotes !== null && !Array.isArray(candidate.releaseNotes)) {
		const notes = candidate.releaseNotes;
		status.releaseNotes = {};
		if (typeof notes.zh === "string") status.releaseNotes.zh = notes.zh;
		if (typeof notes.en === "string") status.releaseNotes.en = notes.en;
	}
	return status;
}
function asUpdateCheckResult(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.outcome !== "string" || !UPDATE_CHECK_OUTCOMES.has(candidate.outcome)) return null;
	switch (candidate.outcome) {
		case "available": return typeof candidate.version === "string" ? {
			outcome: "available",
			version: candidate.version
		} : { outcome: "available" };
		case "error": return {
			outcome: "error",
			message: typeof candidate.message === "string" ? candidate.message : "unknown error"
		};
		default: return { outcome: candidate.outcome };
	}
}
function asJumpListWorkspaces(value) {
	return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null && typeof item.name === "string" && typeof item.root === "string" && item.root !== "");
}
function asLaunchActionPayload(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (candidate.action === "new-chat") return { action: "new-chat" };
	if (candidate.action === "open-workspace" && typeof candidate.root === "string" && candidate.root !== "") return {
		action: "open-workspace",
		root: candidate.root
	};
	return null;
}
function asScreenshotCaptureResult(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	switch (candidate.status) {
		case "ok":
			if (!(candidate.pngBytes instanceof Uint8Array) || typeof candidate.comment !== "string") return null;
			return {
				status: "ok",
				pngBytes: candidate.pngBytes,
				comment: candidate.comment
			};
		case "completed":
		case "cancelled":
		case "denied": return { status: candidate.status };
		case "error": return {
			status: "error",
			reason: typeof candidate.reason === "string" ? candidate.reason : "unknown"
		};
		default: return null;
	}
}
function asPrPreviewState(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	switch (candidate.phase) {
		case "idle":
		case "fetching":
		case "installing":
		case "building":
		case "active":
		case "error": break;
		default: return null;
	}
	const state = { phase: candidate.phase };
	if (typeof candidate.pr === "number" && Number.isInteger(candidate.pr)) state.pr = candidate.pr;
	if (typeof candidate.refTarget === "string") state.refTarget = candidate.refTarget;
	if (typeof candidate.label === "string") state.label = candidate.label;
	if (typeof candidate.message === "string") state.message = candidate.message;
	if (typeof candidate.logTail === "string") state.logTail = candidate.logTail;
	if (typeof candidate.servingPr === "number" && Number.isInteger(candidate.servingPr)) state.servingPr = candidate.servingPr;
	if (typeof candidate.servingLabel === "string") state.servingLabel = candidate.servingLabel;
	if (candidate.errorStage === "fetch" || candidate.errorStage === "install" || candidate.errorStage === "build") state.errorStage = candidate.errorStage;
	if (candidate.errorHung === true) state.errorHung = true;
	return state;
}
function asPrPreviewRefList(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (!Array.isArray(candidate.prs) || !Array.isArray(candidate.branches)) return null;
	const prs = [];
	for (const entry of candidate.prs) {
		if (typeof entry !== "object" || entry === null) continue;
		const { number, title } = entry;
		if (typeof number === "number" && Number.isInteger(number) && typeof title === "string") prs.push({
			number,
			title
		});
	}
	return {
		prs,
		branches: candidate.branches.filter((b) => typeof b === "string")
	};
}
function asNativeTerminalInfo(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (typeof candidate.id === "string" && candidate.id !== "" && typeof candidate.shell === "string" && typeof candidate.cwd === "string") return {
		id: candidate.id,
		shell: candidate.shell,
		cwd: candidate.cwd
	};
	return null;
}
const api = {
	browserOverlaySupported: process.argv.includes("--kimi-native-overlay-host"),
	inspectNativeTerminals: async (ids) => {
		const result = await electron.ipcRenderer.invoke("kimi:terminal-inspect", ids);
		if (!isTerminalActivityList(result)) throw new Error("Invalid terminal activity response");
		return result;
	},
	setTheme: (scheme) => {
		if (scheme === "light" || scheme === "dark" || scheme === "system") electron.ipcRenderer.send("kimi:theme", scheme);
	},
	popupWindowsMenu: (request) => electron.ipcRenderer.invoke("kimi:menu-popup", request),
	setDockIconChoice: (choice) => {
		if (choice === "light" || choice === "dark") electron.ipcRenderer.send("kimi:dock-icon-choice", choice);
	},
	onMenuAction: (cb) => {
		const listener = (_event, id) => cb(id);
		electron.ipcRenderer.on("kimi:menu-action", listener);
		return () => electron.ipcRenderer.removeListener("kimi:menu-action", listener);
	},
	onShortcut: (cb) => {
		const listener = (_event, accel) => cb(accel);
		electron.ipcRenderer.on("kimi:shortcut", listener);
		return () => electron.ipcRenderer.removeListener("kimi:shortcut", listener);
	},
	openExternal: (url) => electron.ipcRenderer.invoke("kimi:open-external", url),
	updateServerCredential: (token) => electron.ipcRenderer.invoke("kimi:server-credential", token),
	showOpenDialog: (opts) => electron.ipcRenderer.invoke("kimi:dialog-open", opts),
	showSaveDialog: (opts) => electron.ipcRenderer.invoke("kimi:dialog-save", opts),
	getPathForFile: (file) => {
		try {
			const path = electron.webUtils.getPathForFile(file);
			return path === "" ? null : path;
		} catch {
			return null;
		}
	},
	listOpenInApps: (filePath) => electron.ipcRenderer.invoke("kimi:open-in-list", filePath),
	openInApp: (appId, path) => electron.ipcRenderer.invoke("kimi:open-in", appId, path),
	setOnboarded: () => electron.ipcRenderer.send("kimi:set-onboarded"),
	isFullscreen: () => electron.ipcRenderer.invoke("kimi:is-fullscreen"),
	onFullscreenChanged: (cb) => {
		const listener = (_event, flag) => cb(flag === true);
		electron.ipcRenderer.on("kimi:fullscreen-changed", listener);
		return () => electron.ipcRenderer.removeListener("kimi:fullscreen-changed", listener);
	},
	getUpdateStatus: async () => {
		return asUpdateStatus(await electron.ipcRenderer.invoke("kimi:update-get-status")) ?? { state: "idle" };
	},
	checkForUpdates: async () => {
		return asUpdateCheckResult(await electron.ipcRenderer.invoke("kimi:update-check")) ?? {
			outcome: "error",
			message: "invalid update-check response"
		};
	},
	onUpdateStatus: (cb) => {
		const listener = (_event, payload) => {
			const status = asUpdateStatus(payload);
			if (status !== null) cb(status);
		};
		electron.ipcRenderer.on("kimi:update-status", listener);
		return () => electron.ipcRenderer.removeListener("kimi:update-status", listener);
	},
	downloadUpdate: () => electron.ipcRenderer.invoke("kimi:update-download"),
	installUpdate: () => electron.ipcRenderer.invoke("kimi:update-install"),
	getUpdateAutoDownload: async () => {
		return await electron.ipcRenderer.invoke("kimi:update-get-auto-download") === true;
	},
	setUpdateAutoDownload: async (enabled) => {
		if (typeof enabled !== "boolean") return;
		await electron.ipcRenderer.invoke("kimi:update-set-auto-download", enabled);
	},
	getCanaryInfo: async () => {
		return asCanaryInfo(await electron.ipcRenderer.invoke("kimi:canary-get-info")) ?? {
			enabled: false,
			isCanaryBuild: false,
			isRealCanaryBuild: false,
			gh: "error",
			actionsUrl: ""
		};
	},
	triggerCanaryBuild: async () => {
		return asCanaryTriggerResult(await electron.ipcRenderer.invoke("kimi:canary-trigger")) ?? {
			ok: false,
			error: "invalid canary-trigger response"
		};
	},
	canaryImportStableSettings: async () => {
		return asCanaryStableImportResult(await electron.ipcRenderer.invoke("kimi:canary-import-stable-settings")) ?? {
			status: "error",
			error: "invalid canary-import-stable-settings response"
		};
	},
	getDebugFlags: async () => {
		return asDebugFlags(await electron.ipcRenderer.invoke("kimi:debug-get-flags")) ?? { enabled: false };
	},
	setTrayAttention: (attention) => {
		if (asTrayAttention(attention)) electron.ipcRenderer.send("kimi:tray-attention", attention);
	},
	onTraySelectSession: (cb) => {
		const listener = (_event, sessionId) => {
			if (typeof sessionId === "string" && sessionId !== "") cb(sessionId);
		};
		electron.ipcRenderer.on("kimi:tray-select-session", listener);
		return () => electron.ipcRenderer.removeListener("kimi:tray-select-session", listener);
	},
	setLocale: (locale) => {
		if (locale === "en" || locale === "zh") electron.ipcRenderer.send("kimi:locale", locale);
	},
	setMenuShortcuts: (bindings) => {
		if (bindings !== null && typeof bindings === "object" && !Array.isArray(bindings)) electron.ipcRenderer.send("kimi:menu-shortcut", bindings);
	},
	setMenuSuspended: (suspended) => {
		if (typeof suspended === "boolean") electron.ipcRenderer.send("kimi:menu-suspend", suspended);
	},
	setTerminalMenuFocus: (focused) => {
		if (typeof focused === "boolean") electron.ipcRenderer.send("kimi:menu-terminal-focus", focused);
	},
	setGlobalShortcut: async (action, binding) => {
		if (typeof action !== "string" || binding !== null && typeof binding !== "string") return false;
		return await electron.ipcRenderer.invoke("kimi:global-shortcut", {
			action,
			binding
		}) === true;
	},
	setGlobalShortcutSuspended: async (suspended) => {
		if (typeof suspended !== "boolean") return false;
		return await electron.ipcRenderer.invoke("kimi:global-shortcut-suspend", suspended) === true;
	},
	showWindow: () => {
		electron.ipcRenderer.send("kimi:show-window");
	},
	hideWindow: () => {
		electron.ipcRenderer.send("kimi:hide-window");
	},
	setJumpList: (workspaces) => {
		if (asJumpListWorkspaces(workspaces)) electron.ipcRenderer.send("kimi:jump-list", workspaces);
	},
	onLaunchAction: (cb) => {
		const listener = (_event, payload) => {
			const action = asLaunchActionPayload(payload);
			if (action !== null) cb(action);
		};
		electron.ipcRenderer.on("kimi:launch-action", listener);
		return () => electron.ipcRenderer.removeListener("kimi:launch-action", listener);
	},
	onQuitConfirm: (cb) => {
		const listener = (_event, requestId) => {
			if (typeof requestId === "number" && Number.isInteger(requestId)) cb(requestId);
		};
		electron.ipcRenderer.on("kimi:quit-confirm", listener);
		return () => electron.ipcRenderer.removeListener("kimi:quit-confirm", listener);
	},
	onQuitConfirmCancel: (cb) => {
		const listener = (_event, requestId) => {
			if (typeof requestId === "number" && Number.isInteger(requestId)) cb(requestId);
		};
		electron.ipcRenderer.on("kimi:quit-confirm-cancel", listener);
		return () => electron.ipcRenderer.removeListener("kimi:quit-confirm-cancel", listener);
	},
	respondQuitConfirm: (choice, requestId) => {
		if (choice !== "quit" && choice !== "cancel" && choice !== "unavailable") return Promise.resolve();
		if (typeof requestId !== "number" || !Number.isInteger(requestId)) return Promise.resolve();
		return electron.ipcRenderer.invoke("kimi:quit-confirm-response", {
			choice,
			requestId
		});
	},
	onDeepLinkAuth: (cb) => {
		const listener = () => cb();
		electron.ipcRenderer.on("kimi:deep-link-auth", listener);
		return () => electron.ipcRenderer.removeListener("kimi:deep-link-auth", listener);
	},
	setVibrancy: (enabled) => {
		if (typeof enabled === "boolean") electron.ipcRenderer.send("kimi:vibrancy", enabled);
	},
	getVibrancy: async () => await electron.ipcRenderer.invoke("kimi:get-vibrancy") !== false,
	log: (level, message, detail) => {
		if (level !== "info" && level !== "warn" && level !== "error") return;
		if (typeof message !== "string" || message === "") return;
		electron.ipcRenderer.send("kimi:renderer-log", {
			level,
			message,
			detail
		});
	},
	track: (event, properties) => {
		if (typeof event === "string" && event !== "") electron.ipcRenderer.send("kimi:track", event, properties);
	},
	createNativeTerminal: async (opts) => {
		const options = {};
		if (typeof opts?.cwd === "string" && opts.cwd !== "") options["cwd"] = opts.cwd;
		if (typeof opts?.cols === "number" && Number.isFinite(opts.cols)) options["cols"] = opts.cols;
		if (typeof opts?.rows === "number" && Number.isFinite(opts.rows)) options["rows"] = opts.rows;
		const info = asNativeTerminalInfo(await electron.ipcRenderer.invoke("kimi:terminal-create", options));
		if (info === null) throw new Error("terminal-create: invalid response from main process");
		return info;
	},
	isScreenshotSupported: () => process.platform !== "linux" || process.env["XDG_SESSION_TYPE"]?.toLowerCase() === "x11" || process.env["WAYLAND_DISPLAY"] === void 0,
	captureScreenshot: async () => {
		return asScreenshotCaptureResult(await electron.ipcRenderer.invoke("kimi:screenshot-capture")) ?? {
			status: "error",
			reason: "invalid screenshot-capture response"
		};
	},
	cancelScreenshotCapture: () => {
		electron.ipcRenderer.send("kimi:screenshot-cancel");
	},
	getScreenshotGuidance: () => electron.ipcRenderer.invoke("kimi:screenshot-guide-get"),
	onScreenshotGuidance: (cb) => {
		const listener = (_event, guide) => cb(guide);
		electron.ipcRenderer.on("kimi:screenshot-guide-changed", listener);
		return () => electron.ipcRenderer.removeListener("kimi:screenshot-guide-changed", listener);
	},
	screenshotGuidanceAction: (captureId, action) => electron.ipcRenderer.invoke("kimi:screenshot-guide-action", captureId, action),
	onScreenshotHotkey: (cb) => {
		const listener = () => cb();
		electron.ipcRenderer.on("kimi:screenshot-hotkey", listener);
		return () => electron.ipcRenderer.removeListener("kimi:screenshot-hotkey", listener);
	},
	nativeTerminalInput: (id, data) => {
		if (typeof id === "string" && id !== "" && typeof data === "string" && data !== "") electron.ipcRenderer.send("kimi:terminal-input", {
			id,
			data
		});
	},
	nativeTerminalResize: (id, cols, rows) => {
		if (typeof id === "string" && id !== "" && typeof cols === "number" && Number.isFinite(cols) && typeof rows === "number" && Number.isFinite(rows)) electron.ipcRenderer.send("kimi:terminal-resize", {
			id,
			cols,
			rows
		});
	},
	closeNativeTerminal: (id) => {
		if (typeof id === "string" && id !== "") electron.ipcRenderer.send("kimi:terminal-close", { id });
	},
	onNativeTerminalOutput: (cb) => {
		const listener = (_event, payload) => {
			if (typeof payload !== "object" || payload === null) return;
			const { id, data } = payload;
			if (typeof id === "string" && id !== "" && typeof data === "string") cb(id, data);
		};
		electron.ipcRenderer.on("kimi:terminal-output", listener);
		return () => electron.ipcRenderer.removeListener("kimi:terminal-output", listener);
	},
	onNativeTerminalExit: (cb) => {
		const listener = (_event, payload) => {
			if (typeof payload !== "object" || payload === null) return;
			const { id, exitCode } = payload;
			if (typeof id === "string" && id !== "") cb(id, typeof exitCode === "number" ? exitCode : null);
		};
		electron.ipcRenderer.on("kimi:terminal-exit", listener);
		return () => electron.ipcRenderer.removeListener("kimi:terminal-exit", listener);
	},
	browserGetSessions: async () => {
		const sessions = asBrowserPanelSessions(await electron.ipcRenderer.invoke("kimi:browser-get-sessions"));
		if (sessions === null) throw new Error("browser-get-sessions: invalid response");
		return sessions;
	},
	browserSaveSessions: async (value) => {
		const sessions = asBrowserPanelSessions(value);
		if (sessions === null) throw new Error("browser-save-sessions: invalid state");
		await electron.ipcRenderer.invoke("kimi:browser-save-sessions", sessions);
	},
	browserSuspend: (browserId) => {
		const id = asBrowserId(browserId);
		if (id !== null) electron.ipcRenderer.send("kimi:browser-suspend", id);
	},
	getBrowserState: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id === null) return { ...EMPTY_BROWSER_STATE };
		const next = await electron.ipcRenderer.invoke("kimi:browser-get-state", id);
		return isBrowserState(next) ? next : { ...EMPTY_BROWSER_STATE };
	},
	browserNavigate: async (browserId, address) => {
		const request = asBrowserNavigateRequest({
			browserId,
			address
		});
		if (request === null) throw new Error("browser-navigate: invalid address");
		const next = await electron.ipcRenderer.invoke("kimi:browser-navigate", request);
		if (!isBrowserState(next)) throw new Error("browser-navigate: invalid response");
		return next;
	},
	browserOpenLocalFile: async (browserId, target, urlSuffix) => {
		const request = asBrowserNavigateRequest({
			browserId,
			address: target,
			...typeof urlSuffix === "string" && urlSuffix !== "" ? { urlSuffix } : {}
		});
		if (request === null) throw new Error("browser-open-local-file: invalid request");
		await electron.ipcRenderer.invoke("kimi:browser-open-local-file", request);
	},
	browserLocalPagesAllowed: async () => await electron.ipcRenderer.invoke("kimi:browser-local-pages-allowed") === true,
	browserTabCommand: async (request) => {
		if (!isBrowserTabCommand(request)) throw new Error("browser-tab-command: invalid request");
		const next = await electron.ipcRenderer.invoke("kimi:browser-tab-command", request);
		if (!isBrowserState(next)) throw new Error("browser-tab-command: invalid response");
		return next;
	},
	browserClone: async (sourceId, targetId) => {
		const request = asBrowserCloneRequest({
			sourceId,
			targetId
		});
		if (request === null) throw new Error("browser-clone: invalid browser ids");
		const next = await electron.ipcRenderer.invoke("kimi:browser-clone", request);
		if (!isBrowserState(next)) throw new Error("browser-clone: invalid response");
		return next;
	},
	browserBack: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id === null) return { ...EMPTY_BROWSER_STATE };
		const next = await electron.ipcRenderer.invoke("kimi:browser-back", id);
		return isBrowserState(next) ? next : { ...EMPTY_BROWSER_STATE };
	},
	browserForward: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id === null) return { ...EMPTY_BROWSER_STATE };
		const next = await electron.ipcRenderer.invoke("kimi:browser-forward", id);
		return isBrowserState(next) ? next : { ...EMPTY_BROWSER_STATE };
	},
	browserReload: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id === null) return { ...EMPTY_BROWSER_STATE };
		const next = await electron.ipcRenderer.invoke("kimi:browser-reload", id);
		return isBrowserState(next) ? next : { ...EMPTY_BROWSER_STATE };
	},
	browserFind: async (browserId, text, options) => {
		const request = browserValidators$7.find.Parse({
			browserId,
			text,
			forward: options?.forward,
			findNext: options?.findNext
		});
		if (request === null) throw new Error("browser-find: invalid request");
		await electron.ipcRenderer.invoke("kimi:browser-find", request);
	},
	browserStopFind: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id !== null) await electron.ipcRenderer.invoke("kimi:browser-stop-find", id);
	},
	browserPrint: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id === null) return false;
		return await electron.ipcRenderer.invoke("kimi:browser-print", id) === true;
	},
	browserZoom: async (browserId, action) => {
		const request = asBrowserZoomRequest({
			browserId,
			action
		});
		if (request === null) return { ...EMPTY_BROWSER_STATE };
		const next = await electron.ipcRenderer.invoke("kimi:browser-zoom", request);
		return isBrowserState(next) ? next : { ...EMPTY_BROWSER_STATE };
	},
	browserToggleDeviceMode: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id === null) return { ...EMPTY_BROWSER_STATE };
		const next = await electron.ipcRenderer.invoke("kimi:browser-toggle-device-mode", id);
		return isBrowserState(next) ? next : { ...EMPTY_BROWSER_STATE };
	},
	browserSetDeviceMode: async (browserId, request) => {
		const update = asBrowserDeviceModeUpdate({
			browserId,
			request: asBrowserDeviceModeRequest(request)
		});
		if (update === null) return { ...EMPTY_BROWSER_STATE };
		const next = await electron.ipcRenderer.invoke("kimi:browser-set-device-mode", update);
		return isBrowserState(next) ? next : { ...EMPTY_BROWSER_STATE };
	},
	browserPickAnnotation: async (browserId, options) => {
		const request = asBrowserAnnotationPickRequest({
			browserId,
			options: asBrowserAnnotationPickOptions(options)
		});
		if (request === null) throw new Error("Invalid annotation request");
		return electron.ipcRenderer.invoke("kimi:browser-pick-annotation", request);
	},
	browserCancelAnnotationPick: (browserId) => {
		const id = asBrowserId(browserId);
		if (id !== null) electron.ipcRenderer.send("kimi:browser-cancel-annotation-pick", id);
	},
	browserCompleteAnnotationCapture: async (id, action) => {
		if (!browserValidators$10.completion.Check({
			id,
			action
		})) throw new Error("Invalid annotation completion request");
		await electron.ipcRenderer.invoke("kimi:browser-complete-annotation-capture", {
			id,
			action
		});
	},
	browserCollectAnnotationAssets: async (retained) => {
		const ids = browserValidators$10.retainedAssets.Parse(retained);
		if (ids === null) throw new Error("Invalid annotation collection request");
		await electron.ipcRenderer.invoke("kimi:browser-collect-annotation-assets", ids);
	},
	browserReadAnnotationAsset: async (id) => {
		if (!browserValidators$10.referenceId.Check(id)) throw new Error("Invalid annotation asset id");
		return electron.ipcRenderer.invoke("kimi:browser-read-annotation-asset", id);
	},
	browserReadReceipt: async (sessionId, receiptId) => {
		if (!browserValidators$9.read.Check({
			sessionId,
			receiptId
		})) return null;
		const image = await electron.ipcRenderer.invoke("kimi:browser-read-receipt", {
			sessionId,
			receiptId
		});
		return browserValidators$9.image.Check(image) ? image : null;
	},
	browserDeleteReceipts: async (sessionId) => {
		if (browserValidators$9.sessionId.Check(sessionId)) await electron.ipcRenderer.invoke("kimi:browser-delete-receipts", sessionId);
	},
	browserCopyReceipts: async (sourceId, targetId) => {
		if (browserValidators$9.copy.Check({
			sourceId,
			targetId
		})) await electron.ipcRenderer.invoke("kimi:browser-copy-receipts", {
			sourceId,
			targetId
		});
	},
	browserShowAnnotation: async (id, ordinal, locate) => {
		if (!browserValidators$10.marker.Check({
			id,
			ordinal,
			locate
		})) throw new Error("Invalid annotation marker request");
		return electron.ipcRenderer.invoke("kimi:browser-show-annotation", {
			id,
			ordinal,
			locate
		});
	},
	browserHideAnnotation: (id) => {
		if (browserValidators$10.referenceId.Check(id)) electron.ipcRenderer.send("kimi:browser-hide-annotation", id);
	},
	browserCaptureScreenshot: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id === null) return false;
		return await electron.ipcRenderer.invoke("kimi:browser-capture-screenshot", id) === true;
	},
	browserFocusChrome: async () => {
		await electron.ipcRenderer.invoke("kimi:browser-focus-chrome");
	},
	browserGetSites: async () => {
		const raw = await electron.ipcRenderer.invoke("kimi:browser-get-sites");
		if (!Array.isArray(raw) || raw.length > 4e3) throw new Error("Invalid site settings response");
		return raw.map((value) => {
			const site = asBrowserSiteInfo(value);
			if (site === null) throw new Error("Invalid site settings response");
			return site;
		});
	},
	browserGetSite: async (url) => {
		const origin = browserSiteOrigin(url);
		if (origin === null) throw new Error("Invalid site");
		const site = asBrowserSiteInfo(await electron.ipcRenderer.invoke("kimi:browser-get-site", origin));
		if (site === null) throw new Error("Invalid site settings response");
		return site;
	},
	browserGetPermissionRequests: async () => {
		const value = await electron.ipcRenderer.invoke("kimi:browser-get-permission-requests");
		if (!browserValidators$6.BrowserPermissionRequestsSchema.Check(value)) throw new Error("Invalid browser permission requests");
		return value;
	},
	browserResolvePermissionRequest: async (decision) => {
		if (!browserValidators$6.BrowserPermissionDecisionSchema.Check(decision)) throw new Error("Invalid browser permission decision");
		return await electron.ipcRenderer.invoke("kimi:browser-resolve-permission-request", decision) === true;
	},
	onBrowserPermissionRequests: (cb) => {
		const listener = (_event, value) => {
			if (browserValidators$6.BrowserPermissionRequestsSchema.Check(value)) cb(value);
		};
		electron.ipcRenderer.on("kimi:browser-permission-requests", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-permission-requests", listener);
	},
	browserSetSitePermission: async (url, permission, setting) => {
		const update = asBrowserSitePermissionUpdate({
			origin: url,
			permission,
			setting
		});
		if (update === null) throw new Error("Invalid site permission");
		const site = asBrowserSiteInfo(await electron.ipcRenderer.invoke("kimi:browser-set-site-permission", update));
		if (site === null) throw new Error("Invalid site settings response");
		return site;
	},
	browserClearSiteData: async (url) => {
		const origin = browserSiteOrigin(url);
		if (origin === null) throw new Error("Invalid site");
		const site = asBrowserSiteInfo(await electron.ipcRenderer.invoke("kimi:browser-clear-site-data", origin));
		if (site === null) throw new Error("Invalid site settings response");
		return site;
	},
	browserGetSystemPermissionStates: async () => {
		const states = asBrowserSystemPermissionStates(await electron.ipcRenderer.invoke("kimi:browser-get-system-permission-states"));
		if (states === null) throw new Error("Invalid system permission states response");
		return states;
	},
	browserOpenSystemPermissionSettings: async (permission) => {
		if (!isBrowserSitePermission(permission)) throw new Error("Invalid system permission settings request");
		await electron.ipcRenderer.invoke("kimi:browser-open-system-permission-settings", permission);
	},
	browserGetData: async () => {
		const next = await electron.ipcRenderer.invoke("kimi:browser-get-data");
		if (!isBrowserDataSnapshot(next)) throw new Error("browser-get-data: invalid response");
		return next;
	},
	browserUpdatePreferences: async (patch) => {
		if (!isBrowserPreferencesPatch(patch)) throw new Error("browser-update-preferences: invalid request");
		const next = await electron.ipcRenderer.invoke("kimi:browser-update-preferences", patch);
		if (!isBrowserDataSnapshot(next)) throw new Error("browser-update-preferences: invalid response");
		return next;
	},
	browserClearHistory: async () => {
		const next = await electron.ipcRenderer.invoke("kimi:browser-clear-history");
		if (!isBrowserDataSnapshot(next)) throw new Error("browser-clear-history: invalid response");
		return next;
	},
	browserClearDownloads: async () => {
		const next = await electron.ipcRenderer.invoke("kimi:browser-clear-downloads");
		if (!isBrowserDataSnapshot(next)) throw new Error("browser-clear-downloads: invalid response");
		return next;
	},
	browserOpenDownload: async (id, action) => {
		const request = asBrowserDownloadAction({
			id,
			action
		});
		if (request === null) throw new Error("browser-open-download: invalid request");
		return await electron.ipcRenderer.invoke("kimi:browser-open-download", request) === true;
	},
	browserGetDownloads: async () => {
		const next = await electron.ipcRenderer.invoke("kimi:browser-get-downloads");
		if (!isBrowserDownloadItems(next)) throw new Error("browser-get-downloads: invalid response");
		return next;
	},
	browserRemoveDownload: async (id) => {
		if (!isBrowserDownloadId(id)) throw new Error("browser-remove-download: invalid request");
		return await electron.ipcRenderer.invoke("kimi:browser-remove-download", id) === true;
	},
	browserWatchDownloads: (watch) => {
		if (isBrowserDownloadsWatch(watch)) electron.ipcRenderer.send("kimi:browser-watch-downloads", watch);
	},
	onBrowserDownloads: (cb) => {
		const listener = (_event, value) => {
			if (isBrowserDownloadItems(value)) cb(value);
		};
		electron.ipcRenderer.on("kimi:browser-downloads", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-downloads", listener);
	},
	browserClearData: async (browserId) => {
		const id = asBrowserId(browserId);
		if (id === null) return { ...EMPTY_BROWSER_STATE };
		const next = await electron.ipcRenderer.invoke("kimi:browser-clear-data", id);
		return isBrowserState(next) ? next : { ...EMPTY_BROWSER_STATE };
	},
	browserSetBounds: (browserId, bounds) => {
		const request = asBrowserBoundsRequest({
			browserId,
			bounds
		});
		if (request !== null) electron.ipcRenderer.send("kimi:browser-set-bounds", request);
	},
	browserCaptureBackdrop: (browserId) => electron.ipcRenderer.invoke("kimi:browser-capture-backdrop", browserId),
	browserSetFocusEmulation: async (browserId, enabled) => {
		const request = asBrowserFocusEmulationRequest({
			browserId,
			enabled
		});
		if (request === null) throw new Error("Invalid focus emulation request");
		const next = await electron.ipcRenderer.invoke("kimi:browser-set-focus-emulation", request);
		if (!isBrowserState(next)) throw new Error("Invalid browser state");
		return next;
	},
	onBrowserControlOwnership: (cb) => {
		const listener = (_event, state) => {
			if (isBrowserControlOwnership(state)) cb(state);
		};
		electron.ipcRenderer.on("kimi:browser-control-ownership", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-control-ownership", listener);
	},
	browserSetControls: (config) => {
		if (isBrowserControlConfig(config)) electron.ipcRenderer.send("kimi:browser-set-controls", config);
	},
	browserSetVisible: (browserId, visible) => {
		const request = asBrowserVisibilityRequest({
			browserId,
			visible
		});
		if (request !== null) electron.ipcRenderer.send("kimi:browser-set-visible", request);
	},
	browserClose: (browserId) => {
		const id = asBrowserId(browserId);
		if (id !== null) electron.ipcRenderer.send("kimi:browser-close", id);
	},
	onBrowserOpenLinkRequested: (cb) => {
		const listener = (_event, payload) => {
			const request = browserValidators$7.openLink.Parse(payload);
			if (request !== null && /^(?:https?|file):\/\//i.test(request.url)) cb(request);
		};
		electron.ipcRenderer.on("kimi:browser-open-link-requested", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-open-link-requested", listener);
	},
	onBrowserAnnotationRequested: (cb) => {
		const listener = (_event, payload) => {
			const request = browserValidators$10.context.Parse(payload);
			if (request !== null) cb(request);
		};
		electron.ipcRenderer.on("kimi:browser-annotation-requested", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-annotation-requested", listener);
	},
	onBrowserState: (cb) => {
		const listener = (_event, payload) => {
			if (isBrowserStateEvent(payload)) cb(payload.browserId, payload.state);
		};
		electron.ipcRenderer.on("kimi:browser-state", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-state", listener);
	},
	onBrowserAutomationUiRequest: (cb) => {
		const listener = (_event, payload) => {
			if (isBrowserUiRequest(payload)) cb(payload);
		};
		electron.ipcRenderer.on("kimi:browser-automation-ui-request", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-automation-ui-request", listener);
	},
	browserAutomationUiRespond: (response) => {
		if (isBrowserUiResponse(response)) electron.ipcRenderer.send("kimi:browser-automation-ui-response", response);
	},
	browserOverlayOpenMenu: (request) => {
		if (asBrowserOverlayMenuRequest(request) !== null) electron.ipcRenderer.send("kimi:browser-overlay-open", request);
	},
	browserOverlayCloseMenu: (menuId) => {
		if (asBrowserOverlayMenuId(menuId) !== null) electron.ipcRenderer.send("kimi:browser-overlay-close", menuId);
	},
	onBrowserOverlayAction: (cb) => {
		const listener = (_event, payload) => {
			if (isBrowserOverlayAction(payload)) cb(payload);
		};
		electron.ipcRenderer.on("kimi:browser-overlay-action", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-overlay-action", listener);
	},
	onBrowserOverlayClosed: (cb) => {
		const listener = (_event, payload) => {
			if (isBrowserOverlayClosed(payload)) cb(payload);
		};
		electron.ipcRenderer.on("kimi:browser-overlay-closed", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-overlay-closed", listener);
	},
	browserOverlayOpenDialog: (request) => {
		if (asBrowserOverlayDialogRequest(request) !== null) electron.ipcRenderer.send("kimi:browser-overlay-dialog-open", request);
	},
	browserOverlayCloseDialog: (dialogId) => {
		if (asBrowserOverlayMenuId(dialogId) !== null) electron.ipcRenderer.send("kimi:browser-overlay-dialog-close", dialogId);
	},
	onBrowserOverlayDialogAction: (cb) => {
		const listener = (_event, payload) => {
			if (isBrowserOverlayDialogAction(payload)) cb(payload);
		};
		electron.ipcRenderer.on("kimi:browser-overlay-dialog-action", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-overlay-dialog-action", listener);
	},
	onBrowserOverlayDialogClosed: (cb) => {
		const listener = (_event, payload) => {
			if (isBrowserOverlayDialogClosed(payload)) cb(payload);
		};
		electron.ipcRenderer.on("kimi:browser-overlay-dialog-closed", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-overlay-dialog-closed", listener);
	},
	getPrPreviewState: async () => asPrPreviewState(await electron.ipcRenderer.invoke("kimi:pr-preview-get-state")),
	prPreviewStart: async (target) => {
		let payload;
		if (typeof target === "number") {
			if (!Number.isInteger(target) || target < 1 || target > 999999) throw new Error("pr-preview-start: invalid PR number");
			payload = target;
		} else if (target !== null && typeof target === "object" && target.kind === "pr") {
			if (typeof target.pr !== "number" || !Number.isInteger(target.pr) || target.pr < 1 || target.pr > 999999) throw new Error("pr-preview-start: invalid PR number");
			payload = {
				kind: "pr",
				pr: target.pr
			};
		} else if (target !== null && typeof target === "object" && target.kind === "ref") {
			if (typeof target.ref !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._\/-]{0,199}$/.test(target.ref) || target.ref.includes("..")) throw new Error("pr-preview-start: invalid ref");
			payload = {
				kind: "ref",
				ref: target.ref
			};
		} else throw new Error("pr-preview-start: invalid target");
		const state = asPrPreviewState(await electron.ipcRenderer.invoke("kimi:pr-preview-start", payload));
		if (state === null) throw new Error("pr-preview-start: invalid response from main process");
		return state;
	},
	prPreviewStop: async () => {
		const state = asPrPreviewState(await electron.ipcRenderer.invoke("kimi:pr-preview-stop"));
		if (state === null) throw new Error("pr-preview-stop: invalid response from main process");
		return state;
	},
	prPreviewCancel: async () => {
		const state = asPrPreviewState(await electron.ipcRenderer.invoke("kimi:pr-preview-cancel"));
		if (state === null) throw new Error("pr-preview-cancel: invalid response from main process");
		return state;
	},
	listPrPreviewRefs: async () => {
		return asPrPreviewRefList(await electron.ipcRenderer.invoke("kimi:pr-preview-list-refs")) ?? {
			prs: [],
			branches: []
		};
	},
	prPreviewCleanup: async () => {
		const removed = await electron.ipcRenderer.invoke("kimi:pr-preview-cleanup");
		return typeof removed === "number" && Number.isInteger(removed) && removed >= 0 ? removed : 0;
	},
	onPrPreviewEvent: (cb) => {
		const listener = (_event, payload) => {
			const state = asPrPreviewState(payload);
			if (state !== null) cb(state);
		};
		electron.ipcRenderer.on("kimi:pr-preview-event", listener);
		return () => electron.ipcRenderer.removeListener("kimi:pr-preview-event", listener);
	}
};
electron.contextBridge.exposeInMainWorld("kimiDesktop", api);
//#endregion
exports.api = api;
