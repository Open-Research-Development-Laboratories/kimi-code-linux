const require_protocol = require("./protocol-r4z3gR8R.cjs");
let node_os = require("node:os");
let node_child_process = require("node:child_process");
let node_crypto = require("node:crypto");
//#region src/main/shell-env.ts
const PROBE_TIMEOUT_MS = 1e4;
const MAX_OUTPUT_BYTES = 4 * 1024 * 1024;
const DENY_EXACT = /* @__PURE__ */ new Set([
	"PWD",
	"OLDPWD",
	"SHLVL",
	"_",
	"TERM",
	"TERM_PROGRAM",
	"TERM_PROGRAM_VERSION",
	"TERM_SESSION_ID",
	"TERMINFO",
	"COLORTERM",
	"ZSH",
	"OH_MY_ZSH",
	"HISTFILE",
	"HISTSIZE",
	"SAVEHIST"
]);
const DENY_PREFIX = [
	/^ZSH_/,
	/^ITERM_/,
	/^BASH_FUNC_/,
	/^__CF/
];
const DENY_KIMI_EXACT = /* @__PURE__ */ new Set([
	"KIMI_CODE_PASSWORD",
	"KIMI_CODE_CUSTOM_HEADERS",
	"KIMI_BASE_URL",
	"KIMI_WEB_SEARCH_BASE_URL",
	"KIMI_WEB_FETCH_BASE_URL",
	"KIMI_CODE_CORS_ORIGINS",
	"KIMI_CODE_ALLOWED_HOSTS",
	"KIMI_CODE_DISABLE_HOST_CHECK",
	"KIMI_DISABLE_OAUTH_LOCK",
	"KIMI_SERVER_URL",
	"KIMI_RENDERER_DEV_URL",
	"KIMI_DESKTOP_NO_SHELL_ENV",
	"KIMI_PLUGIN_ROOT",
	"KIMI_WSL_CLIPBOARD_IMAGE_PATH"
]);
const DENY_KIMI_PATTERN = [/^KIMI_MODEL_/, /_API_KEY$/];
function isDenied(key) {
	if (DENY_EXACT.has(key) || DENY_PREFIX.some((re) => re.test(key))) return true;
	if (key.startsWith("KIMI_")) return DENY_KIMI_EXACT.has(key) || DENY_KIMI_PATTERN.some((re) => re.test(key));
	return false;
}
function parseShellEnvDump(stdout, mark) {
	const match = new RegExp(`${mark}(\\{.*\\})${mark}`, "s").exec(stdout);
	if (match === null || match[1] === void 0) return {};
	try {
		const parsed = JSON.parse(match[1]);
		if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
		return parsed;
	} catch {
		return {};
	}
}
function mergeShellEnv(target, shellEnv) {
	const applied = [];
	for (const [key, value] of Object.entries(shellEnv)) {
		if (key === "PATH") {
			if (mergePathEntries(target, value)) applied.push("PATH");
			continue;
		}
		if (isDenied(key) || target[key] !== void 0) continue;
		target[key] = value;
		applied.push(key);
	}
	return applied;
}
function mergePathEntries(target, shellPath) {
	const current = target["PATH"] ?? "";
	const seen = new Set(current.split(":").filter((entry) => entry.length > 0));
	const additions = [];
	for (const entry of shellPath.split(":")) {
		if (!entry.startsWith("/") || seen.has(entry)) continue;
		seen.add(entry);
		additions.push(entry);
	}
	if (additions.length === 0) return false;
	target["PATH"] = current.length === 0 ? additions.join(":") : `${current}:${additions.join(":")}`;
	return true;
}
function userShell() {
	const fromEnv = process.env["SHELL"]?.trim();
	if (fromEnv !== void 0 && fromEnv.length > 0) return fromEnv;
	try {
		const shell = (0, node_os.userInfo)().shell;
		return shell === null || shell.length === 0 ? void 0 : shell;
	} catch {
		return;
	}
}
function execShellEnvDump(shell, mark) {
	return new Promise((resolve, reject) => {
		const child = (0, node_child_process.spawn)(shell, [
			"-l",
			"-i",
			"-c",
			`"$KIMI_PROBE_BIN" -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`
		], {
			detached: true,
			stdio: [
				"ignore",
				"pipe",
				"ignore"
			],
			env: {
				...process.env,
				ELECTRON_RUN_AS_NODE: "1",
				ELECTRON_NO_ATTACH_CONSOLE: "1",
				KIMI_PROBE_BIN: process.execPath
			}
		});
		let out = "";
		let settled = false;
		const killGroup = () => {
			if (child.pid === void 0) return;
			try {
				process.kill(-child.pid, "SIGKILL");
			} catch {}
		};
		const settle = (fn) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			activeKill = void 0;
			fn();
		};
		const timer = setTimeout(() => {
			killGroup();
			settle(() => reject(/* @__PURE__ */ new Error(`shell env dump exceeded ${PROBE_TIMEOUT_MS}ms`)));
		}, PROBE_TIMEOUT_MS);
		activeKill = killGroup;
		child.stdout.setEncoding("utf8");
		child.stdout.on("data", (chunk) => {
			out += chunk;
			if (out.length > MAX_OUTPUT_BYTES) {
				killGroup();
				settle(() => reject(/* @__PURE__ */ new Error("shell env dump exceeded max output")));
			}
		});
		child.on("error", (error) => settle(() => reject(error)));
		child.on("close", () => {
			const env = parseShellEnvDump(out, mark);
			if (Object.keys(env).length > 0) settle(() => resolve(env));
			else settle(() => reject(/* @__PURE__ */ new Error("env mark missing from shell output")));
		});
	});
}
let activeKill;
function stopShellEnvProbe() {
	activeKill?.();
}
async function resolveShellEnv() {
	try {
		if (process.platform === "win32") return;
		const disabled = process.env["KIMI_DESKTOP_NO_SHELL_ENV"];
		if (disabled !== void 0 && disabled !== "" && disabled !== "0") {
			require_protocol.log.info("shell env probe disabled via KIMI_DESKTOP_NO_SHELL_ENV");
			return;
		}
		const shell = userShell();
		if (shell === void 0) {
			require_protocol.log.warn("shell env probe skipped: no resolvable user shell");
			return;
		}
		const shellEnv = await execShellEnvDump(shell, (0, node_crypto.randomUUID)().replaceAll("-", "").slice(0, 12));
		delete shellEnv["ELECTRON_RUN_AS_NODE"];
		delete shellEnv["ELECTRON_NO_ATTACH_CONSOLE"];
		delete shellEnv["KIMI_PROBE_BIN"];
		const applied = mergeShellEnv(process.env, shellEnv);
		if (applied.includes("KIMI_CODE_HOME")) {
			require_protocol.initMainLogging();
			require_protocol.log.info(`main log re-targeted to ${require_protocol.defaultMainLogPath()}`);
		}
		require_protocol.log.info(`shell env probe (${shell}) imported ${applied.length}: ${applied.join(", ")}`);
	} catch (error) {
		require_protocol.log.warn(`shell env probe failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}
let probePromise;
function startShellEnvProbe() {
	probePromise ??= resolveShellEnv();
	return probePromise;
}
//#endregion
//#region src/shared/identity.ts
const DESKTOP_PRODUCT_NAME = "kimi-code-desktop";
const DESKTOP_MSH_PLATFORM = "kimi_code_desktop";
const DESKTOP_UI_MODE = "desktop";
const DESKTOP_WINDOWS_APP_ID = "com.kimi.code.desktop";
const DESKTOP_WINDOWS_DEV_APP_ID = `${DESKTOP_WINDOWS_APP_ID}.dev`;
const DESKTOP_DISPLAY_NAME = "Kimi Code";
const DESKTOP_REPLY_STYLE_GUIDE = "Your text replies render as Markdown in the Kimi Code desktop app's chat interface — full Markdown is supported, including headings, tables, and math. Use Markdown that reads well there: short paragraphs, `-` bullets for lists, backticks for code, commands, paths, and identifiers, and fenced blocks for multi-line code; a table is fine when the content is genuinely tabular. Do not use emoji unless the user does first or asks for it. Default to prose; reach for a list only when the content is genuinely a set of items or steps. File paths render as clickable links that open a preview at the given line — when you point to a specific code location, cite it as a full workspace-relative path with a line number, like `path/to/file.ts:42`.";
//#endregion
//#region src/main/release-channel.ts
function windowsAppId(isPackaged, version) {
	if (!isPackaged) return DESKTOP_WINDOWS_DEV_APP_ID;
	return isPreviewVersion(version) ? `${DESKTOP_WINDOWS_APP_ID}.preview` : DESKTOP_WINDOWS_APP_ID;
}
function isCanaryVersion(version) {
	return version.includes("-canary.");
}
function isPreviewVersion(version) {
	return version.includes("-preview.");
}
function isDevCanaryOverride(isPackaged) {
	return !isPackaged && process.env["KIMI_DESKTOP_CANARY"] === "true";
}
function isCanaryDisplay(version, isPackaged) {
	return isCanaryVersion(version) || isDevCanaryOverride(isPackaged);
}
function isCanaryChannelEnabled(version, isPackaged) {
	return !isPackaged || isCanaryVersion(version);
}
function isScreenshotShortcutEnabled(version) {
	return !isCanaryVersion(version) && !isPreviewVersion(version);
}
//#endregion
Object.defineProperty(exports, "DESKTOP_DISPLAY_NAME", {
	enumerable: true,
	get: function() {
		return DESKTOP_DISPLAY_NAME;
	}
});
Object.defineProperty(exports, "DESKTOP_MSH_PLATFORM", {
	enumerable: true,
	get: function() {
		return DESKTOP_MSH_PLATFORM;
	}
});
Object.defineProperty(exports, "DESKTOP_PRODUCT_NAME", {
	enumerable: true,
	get: function() {
		return DESKTOP_PRODUCT_NAME;
	}
});
Object.defineProperty(exports, "DESKTOP_REPLY_STYLE_GUIDE", {
	enumerable: true,
	get: function() {
		return DESKTOP_REPLY_STYLE_GUIDE;
	}
});
Object.defineProperty(exports, "DESKTOP_UI_MODE", {
	enumerable: true,
	get: function() {
		return DESKTOP_UI_MODE;
	}
});
Object.defineProperty(exports, "isCanaryChannelEnabled", {
	enumerable: true,
	get: function() {
		return isCanaryChannelEnabled;
	}
});
Object.defineProperty(exports, "isCanaryDisplay", {
	enumerable: true,
	get: function() {
		return isCanaryDisplay;
	}
});
Object.defineProperty(exports, "isCanaryVersion", {
	enumerable: true,
	get: function() {
		return isCanaryVersion;
	}
});
Object.defineProperty(exports, "isPreviewVersion", {
	enumerable: true,
	get: function() {
		return isPreviewVersion;
	}
});
Object.defineProperty(exports, "isScreenshotShortcutEnabled", {
	enumerable: true,
	get: function() {
		return isScreenshotShortcutEnabled;
	}
});
Object.defineProperty(exports, "startShellEnvProbe", {
	enumerable: true,
	get: function() {
		return startShellEnvProbe;
	}
});
Object.defineProperty(exports, "stopShellEnvProbe", {
	enumerable: true,
	get: function() {
		return stopShellEnvProbe;
	}
});
Object.defineProperty(exports, "windowsAppId", {
	enumerable: true,
	get: function() {
		return windowsAppId;
	}
});
