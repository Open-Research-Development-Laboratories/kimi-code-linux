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
const pattern3 = /* @__PURE__ */ new RegExp("^[a-zA-Z-]{2,32}$", "u");
const pattern7 = /* @__PURE__ */ new RegExp("^[A-Za-z0-9:_.-]+$", "u");
const pattern8 = /* @__PURE__ */ new RegExp("(^preserveFocus$|^dismissible$|^dialogId$|^title$|^message$|^confirmLabel$|^cancelLabel$|^closeLabel$|^variant$|^loading$|^initialFocus$|^anchor$|^boundary$|^annotation$|^viewport$|^input$|^checkbox$|^preview$|^auxiliary$|^kind$|^requestId$)", "u");
const pattern9 = /* @__PURE__ */ new RegExp("^data:image\\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$", "u");
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
const check_34 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "capture" in value && "labels" in value && "locale" in value && check_35(value.labels) && typeof value.locale === "string" && pattern3.test(value.locale));
const check_35 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "annotation" in value && "classes" in value && "geometry" in value && "semantics" in value && "data" in value && "source" in value && "pageTitle" in value && "url" in value && "capturedAt" in value && "viewport" in value && "width" in value && "height" in value && "zoom" in value && "pixelRatio" in value && "size" in value && "position" in value && "copy" in value && "insert" in value && "more" in value && "less" in value && "items" in value && "item" in value && "base" in value && "interaction" in value && "responsive" in value && "theme" in value && "truncated" in value && "copied" in value && "copyFailed" in value && check_36(value.annotation) && check_36(value.classes) && check_36(value.geometry) && check_36(value.semantics) && check_36(value.data) && check_36(value.source) && check_36(value.pageTitle) && check_36(value.url) && check_36(value.capturedAt) && check_36(value.viewport) && check_36(value.width) && check_36(value.height) && check_36(value.zoom) && check_36(value.pixelRatio) && check_36(value.size) && check_36(value.position) && check_36(value.copy) && check_36(value.insert) && check_36(value.more) && check_36(value.less) && check_36(value.items) && check_36(value.item) && check_36(value.base) && check_36(value.interaction) && check_36(value.responsive) && check_36(value.theme) && check_36(value.truncated) && check_36(value.copied) && check_36(value.copyFailed));
const check_36 = ((value) => typeof value === "string" && IsMaxLength(value, 256));
const check_53 = ((value) => Number.isInteger(value) && (!(Number.isFinite(value) || typeof value === "bigint") || value <= 9007199254740991 && value >= 1));
const check_65 = ((value) => typeof value === "string" && IsMaxLength(value, 128) && IsMinLength(value, 1));
const check_68 = ((value) => typeof value === "string" && IsMaxLength(value, 1024));
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
const check_102 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "dialogId" in value && "title" in value && "confirmLabel" in value && "cancelLabel" in value && "closeLabel" in value && Object.getOwnPropertyNames(value).every((var_32, var_33) => pattern8.test(var_32) || false) && (value.preserveFocus === void 0 || !("preserveFocus" in value) || check_3(value.preserveFocus)) && (value.dismissible === void 0 || !("dismissible" in value) || check_3(value.dismissible)) && check_77(value.dialogId) && check_88(value.title) && (value.message === void 0 || !("message" in value) || check_5(value.message)) && check_65(value.confirmLabel) && check_65(value.cancelLabel) && check_65(value.closeLabel) && (value.variant === void 0 || !("variant" in value) || value.variant === "primary" || value.variant === "danger") && (value.loading === void 0 || !("loading" in value) || check_3(value.loading)) && (value.initialFocus === void 0 || !("initialFocus" in value) || value.initialFocus === "confirm" || value.initialFocus === "cancel") && (value.anchor === void 0 || !("anchor" in value) || check_103(value.anchor)) && (value.boundary === void 0 || !("boundary" in value) || check_103(value.boundary)) && (value.annotation === void 0 || !("annotation" in value) || true) && (value.viewport === void 0 || !("viewport" in value) || typeof value.viewport === "object" && value.viewport !== null && !Array.isArray(value.viewport) && "width" in value.viewport && "height" in value.viewport && Object.getOwnPropertyNames(value.viewport).length === 2 && check_105(value.viewport.width) && check_105(value.viewport.height)) && (value.input === void 0 || !("input" in value) || typeof value.input === "object" && value.input !== null && !Array.isArray(value.input) && "label" in value.input && "value" in value.input && check_36(value.input.label) && check_98(value.input.value) && (value.input.placeholder === void 0 || !("placeholder" in value.input) || check_36(value.input.placeholder)) && (value.input.readOnly === void 0 || !("readOnly" in value.input) || check_3(value.input.readOnly))) && (value.checkbox === void 0 || !("checkbox" in value) || typeof value.checkbox === "object" && value.checkbox !== null && !Array.isArray(value.checkbox) && "label" in value.checkbox && "checked" in value.checkbox && check_36(value.checkbox.label) && check_3(value.checkbox.checked) && (value.checkbox.disabled === void 0 || !("disabled" in value.checkbox) || check_3(value.checkbox.disabled))) && (value.preview === void 0 || !("preview" in value) || typeof value.preview === "object" && value.preview !== null && !Array.isArray(value.preview) && "src" in value.preview && "alt" in value.preview && typeof value.preview.src === "string" && IsMaxLength(value.preview.src, 4194304) && pattern9.test(value.preview.src) && check_68(value.preview.alt)) && (value.auxiliary === void 0 || !("auxiliary" in value) || typeof value.auxiliary === "object" && value.auxiliary !== null && !Array.isArray(value.auxiliary) && "label" in value.auxiliary && check_36(value.auxiliary.label) && (value.auxiliary.disabled === void 0 || !("disabled" in value.auxiliary) || check_3(value.auxiliary.disabled))) && (value.kind === void 0 || !("kind" in value) || true) && (value.requestId === void 0 || !("requestId" in value) || true));
const check_103 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "x" in value && "y" in value && "width" in value && "height" in value && check_104(value.x) && check_104(value.y) && check_104(value.width) && check_104(value.height));
const check_104 = ((value) => Number.isFinite(value) && value <= 32768 && value >= 0);
const check_105 = ((value) => Number.isFinite(value) && value <= 16384 && value >= 1);
const check_106 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "width" in value && "height" in value && check_53(value.requestId) && check_105(value.width) && check_105(value.height));
const check_107 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && check_53(value.requestId));
const check_108 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "kind" in value && typeof value.kind === "string" && value.kind === "dialog");
const check_109 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "itemId" in value && Object.getOwnPropertyNames(value).length === 2 && check_53(value.requestId) && check_77(value.itemId));
const check_110 = ((value) => typeof value === "object" && value !== null && !Array.isArray(value) && "requestId" in value && "reason" in value && Object.getOwnPropertyNames(value).length === 2 && check_53(value.requestId) && (value.reason === "dismiss" || value.reason === "escape"));
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
//#endregion
//#region src/shared/browser.ts
function asBrowserBounds(value) {
	const bounds = browserValidators$2.BrowserBoundsSchema.Parse(value);
	return bounds === null ? null : {
		x: Math.round(bounds.x),
		y: Math.round(bounds.y),
		width: Math.round(bounds.width),
		height: Math.round(bounds.height)
	};
}
const browserValidators$2 = {
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
	const details = browserValidators$1.DetailsInput.Parse(value);
	if (details === null) return null;
	const capture = parseBrowserCapture(details.capture);
	if (capture === null) return null;
	try {
		Intl.getCanonicalLocales(details.locale);
	} catch {
		return null;
	}
	const labels = browserValidators$1.BrowserAnnotationDetailLabelsSchema.Parse(details.labels);
	return labels === null ? null : {
		capture,
		locale: details.locale,
		labels
	};
}
const browserValidators$1 = {
	"DetailsInput": v21,
	"BrowserAnnotationDetailLabelsSchema": v22
};
//#endregion
//#region src/shared/browser-overlay.ts
function isBrowserOverlayConfig(value) {
	return browserValidators.MenuConfig.Check(value) || asBrowserOverlayDialogConfig(value) !== null;
}
function isBrowserOverlayShown(value) {
	return browserValidators.Shown.Check(value);
}
function asBrowserOverlayFormAction(value) {
	return browserValidators.FormAction.Parse(value);
}
function asBrowserOverlayDialogRequest(value) {
	const input = browserValidators.DialogInput.Parse(value);
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
function asBrowserOverlayRendered(value) {
	const rendered = browserValidators.Rendered.Parse(value);
	return rendered === null ? null : {
		requestId: rendered.requestId,
		width: Math.ceil(rendered.width),
		height: Math.ceil(rendered.height)
	};
}
function asBrowserOverlayVisibilityRequest(value) {
	return browserValidators.Visibility.Parse(value);
}
function asBrowserOverlayDialogConfig(value) {
	if (!browserValidators.DialogKind.Check(value)) return null;
	const visibility = asBrowserOverlayVisibilityRequest(value);
	const dialog = asBrowserOverlayDialogRequest(value);
	return visibility === null || dialog === null ? null : {
		...dialog,
		kind: "dialog",
		requestId: visibility.requestId
	};
}
function asBrowserOverlayActivateRequest(value) {
	return browserValidators.Activate.Parse(value);
}
function asBrowserOverlayDismissRequest(value) {
	return browserValidators.Dismiss.Parse(value);
}
const browserValidators = {
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
//#region src/main/browser-overlay-preload.ts
function onValidated(channel, validate, cb) {
	const listener = (_event, payload) => {
		if (validate(payload)) cb(payload);
	};
	electron.ipcRenderer.on(channel, listener);
	return () => electron.ipcRenderer.removeListener(channel, listener);
}
electron.contextBridge.exposeInMainWorld("kimiBrowserOverlay", {
	ready: () => electron.ipcRenderer.send("kimi:browser-overlay-ready"),
	rendered: (payload) => {
		const request = asBrowserOverlayRendered(payload);
		if (request !== null) electron.ipcRenderer.send("kimi:browser-overlay-rendered", request);
	},
	hidden: (payload) => {
		const request = asBrowserOverlayVisibilityRequest(payload);
		if (request !== null) electron.ipcRenderer.send("kimi:browser-overlay-hidden", request);
	},
	submitForm: (payload) => {
		const request = asBrowserOverlayFormAction(payload);
		if (request !== null) electron.ipcRenderer.send("kimi:browser-overlay-form-action", request);
	},
	activate: (payload) => {
		const request = asBrowserOverlayActivateRequest(payload);
		if (request !== null) electron.ipcRenderer.send("kimi:browser-overlay-activate", request);
	},
	dismiss: (payload) => {
		const request = asBrowserOverlayDismissRequest(payload);
		if (request !== null) electron.ipcRenderer.send("kimi:browser-overlay-dismiss", request);
	},
	onConfig: (cb) => {
		const listener = (_event, payload) => {
			if (isBrowserOverlayConfig(payload)) cb(payload);
		};
		electron.ipcRenderer.on("kimi:browser-overlay-config", listener);
		return () => electron.ipcRenderer.removeListener("kimi:browser-overlay-config", listener);
	},
	onShown: (cb) => onValidated("kimi:browser-overlay-shown", isBrowserOverlayShown, cb),
	onHide: (cb) => onValidated("kimi:browser-overlay-hide", (value) => asBrowserOverlayVisibilityRequest(value) !== null, cb)
});
//#endregion
