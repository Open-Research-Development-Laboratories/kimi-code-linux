const NULL_LITERAL = "null";
const DELIMITERS = {
	comma: ",",
	tab: "	",
	pipe: "|"
};
const DEFAULT_DELIMITER = DELIMITERS.comma;
//#endregion
//#region src/shared/string-utils.ts
/**
* Trims surrounding ASCII spaces (U+0020) from a token.
*
* @remarks
* Token trimming removes spaces only: any other whitespace (NBSP, or tabs
* outside their delimiter role) is part of the token, so a host `trim()`
* that strips the full Unicode whitespace set must not be used here.
*/
function trimSpaces(value) {
	let start = 0;
	let end = value.length;
	while (start < end && value[start] === " ") start++;
	while (end > start && value[end - 1] === " ") end--;
	return start === 0 && end === value.length ? value : value.slice(start, end);
}
/**
* Escapes special characters in a string for encoding.
*
* @remarks
* Control characters outside `\n`, `\r`, `\t`, `\\`, and `"` are emitted as `\uXXXX`.
*/
function escapeString(value) {
	return value.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`).replace(/\n/g, `\\n`).replace(/\r/g, `\\r`).replace(/\t/g, `\\t`).replace(/[\u0000-\u001F]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
/**
* Unescapes a string by processing escape sequences.
*
* @remarks
* Lone surrogates in `\uXXXX` escapes are rejected.
*/
function unescapeString(value) {
	let unescaped = "";
	let i = 0;
	while (i < value.length) {
		if (value[i] === "\\") {
			if (i + 1 >= value.length) throw new SyntaxError("Invalid escape sequence: backslash at end of string");
			const next = value[i + 1];
			if (next === "n") {
				unescaped += "\n";
				i += 2;
				continue;
			}
			if (next === "t") {
				unescaped += "	";
				i += 2;
				continue;
			}
			if (next === "r") {
				unescaped += "\r";
				i += 2;
				continue;
			}
			if (next === "\\") {
				unescaped += "\\";
				i += 2;
				continue;
			}
			if (next === "\"") {
				unescaped += "\"";
				i += 2;
				continue;
			}
			if (next === "u") {
				if (i + 6 > value.length) throw new SyntaxError(`Invalid escape sequence: truncated \\u escape at "${value.slice(i, i + 6)}"`);
				const hex = value.slice(i + 2, i + 6);
				if (!/^[0-9a-f]{4}$/i.test(hex)) throw new SyntaxError(`Invalid escape sequence: \\u must be followed by 4 hex digits, got "${hex}"`);
				const codeUnit = Number.parseInt(hex, 16);
				if (codeUnit >= 55296 && codeUnit <= 57343) throw new SyntaxError(`Invalid escape sequence: \\u${hex} is a lone surrogate. Supplementary code points MUST appear as literal UTF-8`);
				unescaped += String.fromCodePoint(codeUnit);
				i += 6;
				continue;
			}
			throw new SyntaxError(`Invalid escape sequence: \\${next}`);
		}
		unescaped += value[i];
		i++;
	}
	return unescaped;
}
/** Finds the index of the closing double quote, accounting for escape sequences. */
function findClosingQuote(content, start) {
	let i = start + 1;
	while (i < content.length) {
		if (content[i] === "\\" && i + 1 < content.length) {
			i += 2;
			continue;
		}
		if (content[i] === "\"") return i;
		i++;
	}
	return -1;
}
/** Finds the index of a character outside of quoted sections. */
function findUnquotedChar(content, char, start = 0) {
	let inQuotes = false;
	let i = start;
	while (i < content.length) {
		if (content[i] === "\\" && i + 1 < content.length && inQuotes) {
			i += 2;
			continue;
		}
		if (content[i] === "\"") {
			inQuotes = !inQuotes;
			i++;
			continue;
		}
		if (content[i] === char && !inQuotes) return i;
		i++;
	}
	return -1;
}
//#endregion
//#region src/decode/errors.ts
/**
* Error thrown by the TOON decoder when input cannot be parsed.
*
* Extends `SyntaxError` so existing `instanceof SyntaxError` checks keep working.
* Adds structured location fields for programmatic consumers and richer CLI output.
*/
var ToonDecodeError = class extends SyntaxError {
	constructor(message, context) {
		const prefix = context?.line !== void 0 ? `Line ${context.line}: ` : "";
		super(prefix + message, context?.cause !== void 0 ? { cause: context.cause } : void 0);
		this.name = "ToonDecodeError";
		this.line = context?.line;
		this.source = context?.source;
	}
};
/**
* Runs `fn` and re-throws any non-`ToonDecodeError` `Error` as a `ToonDecodeError`
* with line context attached and the original error preserved as `cause`.
*
* Pure parser helpers don't know which line they're parsing; this wrapper is how
* the streaming decoder enriches their errors.
*/
function withLine(line, fn) {
	try {
		return fn();
	} catch (error) {
		if (error instanceof ToonDecodeError) throw error;
		if (error instanceof Error) throw new ToonDecodeError(error.message, {
			line: line.lineNumber,
			source: line.raw,
			cause: error
		});
		throw error;
	}
}
//#endregion
//#region src/decode/scanner.ts
const LEADING_WHITESPACE_PATTERN = /^[ \t]*/;
function createScanState() {
	return {
		lineNumber: 0,
		blankLines: []
	};
}
function parseLineIncremental(raw, state, indentSize, strict) {
	state.lineNumber++;
	const lineNumber = state.lineNumber;
	if (lineNumber === 1 && raw[0] === "﻿") raw = raw.slice(1);
	if (raw[raw.length - 1] === "\r") raw = raw.slice(0, -1);
	const leadingWhitespace = LEADING_WHITESPACE_PATTERN.exec(raw)[0];
	const firstTabIndex = leadingWhitespace.indexOf("	");
	const indent = strict && firstTabIndex !== -1 ? firstTabIndex : leadingWhitespace.length;
	const tabIndent = strict || firstTabIndex === -1 ? 0 : leadingWhitespace.split("	").length - 1;
	const content = trimTrailingSpaces(raw.slice(indent));
	if (firstTabIndex === -1 && content[0] === "#") return;
	const depth = computeDepthFromIndent(indent - tabIndent, indentSize) + tabIndent;
	if (!content) {
		state.blankLines.push({
			lineNumber,
			indent,
			depth
		});
		return;
	}
	if (strict) {
		if (firstTabIndex !== -1) throw new ToonDecodeError("Tabs are not allowed in indentation in strict mode", {
			line: lineNumber,
			source: raw
		});
		if (indent > 0 && indent % indentSize !== 0) throw new ToonDecodeError(`Indentation must be exact multiple of ${indentSize}, but found ${indent} spaces`, {
			line: lineNumber,
			source: raw
		});
	}
	return {
		raw,
		indent,
		content,
		depth,
		lineNumber
	};
}
function computeDepthFromIndent(indentSpaces, indentSize) {
	return Math.floor(indentSpaces / indentSize);
}
function trimTrailingSpaces(value) {
	let end = value.length;
	while (end > 0 && value[end - 1] === " ") end--;
	return end === value.length ? value : value.slice(0, end);
}
//#endregion
//#region src/decode/line-reader.ts
const FETCH_LINE = Symbol("fetch-line");
function createLineReader(context) {
	return {
		buffer: [],
		done: false,
		lastLine: void 0,
		scanState: createScanState(),
		indentSize: context.indentSize,
		strict: context.strict
	};
}
function* fillBuffer(reader) {
	while (reader.buffer.length === 0 && !reader.done) {
		const raw = yield FETCH_LINE;
		if (raw === void 0) {
			reader.done = true;
			return;
		}
		const parsedLine = parseLineIncremental(raw, reader.scanState, reader.indentSize, reader.strict);
		if (parsedLine !== void 0) reader.buffer.push(parsedLine);
	}
}
function* peekLine(reader) {
	yield* fillBuffer(reader);
	return reader.buffer[0];
}
function* readLine(reader) {
	yield* fillBuffer(reader);
	const line = reader.buffer[0];
	if (line !== void 0) {
		reader.buffer.shift();
		reader.lastLine = line;
	}
	return line;
}
function* driveSync(rawSource, rule) {
	const iterator = rawSource[Symbol.iterator]();
	let step = rule.next();
	while (!step.done) if (step.value === FETCH_LINE) {
		const result = iterator.next();
		step = rule.next(result.done ? void 0 : result.value);
	} else {
		yield step.value;
		step = rule.next();
	}
}
async function* driveAsync(rawSource, rule) {
	const iterator = Symbol.asyncIterator in rawSource ? rawSource[Symbol.asyncIterator]() : rawSource[Symbol.iterator]();
	let step = rule.next();
	while (!step.done) if (step.value === FETCH_LINE) {
		const result = await iterator.next();
		step = rule.next(result.done ? void 0 : result.value);
	} else {
		yield step.value;
		step = rule.next();
	}
}
//#endregion
//#region src/shared/literal-utils.ts
const NUMERIC_LITERAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?$/i;
function isBooleanOrNullLiteral(token) {
	return token === "true" || token === "false" || token === "null";
}
/**
* Checks if a token represents a valid numeric literal.
*
* @remarks
* Rejects numbers with leading zeros (except `"0"` itself or decimals like `"0.5"`).
*/
function isNumericLiteral(token) {
	if (!token) return false;
	if (!NUMERIC_LITERAL_PATTERN.test(token)) return false;
	const numericValue = Number(token);
	return !Number.isNaN(numericValue) && Number.isFinite(numericValue);
}
//#endregion
//#region src/decode/parser.ts
/**
* Detects and parses an array-header line into a typed result, staying free of
* strict-mode policy: callers decide how to treat `invalid` and `strictError`.
*/
function parseArrayHeaderLine(content, defaultDelimiter) {
	const trimmedToken = content.trimStart();
	let bracketStart = -1;
	if (trimmedToken.startsWith("\"")) {
		const closingQuoteIndex = findClosingQuote(trimmedToken, 0);
		if (closingQuoteIndex === -1) return { kind: "notHeader" };
		if (!trimmedToken.slice(closingQuoteIndex + 1).startsWith("[")) return { kind: "notHeader" };
		const keyEndIndex = content.length - trimmedToken.length + closingQuoteIndex + 1;
		bracketStart = content.indexOf("[", keyEndIndex);
	} else bracketStart = findUnquotedChar(content, "[");
	if (bracketStart === -1) return { kind: "notHeader" };
	const firstColonIndex = findUnquotedChar(content, ":");
	if (firstColonIndex !== -1 && firstColonIndex < bracketStart) return { kind: "notHeader" };
	const bracketEnd = findUnquotedChar(content, "]", bracketStart);
	if (bracketEnd === -1) return { kind: "notHeader" };
	let colonIndex = bracketEnd + 1;
	let braceEnd = colonIndex;
	const braceStart = findUnquotedChar(content, "{", bracketEnd);
	if (braceStart !== -1 && braceStart < findUnquotedChar(content, ":", bracketEnd)) {
		const gapBeforeBrace = content.slice(bracketEnd + 1, braceStart);
		if (gapBeforeBrace !== "") {
			const trimmedGap = gapBeforeBrace.trim();
			return {
				kind: "invalid",
				reason: trimmedGap === "" ? `Unexpected whitespace between bracket segment and field list` : `Unexpected content "${trimmedGap}" between bracket segment and field list`
			};
		}
		const foundBraceEnd = findMatchingBrace(content, braceStart);
		if (foundBraceEnd !== -1) braceEnd = foundBraceEnd + 1;
	}
	colonIndex = findUnquotedChar(content, ":", Math.max(bracketEnd, braceEnd));
	if (colonIndex === -1) return { kind: "notHeader" };
	const gapStart = Math.max(bracketEnd + 1, braceEnd);
	const gapBeforeColon = content.slice(gapStart, colonIndex);
	if (gapBeforeColon !== "") {
		const trimmedGap = gapBeforeColon.trim();
		return {
			kind: "invalid",
			reason: trimmedGap === "" ? `Unexpected whitespace between bracket segment and colon` : `Unexpected content "${trimmedGap}" between bracket segment and colon`
		};
	}
	let key;
	if (bracketStart > 0) {
		const rawKey = content.slice(0, bracketStart);
		if (rawKey !== rawKey.trimEnd()) return {
			kind: "invalid",
			reason: "Unexpected whitespace between key and bracket segment"
		};
		key = rawKey.startsWith("\"") ? parseStringLiteral(rawKey) : rawKey;
	}
	const afterColon = trimSpaces(content.slice(colonIndex + 1));
	const bracketContent = content.slice(bracketStart + 1, bracketEnd);
	let parsedBracket;
	try {
		parsedBracket = parseBracketSegment(bracketContent, defaultDelimiter);
	} catch (error) {
		return {
			kind: "invalid",
			reason: error.message
		};
	}
	const { length, delimiter, keyed } = parsedBracket;
	let fields;
	if (braceStart !== -1 && braceStart < colonIndex) {
		const foundBraceEnd = findMatchingBrace(content, braceStart);
		if (foundBraceEnd !== -1 && foundBraceEnd < colonIndex) {
			const fieldsContent = content.slice(braceStart + 1, foundBraceEnd);
			const mismatchedDelimiter = findUnquotedMismatchedDelimiter(fieldsContent, delimiter);
			if (mismatchedDelimiter !== void 0) return {
				kind: "invalid",
				reason: `Header delimiter mismatch: bracket declares "${formatDelimiter(delimiter)}" but field list contains unquoted "${formatDelimiter(mismatchedDelimiter)}"`
			};
			try {
				fields = parseFieldEntries(fieldsContent, delimiter);
			} catch (error) {
				return {
					kind: "invalid",
					reason: error.message
				};
			}
		}
	}
	const duplicateFieldName = fields ? findDuplicateFieldName(fields) : void 0;
	const duplicateReason = duplicateFieldName ? `Duplicate field name "${duplicateFieldName}" in field list` : void 0;
	if (keyed && !fields) return {
		kind: "invalid",
		reason: "Keyed header requires a field list"
	};
	if (fields && afterColon) return {
		kind: "invalid",
		reason: duplicateReason ?? "Unexpected content after fields-bearing header colon"
	};
	return {
		kind: "header",
		header: {
			key,
			length,
			delimiter,
			fields,
			keyed
		},
		inlineValues: afterColon || void 0,
		strictError: duplicateReason
	};
}
const BRACKET_LENGTH_PATTERN = /^(?:0|[1-9]\d*)$/;
function parseBracketSegment(seg, defaultDelimiter) {
	let content = seg;
	let delimiter = defaultDelimiter;
	if (content.endsWith("	")) {
		delimiter = DELIMITERS.tab;
		content = content.slice(0, -1);
	} else if (content.endsWith("|")) {
		delimiter = DELIMITERS.pipe;
		content = content.slice(0, -1);
	}
	let keyed = false;
	if (content.endsWith(":")) {
		keyed = true;
		content = content.slice(0, -1);
	}
	if (!BRACKET_LENGTH_PATTERN.test(content)) throw new SyntaxError(`Invalid array length: "${seg}" (expected non-negative integer with no leading zeros)`);
	return {
		length: Number.parseInt(content, 10),
		delimiter,
		keyed
	};
}
/**
* Parses the content of a field list into field entries, recursively
* descending into nested field groups (`field{sub1,sub2}`).
*
* @remarks
* Throws on empty segments, empty names, unmatched braces, and content
* after a nested group's closing brace; callers decide strict fallthrough.
*/
function parseFieldEntries(fieldsContent, delimiter) {
	return splitFieldEntries(fieldsContent, delimiter).map((entry) => {
		const trimmedEntry = trimSpaces(entry);
		if (!trimmedEntry) throw new SyntaxError("Empty field name in field list");
		const groupStart = findUnquotedChar(trimmedEntry, "{");
		if (groupStart === -1) return { name: parseStringLiteral(trimmedEntry) };
		const namePart = trimSpaces(trimmedEntry.slice(0, groupStart));
		if (!namePart) throw new SyntaxError("Missing field name before nested field group");
		const groupEnd = findMatchingBrace(trimmedEntry, groupStart);
		if (groupEnd === -1) throw new SyntaxError("Unmatched brace in field list");
		if (groupEnd !== trimmedEntry.length - 1) throw new SyntaxError("Unexpected content after nested field group");
		const children = parseFieldEntries(trimmedEntry.slice(groupStart + 1, groupEnd), delimiter);
		return {
			name: parseStringLiteral(namePart),
			children
		};
	});
}
/**
* Splits a field list on the active delimiter at brace depth zero,
* respecting quoted names and escape sequences.
*/
function splitFieldEntries(content, delimiter) {
	const entries = [];
	let entryBuffer = "";
	let inQuotes = false;
	let braceDepth = 0;
	let i = 0;
	while (i < content.length) {
		const char = content[i];
		if (char === "\\" && i + 1 < content.length && inQuotes) {
			entryBuffer += char + content[i + 1];
			i += 2;
			continue;
		}
		if (char === "\"") {
			inQuotes = !inQuotes;
			entryBuffer += char;
			i++;
			continue;
		}
		if (!inQuotes) {
			if (char === "{") braceDepth++;
			else if (char === "}") braceDepth--;
			else if (char === delimiter && braceDepth === 0) {
				entries.push(entryBuffer);
				entryBuffer = "";
				i++;
				continue;
			}
		}
		entryBuffer += char;
		i++;
	}
	entries.push(entryBuffer);
	return entries;
}
/**
* Finds the index of the closing brace matching the opening brace at
* `braceStart`, ignoring braces inside quoted names.
*/
function findMatchingBrace(content, braceStart) {
	let inQuotes = false;
	let braceDepth = 0;
	let i = braceStart;
	while (i < content.length) {
		const char = content[i];
		if (char === "\\" && i + 1 < content.length && inQuotes) {
			i += 2;
			continue;
		}
		if (char === "\"") {
			inQuotes = !inQuotes;
			i++;
			continue;
		}
		if (!inQuotes) {
			if (char === "{") braceDepth++;
			else if (char === "}") {
				braceDepth--;
				if (braceDepth === 0) return i;
			}
		}
		i++;
	}
	return -1;
}
function findDuplicateFieldName(fields) {
	const seenNames = /* @__PURE__ */ new Set();
	for (const field of fields) {
		if (seenNames.has(field.name)) return field.name;
		seenNames.add(field.name);
		if (field.children) {
			const nestedDuplicate = findDuplicateFieldName(field.children);
			if (nestedDuplicate !== void 0) return nestedDuplicate;
		}
	}
}
/**
* Counts the leaf fields of a field list: the number of cells each row
* carries, via a depth-first walk of nested field groups.
*/
function countLeafFields(fields) {
	let leafCount = 0;
	for (const field of fields) leafCount += field.children ? countLeafFields(field.children) : 1;
	return leafCount;
}
const DELIMITER_CANDIDATES = [
	",",
	"	",
	"|"
];
function findUnquotedMismatchedDelimiter(content, activeDelimiter) {
	for (const candidate of DELIMITER_CANDIDATES) {
		if (candidate === activeDelimiter) continue;
		if (findUnquotedChar(content, candidate) !== -1) return candidate;
	}
}
function formatDelimiter(delimiter) {
	if (delimiter === "	") return "\\t";
	return delimiter;
}
/** Parses a delimited string into values, respecting quoted strings and escape sequences. */
function parseDelimitedValues(input, delimiter) {
	const values = [];
	let valueBuffer = "";
	let inQuotes = false;
	let i = 0;
	while (i < input.length) {
		const char = input[i];
		if (char === "\\" && i + 1 < input.length && inQuotes) {
			valueBuffer += char + input[i + 1];
			i += 2;
			continue;
		}
		if (char === "\"") {
			inQuotes = !inQuotes;
			valueBuffer += char;
			i++;
			continue;
		}
		if (char === delimiter && !inQuotes) {
			values.push(trimSpaces(valueBuffer));
			valueBuffer = "";
			i++;
			continue;
		}
		valueBuffer += char;
		i++;
	}
	if (valueBuffer || values.length > 0) values.push(trimSpaces(valueBuffer));
	return values;
}
function mapRowValuesToPrimitives(values) {
	return values.map((v) => parsePrimitiveToken(v));
}
function parsePrimitiveToken(token) {
	const trimmedToken = trimSpaces(token);
	if (!trimmedToken) return "";
	if (trimmedToken.startsWith("\"")) return parseStringLiteral(trimmedToken);
	if (isBooleanOrNullLiteral(trimmedToken)) {
		if (trimmedToken === "true") return true;
		if (trimmedToken === "false") return false;
		if (trimmedToken === "null") return null;
	}
	if (isNumericLiteral(trimmedToken)) {
		const parsedNumber = Number.parseFloat(trimmedToken);
		return Object.is(parsedNumber, -0) ? 0 : parsedNumber;
	}
	return trimmedToken;
}
function parseStringLiteral(token) {
	const trimmedToken = trimSpaces(token);
	if (trimmedToken.startsWith("\"")) {
		const closingQuoteIndex = findClosingQuote(trimmedToken, 0);
		if (closingQuoteIndex === -1) throw new SyntaxError("Unterminated string: missing closing quote");
		if (closingQuoteIndex !== trimmedToken.length - 1) throw new SyntaxError("Unexpected characters after closing quote");
		return unescapeString(trimmedToken.slice(1, closingQuoteIndex));
	}
	return trimmedToken;
}
function parseUnquotedKey(content, start) {
	const colonIndex = findUnquotedChar(content, ":", start);
	if (colonIndex === -1) throw new SyntaxError("Missing colon after key");
	return {
		key: trimSpaces(content.slice(start, colonIndex)),
		end: colonIndex + 1
	};
}
function parseQuotedKey(content, start) {
	const closingQuoteIndex = findClosingQuote(content, start);
	if (closingQuoteIndex === -1) throw new SyntaxError("Unterminated quoted key");
	const key = unescapeString(content.slice(start + 1, closingQuoteIndex));
	let parsePosition = closingQuoteIndex + 1;
	if (parsePosition >= content.length || content[parsePosition] !== ":") throw new SyntaxError("Missing colon after key");
	parsePosition++;
	return {
		key,
		end: parsePosition
	};
}
function parseKeyToken(content, start) {
	return content[start] === "\"" ? parseQuotedKey(content, start) : parseUnquotedKey(content, start);
}
function isArrayHeaderContent(content) {
	return content.trim().startsWith("[") && findUnquotedChar(content, ":") !== -1;
}
function isKeyValueContent(content) {
	return findUnquotedChar(content, ":") !== -1;
}
//#endregion
//#region src/decode/validation.ts
function assertExpectedCount(actual, expected, itemType, options, line) {
	if (options.strict && actual !== expected) throw new ToonDecodeError(`Expected ${expected} ${itemType}, but got ${actual}`, {
		line: line.lineNumber,
		source: line.raw
	});
}
function validateNoExtraListItems(nextLine, itemDepth, expectedCount) {
	if (nextLine?.depth === itemDepth && nextLine.content.startsWith("- ")) throw new ToonDecodeError(`Expected ${expectedCount} list-form items, but found more`, {
		line: nextLine.lineNumber,
		source: nextLine.raw
	});
}
function validateNoExtraTabularRows(nextLine, rowDepth, header) {
	if (nextLine?.depth === rowDepth && !nextLine.content.startsWith("- ") && isDataRow(nextLine.content, header.delimiter)) throw new ToonDecodeError(`Expected ${header.length} tabular rows, but found more`, {
		line: nextLine.lineNumber,
		source: nextLine.raw
	});
}
function validateNoBlankLinesInRange(startLine, endLine, blankLines, strict, context) {
	if (!strict) return;
	const firstBlank = blankLines.find((blank) => blank.lineNumber > startLine && blank.lineNumber < endLine);
	if (firstBlank) throw new ToonDecodeError(`Blank lines inside ${context} are not allowed in strict mode`, { line: firstBlank.lineNumber });
}
/** Checks if a line is a data row (vs a key-value pair) in a tabular array. */
function isDataRow(content, delimiter) {
	const colonPos = findUnquotedChar(content, ":");
	const delimiterPos = findUnquotedChar(content, delimiter);
	if (colonPos === -1) return true;
	if (delimiterPos !== -1 && delimiterPos < colonPos) return true;
	return false;
}
//#endregion
//#region src/decode/decoders.ts
function resolveContext(options) {
	return {
		indentSize: options?.indentSize ?? options?.indent ?? 2,
		strict: options?.strict ?? true
	};
}
function decodeStreamSync$1(source, options) {
	const resolvedOptions = resolveContext(options);
	return driveSync(source, decodeDocument(createLineReader(resolvedOptions), resolvedOptions));
}
function decodeStream$1(source, options) {
	const resolvedOptions = resolveContext(options);
	return driveAsync(source, decodeDocument(createLineReader(resolvedOptions), resolvedOptions));
}
function* decodeDocument(reader, options) {
	const first = yield* peekLine(reader);
	if (!first) {
		yield { type: "startObject" };
		yield { type: "endObject" };
		return;
	}
	if (trimSpaces(first.content) === "[]") {
		yield* readLine(reader);
		yield {
			type: "startArray",
			length: 0
		};
		yield { type: "endArray" };
		yield* assertFullyConsumed(reader, options.strict);
		return;
	}
	if (isArrayHeaderContent(first.content)) {
		const headerInfo = withLine(first, () => resolveArrayHeader(parseArrayHeaderLine(first.content, DEFAULT_DELIMITER), options.strict));
		if (headerInfo) {
			yield* readLine(reader);
			yield* decodeArrayFromHeader(headerInfo.header, headerInfo.inlineValues, reader, 0, options, first);
			yield* assertFullyConsumed(reader, options.strict);
			return;
		}
	}
	yield* readLine(reader);
	const following = yield* peekLine(reader);
	if (!(following !== void 0) && !isKeyValueLine(first)) {
		yield {
			type: "primitive",
			value: withLine(first, () => parsePrimitiveToken(first.content))
		};
		return;
	}
	if (!isKeyValueLine(first) && following?.depth === 0) throw new ToonDecodeError("Top-level document must start with a key-value or array-header line", {
		line: first.lineNumber,
		source: first.raw
	});
	const rootSeenKeys = options.strict ? /* @__PURE__ */ new Set() : void 0;
	yield { type: "startObject" };
	yield* decodeKeyValue(first, reader, 0, options, rootSeenKeys);
	while (true) {
		const line = yield* peekLine(reader);
		if (!line) break;
		if (line.depth !== 0) {
			if (options.strict) throw overIndentedLineError(line, 0);
			assertNotScalarLine(line);
			yield* readLine(reader);
			continue;
		}
		yield* readLine(reader);
		yield* decodeKeyValue(line, reader, 0, options, rootSeenKeys);
	}
	yield { type: "endObject" };
}
function assertNoDepthJump(firstNestedLine, parentDepth, strict) {
	if (strict && firstNestedLine.depth > parentDepth + 1) throw new ToonDecodeError(`Indentation depth jump: expected depth ${parentDepth + 1}, but found ${firstNestedLine.depth}`, {
		line: firstNestedLine.lineNumber,
		source: firstNestedLine.raw
	});
}
function overIndentedLineError(line, expectedDepth) {
	return new ToonDecodeError(`Over-indented line: expected depth ${expectedDepth}, but found ${line.depth}`, {
		line: line.lineNumber,
		source: line.raw
	});
}
function assertNotScalarLine(line) {
	if (line.content.startsWith("- ") || line.content === "-" || findUnquotedChar(line.content, ":") !== -1) return;
	throw new ToonDecodeError("Unexpected bare token line outside root primitive position", {
		line: line.lineNumber,
		source: line.raw
	});
}
function keylessKeyedError(line) {
	return new ToonDecodeError("Keyless keyed header is only valid at the document root", {
		line: line.lineNumber,
		source: line.raw
	});
}
function keylessHeaderError(line) {
	return new ToonDecodeError("Keyless array header is only valid at the document root or as a list item", {
		line: line.lineNumber,
		source: line.raw
	});
}
function keylessFieldsHeaderError(line) {
	return new ToonDecodeError("Keyless header with a field list is only valid at the document root", {
		line: line.lineNumber,
		source: line.raw
	});
}
function* assertFullyConsumed(reader, strict) {
	if (!strict) return;
	const line = yield* peekLine(reader);
	if (line) throw new ToonDecodeError("Unexpected content after the document root", {
		line: line.lineNumber,
		source: line.raw
	});
}
function assertNoDuplicateKey(key, line, seenKeys) {
	if (!seenKeys) return;
	if (seenKeys.has(key)) throw new ToonDecodeError(`Duplicate sibling key "${key}"`, {
		line: line.lineNumber,
		source: line.raw
	});
	seenKeys.add(key);
}
function* decodeKeyValue(line, reader, baseDepth, options, seenKeys) {
	const content = line.content;
	const arrayHeader = withLine(line, () => resolveArrayHeader(parseArrayHeaderLine(content, DEFAULT_DELIMITER), options.strict));
	if (arrayHeader && arrayHeader.header.key !== void 0) {
		assertNoDuplicateKey(arrayHeader.header.key, line, seenKeys);
		yield {
			type: "key",
			key: arrayHeader.header.key
		};
		yield* decodeArrayFromHeader(arrayHeader.header, arrayHeader.inlineValues, reader, baseDepth, options, line);
		return;
	}
	if (arrayHeader && arrayHeader.header.key === void 0 && options.strict) throw arrayHeader.header.keyed ? keylessKeyedError(line) : keylessHeaderError(line);
	const { key, end } = withLine(line, () => parseKeyToken(content, 0));
	const rest = trimSpaces(content.slice(end));
	assertNoDuplicateKey(key, line, seenKeys);
	yield {
		type: "key",
		key
	};
	if (!rest) {
		const nextLine = yield* peekLine(reader);
		if (nextLine && nextLine.depth > baseDepth) {
			assertNoDepthJump(nextLine, baseDepth, options.strict);
			yield { type: "startObject" };
			yield* decodeObjectFields(reader, baseDepth + 1, options);
			yield { type: "endObject" };
			return;
		}
		yield { type: "startObject" };
		yield { type: "endObject" };
		return;
	}
	if (rest === "[]") {
		yield {
			type: "startArray",
			length: 0
		};
		yield { type: "endArray" };
		return;
	}
	yield {
		type: "primitive",
		value: withLine(line, () => parsePrimitiveToken(rest))
	};
}
function* decodeObjectFields(reader, baseDepth, options) {
	let computedDepth;
	const seenKeys = options.strict ? /* @__PURE__ */ new Set() : void 0;
	while (true) {
		const line = yield* peekLine(reader);
		if (!line || line.depth < baseDepth) break;
		if (computedDepth === void 0 && line.depth >= baseDepth) computedDepth = line.depth;
		if (line.depth === computedDepth) {
			yield* readLine(reader);
			yield* decodeKeyValue(line, reader, computedDepth, options, seenKeys);
		} else if (computedDepth !== void 0 && line.depth > computedDepth) {
			if (options.strict) throw overIndentedLineError(line, computedDepth);
			assertNotScalarLine(line);
			yield* readLine(reader);
		} else break;
	}
}
function* decodeArrayFromHeader(header, inlineValues, reader, baseDepth, options, headerLine) {
	if (header.keyed) {
		yield* decodeKeyedObject(header, reader, baseDepth, options, headerLine);
		return;
	}
	yield {
		type: "startArray",
		length: header.length
	};
	if (inlineValues) {
		yield* decodeInlinePrimitiveArray(header, inlineValues, options, headerLine);
		yield { type: "endArray" };
		return;
	}
	if (header.fields && header.fields.length > 0) {
		yield* decodeTabularArray(header, reader, baseDepth, options, headerLine);
		yield { type: "endArray" };
		return;
	}
	yield* decodeListArray(header, reader, baseDepth, options, headerLine);
	yield { type: "endArray" };
}
function* decodeInlinePrimitiveArray(header, inlineValues, options, headerLine) {
	if (!trimSpaces(inlineValues)) {
		assertExpectedCount(0, header.length, "inline-form values", options, headerLine);
		return;
	}
	const values = withLine(headerLine, () => parseDelimitedValues(inlineValues, header.delimiter));
	const primitives = withLine(headerLine, () => mapRowValuesToPrimitives(values));
	assertExpectedCount(primitives.length, header.length, "inline-form values", options, headerLine);
	for (const primitive of primitives) yield {
		type: "primitive",
		value: primitive
	};
}
function* decodeKeyedObject(header, reader, baseDepth, options, headerLine) {
	const entryDepth = baseDepth + 1;
	const leafFieldCount = countLeafFields(header.fields);
	const seenEntryKeys = options.strict ? /* @__PURE__ */ new Set() : void 0;
	let entryCount = 0;
	let startLine;
	let endLine;
	let lastEntryLine = headerLine;
	yield { type: "startObject" };
	while (true) {
		const line = yield* peekLine(reader);
		if (!line || line.depth <= baseDepth) break;
		if (line.depth > entryDepth) {
			if (options.strict) throw new ToonDecodeError("Unexpected indentation inside keyed tabular object", {
				line: line.lineNumber,
				source: line.raw
			});
			yield* readLine(reader);
			continue;
		}
		if (findUnquotedChar(line.content, ":") === -1) {
			if (options.strict) throw new ToonDecodeError("Expected entry row inside keyed tabular object", {
				line: line.lineNumber,
				source: line.raw
			});
			yield* readLine(reader);
			continue;
		}
		yield* readLine(reader);
		if (startLine === void 0) startLine = line.lineNumber;
		endLine = line.lineNumber;
		lastEntryLine = line;
		const { key, end } = withLine(line, () => parseKeyToken(line.content, 0));
		assertNoDuplicateKey(key, line, seenEntryKeys);
		yield {
			type: "key",
			key
		};
		const cellsContent = trimSpaces(line.content.slice(end));
		const values = cellsContent === "" ? [] : withLine(line, () => parseDelimitedValues(cellsContent, header.delimiter));
		assertExpectedCount(values.length, leafFieldCount, "keyed entry cells", options, line);
		const primitives = withLine(line, () => mapRowValuesToPrimitives(values));
		yield* yieldObjectFromFields(header.fields, primitives);
		entryCount++;
	}
	assertExpectedCount(entryCount, header.length, "keyed entries", options, lastEntryLine);
	if (options.strict && startLine !== void 0 && endLine !== void 0) validateNoBlankLinesInRange(startLine, endLine, reader.scanState.blankLines, options.strict, "keyed tabular object");
	yield { type: "endObject" };
}
function* decodeTabularArray(header, reader, baseDepth, options, headerLine) {
	const rowDepth = baseDepth + 1;
	let rowCount = 0;
	let startLine;
	let endLine;
	let lastRowLine = headerLine;
	while (!options.strict || rowCount < header.length) {
		const line = yield* peekLine(reader);
		if (!line || line.depth < rowDepth) break;
		if (line.depth === rowDepth) {
			if (!isDataRow(line.content, header.delimiter)) break;
			if (startLine === void 0) startLine = line.lineNumber;
			endLine = line.lineNumber;
			lastRowLine = line;
			yield* readLine(reader);
			const values = withLine(line, () => parseDelimitedValues(line.content, header.delimiter));
			assertExpectedCount(values.length, countLeafFields(header.fields), "tabular row values", options, line);
			const primitives = withLine(line, () => mapRowValuesToPrimitives(values));
			yield* yieldObjectFromFields(header.fields, primitives);
			rowCount++;
		} else break;
	}
	assertExpectedCount(rowCount, header.length, "tabular rows", options, lastRowLine);
	if (options.strict && startLine !== void 0 && endLine !== void 0) validateNoBlankLinesInRange(startLine, endLine, reader.scanState.blankLines, options.strict, "tabular array");
	if (options.strict) validateNoExtraTabularRows(yield* peekLine(reader), rowDepth, header);
}
function* decodeListArray(header, reader, baseDepth, options, headerLine) {
	const itemDepth = baseDepth + 1;
	let itemCount = 0;
	let startLine;
	let endLine;
	let lastItemLine = headerLine;
	while (!options.strict || itemCount < header.length) {
		const line = yield* peekLine(reader);
		if (!line || line.depth < itemDepth) break;
		const isListItem = line.content.startsWith("- ") || line.content === "-";
		if (line.depth === itemDepth && isListItem) {
			if (startLine === void 0) startLine = line.lineNumber;
			endLine = line.lineNumber;
			lastItemLine = line;
			yield* decodeListItem(reader, itemDepth, options);
			const lastConsumedLine = reader.lastLine;
			if (lastConsumedLine) {
				endLine = lastConsumedLine.lineNumber;
				lastItemLine = lastConsumedLine;
			}
			itemCount++;
		} else break;
	}
	assertExpectedCount(itemCount, header.length, "list-form items", options, lastItemLine);
	if (options.strict && startLine !== void 0 && endLine !== void 0) validateNoBlankLinesInRange(startLine, endLine, reader.scanState.blankLines, options.strict, "list-form array");
	if (options.strict) validateNoExtraListItems(yield* peekLine(reader), itemDepth, header.length);
}
function* decodeListItem(reader, baseDepth, options) {
	const line = yield* readLine(reader);
	if (!line) throw new ReferenceError("Expected list item");
	let afterHyphen;
	if (line.content === "-") {
		yield { type: "startObject" };
		yield { type: "endObject" };
		return;
	} else if (line.content.startsWith("- ")) afterHyphen = line.content.slice(2);
	else throw new ToonDecodeError(`Expected list item to start with "- "`, {
		line: line.lineNumber,
		source: line.raw
	});
	if (!trimSpaces(afterHyphen)) {
		yield { type: "startObject" };
		yield { type: "endObject" };
		return;
	}
	if (trimSpaces(afterHyphen) === "[]") {
		yield {
			type: "startArray",
			length: 0
		};
		yield { type: "endArray" };
		return;
	}
	const itemLine = {
		...line,
		content: afterHyphen
	};
	if (isArrayHeaderContent(afterHyphen)) {
		const arrayHeader = withLine(itemLine, () => resolveArrayHeader(parseArrayHeaderLine(afterHyphen, DEFAULT_DELIMITER), options.strict));
		if (arrayHeader) if (arrayHeader.header.keyed || arrayHeader.header.fields !== void 0) {
			if (options.strict) throw arrayHeader.header.keyed ? keylessKeyedError(itemLine) : keylessFieldsHeaderError(itemLine);
		} else {
			yield* decodeArrayFromHeader(arrayHeader.header, arrayHeader.inlineValues, reader, baseDepth, options, itemLine);
			return;
		}
	}
	const headerInfo = withLine(itemLine, () => resolveArrayHeader(parseArrayHeaderLine(afterHyphen, DEFAULT_DELIMITER), options.strict));
	if (headerInfo && headerInfo.header.key !== void 0 && headerInfo.header.fields !== void 0) {
		const header = headerInfo.header;
		const seenKeys = options.strict ? /* @__PURE__ */ new Set([header.key]) : void 0;
		yield { type: "startObject" };
		yield {
			type: "key",
			key: header.key
		};
		yield* decodeArrayFromHeader(header, headerInfo.inlineValues, reader, baseDepth + 1, options, itemLine);
		yield* followSiblingFields(reader, baseDepth + 1, options, seenKeys);
		yield { type: "endObject" };
		return;
	}
	if (isKeyValueContent(afterHyphen)) {
		const seenKeys = options.strict ? /* @__PURE__ */ new Set() : void 0;
		yield { type: "startObject" };
		yield* decodeKeyValue(itemLine, reader, baseDepth + 1, options, seenKeys);
		yield* followSiblingFields(reader, baseDepth + 1, options, seenKeys);
		yield { type: "endObject" };
		return;
	}
	yield {
		type: "primitive",
		value: withLine(itemLine, () => parsePrimitiveToken(afterHyphen))
	};
}
function* followSiblingFields(reader, followDepth, options, seenKeys) {
	while (true) {
		const nextLine = yield* peekLine(reader);
		if (!nextLine || nextLine.depth < followDepth) break;
		if (nextLine.depth === followDepth && !nextLine.content.startsWith("- ")) {
			yield* readLine(reader);
			yield* decodeKeyValue(nextLine, reader, followDepth, options, seenKeys);
		} else break;
	}
}
function isKeyValueLine(line) {
	const content = line.content;
	if (content.startsWith("\"")) {
		const closingQuoteIndex = findClosingQuote(content, 0);
		if (closingQuoteIndex === -1) return false;
		return content.slice(closingQuoteIndex + 1).includes(":");
	} else return content.includes(":");
}
function resolveArrayHeader(result, strict) {
	if (result.kind === "notHeader") return;
	if (result.kind === "invalid") {
		if (strict) throw new SyntaxError(result.reason);
		return;
	}
	if (strict && result.strictError !== void 0) throw new SyntaxError(result.strictError);
	return {
		header: result.header,
		inlineValues: result.inlineValues
	};
}
function* yieldObjectFromFields(fields, primitives) {
	let cellIndex = 0;
	function* walkFieldGroup(nodes) {
		yield { type: "startObject" };
		for (const node of nodes) {
			if (!node.children && cellIndex >= primitives.length) continue;
			yield {
				type: "key",
				key: node.name
			};
			if (node.children) yield* walkFieldGroup(node.children);
			else yield {
				type: "primitive",
				value: primitives[cellIndex++]
			};
		}
		yield { type: "endObject" };
	}
	yield* walkFieldGroup(fields);
}
//#endregion
//#region src/shared/object-utils.ts
/**
* Assigns an own data property without invoking inherited accessors.
*
* @remarks
* Plain assignment of `__proto__` would hit the `Object.prototype` setter and
* corrupt the prototype chain; `defineProperty` avoids that but is markedly
* slower, so every other key takes plain assignment.
*/
function setOwnProperty(target, key, value) {
	if (key === "__proto__") {
		Object.defineProperty(target, key, {
			value,
			enumerable: true,
			writable: true,
			configurable: true
		});
		return;
	}
	target[key] = value;
}
//#endregion
//#region src/decode/event-builder.ts
function buildValueFromEvents(events) {
	const state = {
		stack: [],
		root: void 0
	};
	for (const event of events) applyEvent(state, event);
	return finalizeState(state);
}
function applyEvent(state, event) {
	const { stack } = state;
	switch (event.type) {
		case "startObject": {
			const obj = {};
			if (stack.length === 0) stack.push({
				type: "object",
				obj
			});
			else {
				const parent = stack[stack.length - 1];
				if (parent.type === "object") {
					if (parent.currentKey === void 0) throw new Error("Object startObject event without preceding key");
					setOwnProperty(parent.obj, parent.currentKey, obj);
					parent.currentKey = void 0;
				} else if (parent.type === "array") parent.arr.push(obj);
				stack.push({
					type: "object",
					obj
				});
			}
			break;
		}
		case "endObject": {
			if (stack.length === 0) throw new Error("Unexpected endObject event");
			const context = stack.pop();
			if (context.type !== "object") throw new Error("Mismatched endObject event");
			if (stack.length === 0) state.root = context.obj;
			break;
		}
		case "startArray": {
			const arr = [];
			if (stack.length === 0) stack.push({
				type: "array",
				arr
			});
			else {
				const parent = stack[stack.length - 1];
				if (parent.type === "object") {
					if (parent.currentKey === void 0) throw new Error("Array startArray event without preceding key");
					setOwnProperty(parent.obj, parent.currentKey, arr);
					parent.currentKey = void 0;
				} else if (parent.type === "array") parent.arr.push(arr);
				stack.push({
					type: "array",
					arr
				});
			}
			break;
		}
		case "endArray": {
			if (stack.length === 0) throw new Error("Unexpected endArray event");
			const context = stack.pop();
			if (context.type !== "array") throw new Error("Mismatched endArray event");
			if (stack.length === 0) state.root = context.arr;
			break;
		}
		case "key": {
			if (stack.length === 0) throw new Error("Key event outside of object context");
			const parent = stack[stack.length - 1];
			if (parent.type !== "object") throw new Error("Key event outside of object context");
			parent.currentKey = event.key;
			break;
		}
		case "primitive":
			if (stack.length === 0) state.root = event.value;
			else {
				const parent = stack[stack.length - 1];
				if (parent.type === "object") {
					if (parent.currentKey === void 0) throw new Error("Primitive event without preceding key in object");
					setOwnProperty(parent.obj, parent.currentKey, event.value);
					parent.currentKey = void 0;
				} else if (parent.type === "array") parent.arr.push(event.value);
			}
			break;
	}
}
function finalizeState(state) {
	if (state.stack.length !== 0) throw new Error("Incomplete event stream: unclosed objects or arrays");
	if (state.root === void 0) throw new Error("No root value built from events");
	return state.root;
}
//#endregion
//#region src/encode/raw-string.ts
const COMMENT_LINE_PATTERN = new RegExp(`(?:^﻿?|\\n) *#`);
/**
* Pre-formatted string that the encoder emits verbatim at a primitive value
* position, bypassing quoting, escaping, and number/keyword detection.
*
* Returned from a replacer for an object or array value, it is ignored and
* the container is encoded normally.
*/
var RawString = class {
	constructor(value) {
		if (COMMENT_LINE_PATTERN.test(value)) throw new TypeError(`Raw string must not contain a line starting with "#": ${JSON.stringify(value)}`);
		this.value = value;
	}
};
/**
* Wraps a pre-formatted string for verbatim emission, typically returned from
* an encode `replacer`. Compose with `escapeString` to control quoting yourself.
*
* @param value The exact text to emit at the value position
* @returns A `RawString` marker honored at primitive value positions
*
* @example
* ```ts
* encode({ name: 'Ada', age: 30 }, {
*   replacer: (key, value) => rawString(`"${escapeString(String(value))}"`)
* })
* // name: "Ada"
* // age: "30"
* ```
*/
function rawString(value) {
	return new RawString(value);
}
function isRawString(value) {
	return value instanceof RawString;
}
//#endregion
//#region src/encode/normalize.ts
const SURROGATE_PATTERN = /[\uD800-\uDFFF]/;
function normalizeValue(value) {
	if (value === null) return null;
	if (isRawString(value)) return value;
	if (typeof value === "object" && value !== null && "toJSON" in value && typeof value.toJSON === "function") {
		const next = value.toJSON();
		if (next !== value) return normalizeValue(next);
	}
	if (typeof value === "string") {
		assertNoLoneSurrogate(value, "string value");
		return value;
	}
	if (typeof value === "boolean") return value;
	if (typeof value === "number") {
		if (Object.is(value, -0)) return 0;
		if (!Number.isFinite(value)) return null;
		return value;
	}
	if (typeof value === "bigint") {
		if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) return Number(value);
		return value.toString();
	}
	if (value instanceof Date) return value.toISOString();
	if (Array.isArray(value)) return value.map(normalizeValue);
	if (value instanceof Set) return Array.from(value).map(normalizeValue);
	if (value instanceof Map) return Object.fromEntries(Array.from(value, ([k, v]) => [String(k), normalizeValue(v)]));
	if (isPlainObject(value)) {
		const encodedValues = {};
		for (const key in value) if (Object.hasOwn(value, key)) {
			assertNoLoneSurrogate(key, "object key");
			setOwnProperty(encodedValues, key, normalizeValue(value[key]));
		}
		return encodedValues;
	}
	return null;
}
function assertNoLoneSurrogate(value, context) {
	if (!SURROGATE_PATTERN.test(value)) return;
	for (let index = 0; index < value.length; index++) {
		const code = value.charCodeAt(index);
		if (code < 55296 || code > 57343) continue;
		const isHighSurrogate = code <= 56319;
		const next = value.charCodeAt(index + 1);
		if (isHighSurrogate && next >= 56320 && next <= 57343) {
			index++;
			continue;
		}
		throw new TypeError(`Cannot encode ${context} containing an unpaired surrogate U+${code.toString(16).toUpperCase()} at index ${index}`);
	}
}
function isJsonPrimitive(value) {
	return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function isEncodablePrimitive(value) {
	return isJsonPrimitive(value) || isRawString(value);
}
function isJsonArray(value) {
	return Array.isArray(value);
}
function isJsonObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) && !isRawString(value);
}
function isEmptyObject(value) {
	return Object.keys(value).length === 0;
}
function isPlainObject(value) {
	if (value === null || typeof value !== "object") return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
}
function isArrayOfPrimitives(value) {
	return value.length === 0 || value.every((item) => isEncodablePrimitive(item));
}
function isArrayOfArrays(value) {
	return value.length === 0 || value.every((item) => isJsonArray(item));
}
function isArrayOfObjects(value) {
	return value.length === 0 || value.every((item) => isJsonObject(item));
}
//#endregion
//#region src/shared/validation.ts
const NUMERIC_LIKE_PATTERN = /^[+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i;
/** Narrows an arbitrary delimiter option, shared by the library and the CLI so both report it alike. */
function assertValidDelimiter(delimiter) {
	if (!Object.values(DELIMITERS).includes(delimiter)) throw new TypeError(`Invalid delimiter ${JSON.stringify(delimiter)}. Valid delimiters are: comma (,), tab (\\t), pipe (|)`);
}
/**
* Checks if a key can be used without quotes.
*
* @remarks
* Valid unquoted keys must start with a letter or underscore,
* followed by letters, digits, underscores, or dots.
*/
function isValidUnquotedKey(key) {
	return /^[A-Z_][\w.]*$/i.test(key);
}
/**
* Determines if a string value can be safely encoded without quotes.
*
* @remarks
* A string needs quoting if it:
* - Is empty
* - Has leading or trailing whitespace
* - Could be confused with a literal (boolean, null, number)
* - Contains structural characters (colons, brackets, braces)
* - Contains quotes or backslashes (need escaping)
* - Contains control characters (newlines, tabs, etc.)
* - Contains the active delimiter
* - Starts with a list marker (hyphen)
* - Starts with a comment marker (#)
*/
function isSafeUnquoted(value, delimiter = DEFAULT_DELIMITER) {
	if (!value) return false;
	if (/^[ \t]|[ \t]$/.test(value)) return false;
	if (isBooleanOrNullLiteral(value) || isNumericLike(value)) return false;
	if (value.includes(":")) return false;
	if (value.includes("\"") || value.includes("\\")) return false;
	if (/[[\]{}]/.test(value)) return false;
	if (/[\u0000-\u001F]/.test(value)) return false;
	if (value.includes(delimiter)) return false;
	if (value.startsWith("-")) return false;
	if (value.startsWith("#")) return false;
	return true;
}
function isNumericLike(value) {
	return NUMERIC_LIKE_PATTERN.test(value);
}
//#endregion
//#region src/encode/primitives.ts
function encodePrimitive(value, delimiter) {
	if (isRawString(value)) return value.value;
	if (value === null) return NULL_LITERAL;
	if (typeof value === "boolean") return String(value);
	if (typeof value === "number") return String(value);
	return encodeStringLiteral(value, delimiter);
}
function encodeStringLiteral(value, delimiter = DEFAULT_DELIMITER) {
	if (isSafeUnquoted(value, delimiter)) return value;
	return `"${escapeString(value)}"`;
}
function encodeKey(key) {
	if (isValidUnquotedKey(key)) return key;
	return `"${escapeString(key)}"`;
}
function encodeAndJoinPrimitives(values, delimiter = DEFAULT_DELIMITER) {
	return values.map((v) => encodePrimitive(v, delimiter)).join(delimiter);
}
function formatHeader(length, options) {
	const key = options?.key;
	const fields = options?.fields;
	const delimiter = options?.delimiter ?? ",";
	let header = "";
	if (key != null) header += encodeKey(key);
	header += `[${length}${options?.keyed ? ":" : ""}${delimiter !== DEFAULT_DELIMITER ? delimiter : ""}]`;
	if (fields) header += `{${formatFieldSegment(fields, delimiter)}}`;
	header += ":";
	return header;
}
function formatFieldSegment(fields, delimiter) {
	return fields.map((field) => encodeKey(field.name) + (field.children ? `{${formatFieldSegment(field.children, delimiter)}}` : "")).join(delimiter);
}
//#endregion
//#region src/encode/tabular.ts
/** Classifies rows into a tabular field list, or undefined when they are not uniformly tabular. */
function extractTabularFields(rows) {
	if (rows.length === 0) return;
	const firstKeys = Object.keys(rows[0]);
	if (firstKeys.length === 0) return;
	for (const row of rows) {
		if (Object.keys(row).length !== firstKeys.length) return;
		for (const key of firstKeys) if (!Object.hasOwn(row, key)) return;
	}
	const fieldNodes = [];
	for (const key of firstKeys) {
		const fieldNode = classifyColumn(key, rows.map((row) => row[key]));
		if (!fieldNode) return;
		fieldNodes.push(fieldNode);
	}
	return fieldNodes;
}
/** Classifies an object's values as a keyed tabular field list (>=2 uniform non-empty object entries), or undefined. */
function extractKeyedTabularFields(value) {
	const entryValues = Object.values(value);
	if (entryValues.length < 2) return;
	if (!entryValues.every((entryValue) => isJsonObject(entryValue) && !isEmptyObject(entryValue))) return;
	return extractTabularFields(entryValues);
}
/** Reads one row's leaf cells in the field order `extractTabularFields` produced. */
function collectRowLeaves(row, fields) {
	const leaves = [];
	collectLeafValues(row, fields, leaves);
	return leaves;
}
function classifyColumn(name, values) {
	if (values.every((value) => isEncodablePrimitive(value))) return { name };
	if (!values.every((value) => isJsonObject(value) && !isEmptyObject(value))) return;
	const children = extractTabularFields(values);
	if (!children) return;
	return {
		name,
		children
	};
}
function collectLeafValues(row, fields, leaves) {
	for (const field of fields) {
		const value = row[field.name];
		if (field.children) collectLeafValues(value, field.children, leaves);
		else leaves.push(value);
	}
}
//#endregion
//#region src/encode/encoders.ts
function* encodeJsonValue(value, options, depth) {
	if (isEncodablePrimitive(value)) {
		const encodedPrimitive = encodePrimitive(value, options.delimiter);
		if (encodedPrimitive !== "") yield encodedPrimitive;
		return;
	}
	if (isJsonArray(value)) yield* encodeArrayLines(void 0, value, depth, options);
	else if (isJsonObject(value)) {
		const keyedFields = extractKeyedTabularFields(value);
		if (keyedFields) {
			yield* encodeKeyedObjectLines(void 0, value, keyedFields, depth, options);
			return;
		}
		yield* encodeObjectLines(value, depth, options);
	}
}
function* encodeObjectLines(value, depth, options) {
	for (const [key, val] of Object.entries(value)) yield* encodeKeyValuePairLines(key, val, depth, options);
}
function* encodeKeyValuePairLines(key, value, depth, options) {
	const encodedKey = encodeKey(key);
	if (isEncodablePrimitive(value)) yield indentedLine(depth, `${encodedKey}: ${encodePrimitive(value, options.delimiter)}`, options.indentSize);
	else if (isJsonArray(value)) yield* encodeArrayLines(key, value, depth, options);
	else if (isJsonObject(value)) {
		const keyedFields = extractKeyedTabularFields(value);
		if (keyedFields) {
			yield* encodeKeyedObjectLines(key, value, keyedFields, depth, options);
			return;
		}
		yield indentedLine(depth, `${encodedKey}:`, options.indentSize);
		if (!isEmptyObject(value)) yield* encodeObjectLines(value, depth + 1, options);
	}
}
function* encodeKeyedObjectLines(key, value, fields, depth, options) {
	const entries = Object.entries(value);
	yield indentedLine(depth, formatHeader(entries.length, {
		key,
		fields,
		delimiter: options.delimiter,
		keyed: true
	}), options.indentSize);
	yield* encodeKeyedEntryRowsLines(entries, fields, depth + 1, options);
}
function* encodeKeyedEntryRowsLines(entries, fields, depth, options) {
	for (const [entryKey, entryValue] of entries) {
		const leaves = collectRowLeaves(entryValue, fields);
		yield indentedLine(depth, `${encodeKey(entryKey)}: ${encodeAndJoinPrimitives(leaves, options.delimiter)}`, options.indentSize);
	}
}
function* encodeArrayLines(key, value, depth, options) {
	if (value.length === 0) {
		yield indentedLine(depth, key != null ? `${encodeKey(key)}: []` : "[]", options.indentSize);
		return;
	}
	if (isArrayOfPrimitives(value)) {
		yield indentedLine(depth, encodeInlineArrayLine(value, options.delimiter, key), options.indentSize);
		return;
	}
	if (isArrayOfArrays(value)) {
		if (value.every((arr) => isArrayOfPrimitives(arr))) {
			yield* encodeArrayOfArraysAsListItemsLines(key, value, depth, options);
			return;
		}
	}
	if (isArrayOfObjects(value)) {
		const fields = extractTabularFields(value);
		if (fields) yield* encodeArrayOfObjectsAsTabularLines(key, value, fields, depth, options);
		else yield* encodeMixedArrayAsListItemsLines(key, value, depth, options);
		return;
	}
	yield* encodeMixedArrayAsListItemsLines(key, value, depth, options);
}
function* encodeArrayOfArraysAsListItemsLines(prefix, values, depth, options) {
	yield indentedLine(depth, formatHeader(values.length, {
		key: prefix,
		delimiter: options.delimiter
	}), options.indentSize);
	for (const arr of values) if (isArrayOfPrimitives(arr)) {
		const arrayLine = encodeInlineArrayLine(arr, options.delimiter);
		yield indentedListItem(depth + 1, arrayLine, options.indentSize);
	}
}
function encodeInlineArrayLine(values, delimiter, prefix) {
	const header = formatHeader(values.length, {
		key: prefix,
		delimiter
	});
	const joinedValue = encodeAndJoinPrimitives(values, delimiter);
	if (values.length === 0) return header;
	return `${header} ${joinedValue}`;
}
function* encodeArrayOfObjectsAsTabularLines(prefix, rows, fields, depth, options) {
	yield indentedLine(depth, formatHeader(rows.length, {
		key: prefix,
		fields,
		delimiter: options.delimiter
	}), options.indentSize);
	yield* writeTabularRowsLines(rows, fields, depth + 1, options);
}
function* writeTabularRowsLines(rows, fields, depth, options) {
	for (const row of rows) yield indentedLine(depth, encodeAndJoinPrimitives(collectRowLeaves(row, fields), options.delimiter), options.indentSize);
}
function* encodeMixedArrayAsListItemsLines(prefix, items, depth, options) {
	yield indentedLine(depth, formatHeader(items.length, {
		key: prefix,
		delimiter: options.delimiter
	}), options.indentSize);
	for (const item of items) yield* encodeListItemValueLines(item, depth + 1, options);
}
function* encodeObjectAsListItemLines(obj, depth, options) {
	if (isEmptyObject(obj)) {
		yield indentedLine(depth, "-", options.indentSize);
		return;
	}
	const entries = Object.entries(obj);
	const [firstKey, firstValue] = entries[0];
	const restEntries = entries.slice(1);
	if (isJsonArray(firstValue) && isArrayOfObjects(firstValue)) {
		const fields = extractTabularFields(firstValue);
		if (fields) {
			yield indentedListItem(depth, formatHeader(firstValue.length, {
				key: firstKey,
				fields,
				delimiter: options.delimiter
			}), options.indentSize);
			yield* writeTabularRowsLines(firstValue, fields, depth + 2, options);
			if (restEntries.length > 0) yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options);
			return;
		}
	}
	if (isJsonObject(firstValue)) {
		const keyedFields = extractKeyedTabularFields(firstValue);
		if (keyedFields) {
			const keyedEntries = Object.entries(firstValue);
			yield indentedListItem(depth, formatHeader(keyedEntries.length, {
				key: firstKey,
				fields: keyedFields,
				delimiter: options.delimiter,
				keyed: true
			}), options.indentSize);
			yield* encodeKeyedEntryRowsLines(keyedEntries, keyedFields, depth + 2, options);
			if (restEntries.length > 0) yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options);
			return;
		}
	}
	const encodedKey = encodeKey(firstKey);
	if (isEncodablePrimitive(firstValue)) yield indentedListItem(depth, `${encodedKey}: ${encodePrimitive(firstValue, options.delimiter)}`, options.indentSize);
	else if (isJsonArray(firstValue)) if (firstValue.length === 0) yield indentedListItem(depth, `${encodedKey}: []`, options.indentSize);
	else if (isArrayOfPrimitives(firstValue)) yield indentedListItem(depth, `${encodedKey}${encodeInlineArrayLine(firstValue, options.delimiter)}`, options.indentSize);
	else {
		yield indentedListItem(depth, `${encodedKey}${formatHeader(firstValue.length, { delimiter: options.delimiter })}`, options.indentSize);
		for (const item of firstValue) yield* encodeListItemValueLines(item, depth + 2, options);
	}
	else if (isJsonObject(firstValue)) {
		yield indentedListItem(depth, `${encodedKey}:`, options.indentSize);
		if (!isEmptyObject(firstValue)) yield* encodeObjectLines(firstValue, depth + 2, options);
	}
	if (restEntries.length > 0) yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options);
}
function* encodeListItemValueLines(value, depth, options) {
	if (isEncodablePrimitive(value)) yield indentedListItem(depth, encodePrimitive(value, options.delimiter), options.indentSize);
	else if (isJsonArray(value)) if (isArrayOfPrimitives(value)) yield indentedListItem(depth, encodeInlineArrayLine(value, options.delimiter), options.indentSize);
	else {
		yield indentedListItem(depth, formatHeader(value.length, { delimiter: options.delimiter }), options.indentSize);
		for (const item of value) yield* encodeListItemValueLines(item, depth + 1, options);
	}
	else if (isJsonObject(value)) yield* encodeObjectAsListItemLines(value, depth, options);
}
function indentedLine(depth, content, indentSize) {
	return " ".repeat(indentSize * depth) + content;
}
function indentedListItem(depth, content, indentSize) {
	return indentedLine(depth, "- " + content, indentSize);
}
//#endregion
//#region src/encode/replacer.ts
/**
* Applies a replacer function to a `JsonValue` and all its descendants.
*
* The replacer is called for the root (key='', path=[]), every object property
* (key = property name), and every array element (key = string index).
*/
function applyReplacer(root, replacer) {
	const replacedRoot = replacer("", root, []);
	if (replacedRoot === void 0) return transformChildren(root, replacer, []);
	return transformReplaced(root, replacedRoot, replacer, []);
}
/**
* Resolves a replacer's (non-`undefined`) return value at a single position.
*
* A `RawString` only stands in for a primitive: returned for an object or
* array value, it is ignored and the original container is traversed normally.
*/
function transformReplaced(original, replaced, replacer, path) {
	if (isRawString(replaced) && !isEncodablePrimitive(original)) return transformChildren(original, replacer, path);
	return transformChildren(normalizeValue(replaced), replacer, path);
}
function transformChildren(value, replacer, path) {
	if (isJsonObject(value)) return transformObject(value, replacer, path);
	if (isJsonArray(value)) return transformArray(value, replacer, path);
	return value;
}
function transformObject(obj, replacer, path) {
	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		const childPath = [...path, key];
		const replacedValue = replacer(key, value, childPath);
		if (replacedValue === void 0) continue;
		setOwnProperty(result, key, transformReplaced(value, replacedValue, replacer, childPath));
	}
	return result;
}
function transformArray(arr, replacer, path) {
	const result = [];
	for (let i = 0; i < arr.length; i++) {
		const value = arr[i];
		const childPath = [...path, i];
		const replacedValue = replacer(String(i), value, childPath);
		if (replacedValue === void 0) continue;
		result.push(transformReplaced(value, replacedValue, replacer, childPath));
	}
	return result;
}
//#endregion
//#region src/index.ts
/**
* Encodes a JavaScript value into TOON format string.
*
* @param input Any JavaScript value (objects, arrays, primitives)
* @param options Optional encoding configuration
* @returns TOON formatted string
*
* @example
* ```ts
* encode({ name: 'Ada', age: 30 })
* // name: Ada
* // age: 30
*
* encode({ users: [{ id: 1 }, { id: 2 }] })
* // users[2]{id}:
* //   1
* //   2
*
* encode({ tags: [] })
* // tags: []
*
* encode(data, { indentSize: 4 })
* ```
*/
function encode(input, options) {
	return Array.from(encodeLines(input, options)).join("\n");
}
/**
* Decodes a TOON format string into a JavaScript value.
*
* @param input TOON formatted string
* @param options Optional decoding configuration
* @returns Parsed JavaScript value (object, array, or primitive)
*
* @example
* ```ts
* decode('name: Ada\nage: 30')
* // { name: 'Ada', age: 30 }
*
* decode('users[2]:\n  - id: 1\n  - id: 2')
* // { users: [{ id: 1 }, { id: 2 }] }
*
* decode('tags: []')
* // { tags: [] }
*
* decode(toonString, { strict: false })
* ```
*/
function decode(input, options) {
	return decodeFromLines(input.split("\n"), options);
}
/**
* Encodes a JavaScript value into TOON format as a sequence of lines.
*
* This function yields TOON lines one at a time without building the full string,
* making it suitable for streaming large outputs to files, HTTP responses, or process stdout.
*
* @param input Any JavaScript value (objects, arrays, primitives)
* @param options Optional encoding configuration
* @returns Iterable of TOON lines (without trailing newlines)
*
* @example
* ```ts
* // Stream to stdout
* for (const line of encodeLines({ name: 'Ada', age: 30 })) {
*   console.log(line)
* }
*
* // Collect to array
* const lines = Array.from(encodeLines(data))
*
* // Equivalent to encode()
* const toonString = Array.from(encodeLines(data, options)).join('\n')
* ```
*/
function encodeLines(input, options) {
	const normalizedValue = normalizeValue(input);
	const resolvedOptions = resolveOptions(options);
	return encodeJsonValue(resolvedOptions.replacer ? applyReplacer(normalizedValue, resolvedOptions.replacer) : normalizedValue, resolvedOptions, 0);
}
/**
* Decodes TOON format from pre-split lines into a JavaScript value.
*
* Convenience wrapper around the streaming decoder that builds the full
* value in memory.
*
* @param lines Iterable of TOON lines (without newlines)
* @param options Optional decoding configuration
* @returns Parsed JavaScript value (object, array, or primitive)
*
* @example
* ```ts
* const lines = ['name: Ada', 'age: 30']
* decodeFromLines(lines)
* // { name: 'Ada', age: 30 }
* ```
*/
function decodeFromLines(lines, options) {
	return buildValueFromEvents(decodeStreamSync$1(lines, resolveDecodeOptions(options)));
}
/**
* Synchronously decodes TOON lines into a stream of JSON events.
*
* Yields structured events (startObject, endObject, startArray, endArray, key,
* primitive) that represent the JSON data model without building the full value tree.
*
* @param lines Iterable of TOON lines (without newlines)
* @param options Optional decoding configuration
* @returns Iterable of JSON stream events
*
* @example
* ```ts
* const lines = ['name: Ada', 'age: 30']
* for (const event of decodeStreamSync(lines)) {
*   console.log(event)
*   // { type: 'startObject' }
*   // { type: 'key', key: 'name' }
*   // { type: 'primitive', value: 'Ada' }
*   // ...
* }
* ```
*/
function decodeStreamSync(lines, options) {
	return decodeStreamSync$1(lines, options);
}
/**
* Asynchronously decodes TOON lines into a stream of JSON events.
*
* Yields structured events (startObject, endObject, startArray, endArray, key,
* primitive) that represent the JSON data model without building the full value tree.
* Supports both sync and async iterables.
*
* @param source Async or sync iterable of TOON lines (without newlines)
* @param options Optional decoding configuration
* @returns Async iterable of JSON stream events
*
* @example
* ```ts
* const fileStream = createReadStream('data.toon', 'utf-8')
* const lines = splitLines(fileStream) // Async iterable of lines
*
* for await (const event of decodeStream(lines)) {
*   console.log(event)
*   // { type: 'startObject' }
*   // { type: 'key', key: 'name' }
*   // { type: 'primitive', value: 'Ada' }
*   // ...
* }
* ```
*/
function decodeStream(source, options) {
	return decodeStream$1(source, options);
}
function resolveOptions(options) {
	const delimiter = options?.delimiter ?? DEFAULT_DELIMITER;
	assertValidDelimiter(delimiter);
	return {
		indentSize: options?.indentSize ?? options?.indent ?? 2,
		delimiter,
		replacer: options?.replacer
	};
}
function resolveDecodeOptions(options) {
	return {
		indentSize: options?.indentSize ?? options?.indent ?? 2,
		strict: options?.strict ?? true
	};
}
//#endregion
export { DEFAULT_DELIMITER, DELIMITERS, ToonDecodeError, decode, decodeFromLines, decodeStream, decodeStreamSync, encode, encodeLines, escapeString, rawString };
