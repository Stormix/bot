"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const language_1 = require("../lib/language");
const parser_1 = require("../lib/parser");
const scoping_1 = require("../lib/scoping");
const fs_1 = __importStar(require("fs"));
const yargs_1 = __importDefault(require("yargs/yargs"));
const argv2 = (0, yargs_1.default)(process.argv.slice(2)).options({
    debug: {
        alias: 'd',
        description: 'Will dump the AST to the console',
    }
})
    .parseSync();
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const file = argv2._[0];
        const debug = argv2.debug;
        // Read file content
        if (!(0, fs_1.existsSync)(file)) {
            throw new Error(`File ${file} does not exist`);
        }
        if (!file.endsWith('.tex')) {
            throw new Error(`File ${file} is not a .tex file`);
        }
        const content = fs_1.default.readFileSync(file, 'utf-8').replace(/\r?\n|\r/g, ''); // Remove newlines
        // Parse and evaluate
        const loop = {
            vars: {},
            funcs: Object.assign({}, language_1.standardLibrary)
        };
        const context = new scoping_1.EvalContext();
        context.pushScope(loop);
        const [exprs, err] = (0, parser_1.parseAllExprs)(content);
        if (err !== null) {
            throw err;
        }
        for (let i = 0; i < exprs.length; i++) {
            if (debug) {
                exprs[i].dump();
            }
            else {
                const [_, err] = yield context.evalExpr(exprs[i]);
                if (err !== null) {
                    throw err;
                }
            }
        }
    });
}
run()
    .then(() => {
    process.exit(0);
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
