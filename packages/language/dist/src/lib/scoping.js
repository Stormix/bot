"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvalContext = void 0;
const expression_1 = require("./expression");
class EvalContext {
    constructor() {
        this.scopes = [];
    }
    lookUpVar(name) {
        const scopes = this.scopes;
        for (let i = scopes.length - 1; i >= 0; i--) {
            const varr = scopes[i].vars[name];
            if (varr !== undefined) {
                return [varr, true];
            }
        }
        return [undefined, false];
    }
    lookUpFunc(name) {
        const scopes = this.scopes;
        for (let i = scopes.length - 1; i >= 0; i--) {
            const fun = scopes[i].funcs[name];
            if (fun !== undefined) {
                return [fun, true];
            }
        }
        return [undefined, false];
    }
    pushScope(scope) {
        this.scopes.push(scope);
    }
    popScope() {
        if (this.scopes.length === 0) {
            throw new Error('No scopes found');
        }
        this.scopes.pop();
    }
    topScope() {
        if (this.scopes.length === 0) {
            throw new Error('No scopes found');
        }
        return this.scopes[this.scopes.length - 1];
    }
    evalExpr(expr) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            switch (expr.type) {
                case expression_1.ExprType.ExprVoid:
                case expression_1.ExprType.ExprInt:
                case expression_1.ExprType.ExprStr:
                    return [expr, null];
                case expression_1.ExprType.ExprVar:
                    const [val, ok] = this.lookUpVar(expr.asVar);
                    if (!ok) {
                        return [undefined, new Error(`Unknown variable '${expr.asVar}'`)];
                    }
                    return this.evalExpr(val);
                case expression_1.ExprType.ExprFuncall:
                    const [fun, found] = this.lookUpFunc((_a = expr.asFuncall) === null || _a === void 0 ? void 0 : _a.name);
                    if (!found) {
                        return [undefined, new Error(`Unknown function '${(_b = expr.asFuncall) === null || _b === void 0 ? void 0 : _b.name}'`)];
                    }
                    return yield fun(this, (_d = (_c = expr.asFuncall) === null || _c === void 0 ? void 0 : _c.args) !== null && _d !== void 0 ? _d : []);
                default:
                    throw new Error('unreachable');
            }
        });
    }
}
exports.EvalContext = EvalContext;
