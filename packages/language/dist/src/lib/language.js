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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardLibrary = void 0;
const axios_1 = __importDefault(require("axios"));
const expression_1 = require("./expression");
exports.standardLibrary = {
    say: (context, args) => __awaiter(void 0, void 0, void 0, function* () {
        for (let i = 0; i < args.length; i++) {
            const [val, err] = yield context.evalExpr(args[i]);
            if (err !== null) {
                return [undefined, err];
            }
            process.stdout.write(val === null || val === void 0 ? void 0 : val.asStr);
        }
        return [undefined, null];
    }),
    let: (context, args) => __awaiter(void 0, void 0, void 0, function* () {
        if (args.length != 2) {
            return [undefined, new Error('let() expects two arguments')];
        }
        if (args[0].type !== expression_1.ExprType.ExprVar) {
            return [undefined, new Error('First argument of let() has to be variable name')];
        }
        const name = args[0].asVar;
        const [value, err] = yield context.evalExpr(args[1]);
        if (err !== null) {
            return [undefined, err];
        }
        context.topScope().vars[name] = value;
        return [undefined, null];
    }),
    define: (context, args) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const n = args.length;
        if (n < 2) {
            return [undefined, new Error('define() expects at least 2 arguments')];
        }
        if (args[0].type !== expression_1.ExprType.ExprVar) {
            return [undefined, new Error('define(): first argument must be the name of the function')];
        }
        const funName = args[0].asVar;
        if (args[1].type !== expression_1.ExprType.ExprFuncall || ((_a = args[1].asFuncall) === null || _a === void 0 ? void 0 : _a.name) !== 'args') {
            return [undefined, new Error('define(): second argument must be the argument list')];
        }
        const funArgs = args[1].asFuncall.args;
        for (const funArg of funArgs) {
            if (funArg.type !== expression_1.ExprType.ExprVar) {
                return [undefined, new Error('define(): argument list must consist of only variable names')];
            }
        }
        context.topScope().funcs[funName] = (context, callArgs) => __awaiter(void 0, void 0, void 0, function* () {
            const scope = {
                vars: {},
                funcs: {}
            };
            if (callArgs.length !== funArgs.length) {
                return [undefined, new Error(`${funName}(): expected ${funArgs.length} arguments but provided ${args.length}`)];
            }
            for (let index = 0; index < callArgs.length; index++) {
                scope.vars[funArgs[index].asVar] = callArgs[index];
            }
            context.pushScope(scope);
            for (const stmt of args.slice(2)) {
                const [_, err] = yield context.evalExpr(stmt);
                if (err) {
                    return [undefined, err];
                }
            }
            context.popScope();
            return [undefined, null];
        });
        return [undefined, null];
    }),
    list: (context, args) => __awaiter(void 0, void 0, void 0, function* () {
        return [new expression_1.Expr(expression_1.ExprType.ExprFuncall, undefined, undefined, undefined, new expression_1.Funcall('list', args)), null];
    }),
    for: (context, args) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        if (args.length < 2) {
            return [undefined, new Error('for() expects at least 2 arguments')];
        }
        if (args[0].type !== expression_1.ExprType.ExprVar) {
            return [undefined, new Error('First arg of for() must be variable')];
        }
        const varName = args[0].asVar;
        const [list, error] = yield context.evalExpr(args[1]);
        if (error || list === undefined) {
            return [undefined, error];
        }
        if (list.type !== expression_1.ExprType.ExprFuncall || ((_b = list.asFuncall) === null || _b === void 0 ? void 0 : _b.name) !== 'list') {
            return [undefined, new Error('Second arg of for() must be a list')];
        }
        const scope = {
            vars: {},
            funcs: {}
        };
        for (const arg of list.asFuncall.args) {
            scope.vars[varName] = arg;
        }
        context.pushScope(scope);
        for (const expr of args) {
            const [, err] = yield context.evalExpr(expr);
            if (err instanceof Error) {
                return [undefined, err];
            }
        }
        context.popScope();
        return [undefined, null];
    }),
    http: (context, args) => __awaiter(void 0, void 0, void 0, function* () {
        const url = [];
        for (const arg of args) {
            const [val, error] = yield context.evalExpr(arg);
            if (error || val === undefined) {
                return [undefined, error];
            }
            if (val.type !== expression_1.ExprType.ExprStr) {
                return [undefined, new Error('http() expects its arguments to be strings')];
            }
            url.push(val.asStr);
        }
        const resp = yield axios_1.default.get(url.join(''));
        const body = yield resp.data;
        return [new expression_1.Expr(expression_1.ExprType.ExprStr, undefined, body, undefined, undefined), null];
    })
};
