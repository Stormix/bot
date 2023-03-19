"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAllExprs = exports.parseExpr = void 0;
const errors_1 = require("./errors");
const expression_1 = require("./expression");
const utils_1 = require("./utils");
const parseExpr = (sourceRunes) => {
    sourceRunes = (0, utils_1.trimRunes)(sourceRunes);
    const expr = new expression_1.Expr();
    if (sourceRunes.length > 0) {
        if (sourceRunes[0] === '"') {
            expr.type = expression_1.ExprType.ExprStr;
            sourceRunes = sourceRunes.slice(1);
            // TODO: parseExpr does not support string escaping
            const [literalRunes, restRune] = (0, utils_1.spanRunes)(sourceRunes, (rune) => rune !== '"');
            if (restRune.length <= 0 && restRune[0] !== '"') {
                return [[], expr, new Error('unterminated string, expected "')];
            }
            sourceRunes = restRune.slice(1);
            expr.asStr = literalRunes.join('');
            return [sourceRunes, expr, null];
        }
        else if ((0, utils_1.isDigit)(sourceRunes[0])) {
            expr.type = expression_1.ExprType.ExprInt;
            const [digits, restRunes] = (0, utils_1.spanRunes)(sourceRunes, utils_1.isDigit);
            sourceRunes = restRunes;
            const val = parseInt(digits.join(''), 10);
            if (isNaN(val)) {
                return [sourceRunes, new expression_1.Expr(), new Error('Invalid number')];
            }
            expr.asInt = val;
            return [sourceRunes, expr, null];
        }
        else if ((0, utils_1.isLetter)(sourceRunes[0])) {
            const [name, restRunes] = (0, utils_1.spanRunes)(sourceRunes, utils_1.isLetter);
            sourceRunes = (0, utils_1.trimRunes)(restRunes);
            if (sourceRunes.length > 0 && sourceRunes[0] === '(') {
                expr.type = expression_1.ExprType.ExprFuncall;
                expr.asFuncall = new expression_1.Funcall();
                expr.asFuncall.name = name.join('');
                while (true) {
                    sourceRunes = sourceRunes.slice(1);
                    const [restRunes, arg, err] = (0, exports.parseExpr)(sourceRunes);
                    if (err) {
                        return [restRunes, arg, err];
                    }
                    sourceRunes = restRunes;
                    expr.asFuncall.args.push(arg);
                    sourceRunes = (0, utils_1.trimRunes)(sourceRunes);
                    if (sourceRunes.length <= 0 || sourceRunes[0] !== ',') {
                        break;
                    }
                }
                if (sourceRunes.length <= 0 || sourceRunes[0] !== ')') {
                    return [sourceRunes, expr, new Error('Expected )')];
                }
                return [sourceRunes.slice(1), expr, null];
            }
            else {
                expr.type = expression_1.ExprType.ExprVar;
                expr.asVar = name.join('');
                return [sourceRunes, expr, null];
            }
        }
        else {
            return [sourceRunes, undefined, new Error(`Unexpected character ${sourceRunes[0]}`)];
        }
    }
    return [sourceRunes, undefined, errors_1.EndOfSource];
};
exports.parseExpr = parseExpr;
const parseAllExprs = (source) => {
    let sourceRunes = source.split('');
    const exprs = [];
    while (true) {
        const results = (0, exports.parseExpr)(sourceRunes);
        const [restRunes, expr, _] = results;
        let err = results[2];
        if (err !== null) {
            if (err === errors_1.EndOfSource) {
                err = null;
            }
            return [exprs, err];
        }
        sourceRunes = restRunes;
        exprs.push(expr);
    }
};
exports.parseAllExprs = parseAllExprs;
