"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expr = exports.Funcall = exports.ExprType = void 0;
var ExprType;
(function (ExprType) {
    ExprType[ExprType["ExprVoid"] = 0] = "ExprVoid";
    ExprType[ExprType["ExprInt"] = 1] = "ExprInt";
    ExprType[ExprType["ExprStr"] = 2] = "ExprStr";
    ExprType[ExprType["ExprVar"] = 3] = "ExprVar";
    ExprType[ExprType["ExprFuncall"] = 4] = "ExprFuncall";
})(ExprType = exports.ExprType || (exports.ExprType = {}));
class Funcall {
    constructor(name, args) {
        this.name = name !== null && name !== void 0 ? name : '';
        this.args = args !== null && args !== void 0 ? args : [];
    }
    toString() {
        return `${this.name}(${this.args.join(', ')})`;
    }
}
exports.Funcall = Funcall;
class Expr {
    constructor(type, asInt, asStr, asVar, asFuncall) {
        this.type = ExprType.ExprVoid;
        this.asFuncall = undefined;
        this.type = type !== null && type !== void 0 ? type : ExprType.ExprVoid;
        this.asInt = asInt !== null && asInt !== void 0 ? asInt : -1;
        this.asStr = asStr !== null && asStr !== void 0 ? asStr : '';
        this.asVar = asVar !== null && asVar !== void 0 ? asVar : '';
        this.asFuncall = asFuncall;
    }
    dump(level = 0) {
        var _a, _b, _c;
        for (let i = 0; i < level; i += 1) {
            process.stdout.write('  ');
        }
        switch (this.type) {
            case ExprType.ExprVoid:
                console.log('Void');
                break;
            case ExprType.ExprInt:
                console.log(`Int: ${this.asInt}`);
                break;
            case ExprType.ExprStr:
                // TODO: Expr.Dump() does not escape strings
                console.log(`Str: "${this.asStr}"`);
                break;
            case ExprType.ExprVar:
                console.log(`Var: ${this.asVar}`);
                break;
            case ExprType.ExprFuncall:
                console.log(`Funcall: ${(_a = this.asFuncall) === null || _a === void 0 ? void 0 : _a.name}`);
                for (const arg of (_c = (_b = this.asFuncall) === null || _b === void 0 ? void 0 : _b.args) !== null && _c !== void 0 ? _c : []) {
                    arg.dump(level + 1);
                }
                break;
        }
    }
    toString() {
        var _a;
        switch (this.type) {
            case ExprType.ExprVoid:
                return 'Void';
            case ExprType.ExprInt:
                return `Int: ${this.asInt}`;
            case ExprType.ExprStr:
                return `Str: "${this.asStr}"`;
            case ExprType.ExprVar:
                return `Var: ${this.asVar}`;
            case ExprType.ExprFuncall:
                return `Funcall: ${(_a = this.asFuncall) === null || _a === void 0 ? void 0 : _a.toString()}`;
            default:
                throw new Error('unreachable');
        }
    }
}
exports.Expr = Expr;
