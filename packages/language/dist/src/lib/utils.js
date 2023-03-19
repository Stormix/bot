"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimRunes = exports.spanRunes = exports.isLetter = exports.isDigit = void 0;
const isDigit = (c) => c.length === 1 && c >= '0' && c <= '9';
exports.isDigit = isDigit;
const isLetter = (c) => c.length === 1 && c.toUpperCase() != c.toLowerCase();
exports.isLetter = isLetter;
const spanRunes = (runes, predicate) => {
    for (let i = 0; i < runes.length; i++) {
        if (!predicate(runes[i])) {
            return [runes.slice(0, i), runes.slice(i)];
        }
    }
    return [runes, []];
};
exports.spanRunes = spanRunes;
const trimRunes = (runes) => {
    const [, s] = (0, exports.spanRunes)(runes, (rune) => rune === ' ' || rune === '\t');
    return s;
};
exports.trimRunes = trimRunes;
