import axios from 'axios';
import type { Func } from './expression';
import { Expr, ExprType, Funcall } from './expression';
import type { EvalContext, EvalScope } from './scoping';

export const standardLibrary: Record<string, Func> = {
  say: async (context: EvalContext, args: Expr[]) => {
    for (let i = 0; i < args.length; i++) {
      const [val, err] = await context.evalExpr(args[i]);
      if (err !== null) {
        return [undefined, err];
      }
      process.stdout.write(val?.asStr as string);
    }
    return [undefined, null];
  },
  let: async (context: EvalContext, args: Expr[]) => {
    if (args.length != 2) {
      return [undefined, new Error('let() expects two arguments')];
    }

    if (args[0].type !== ExprType.ExprVar) {
      return [undefined, new Error('First argument of let() has to be variable name')];
    }

    const name = args[0].asVar!;

    const [value, err] = await context.evalExpr(args[1]);

    if (err !== null) {
      return [undefined, err];
    }

    context.topScope().vars[name] = value!;

    return [undefined, null];
  },
  define: async (context: EvalContext, args: Expr[]) => {
    const n = args.length;
    if (n < 2) {
      return [undefined, new Error('define() expects at least 2 arguments')];
    }

    if (args[0].type !== ExprType.ExprVar) {
      return [undefined, new Error('define(): first argument must be the name of the function')];
    }
    const funName = args[0].asVar;

    if (args[1].type !== ExprType.ExprFuncall || args[1].asFuncall?.name !== 'args') {
      return [undefined, new Error('define(): second argument must be the argument list')];
    }
    const funArgs = args[1].asFuncall.args;
    for (const funArg of funArgs) {
      if (funArg.type !== ExprType.ExprVar) {
        return [undefined, new Error('define(): argument list must consist of only variable names')];
      }
    }

    context.topScope().funcs[funName] = async (context: EvalContext, callArgs: Expr[]) => {
      const scope: EvalScope = {
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
        const [_, err] = await context.evalExpr(stmt);
        if (err) {
          return [undefined, err];
        }
      }
      context.popScope();

      return [undefined, null];
    };

    return [undefined, null];
  },

  list: async (context: EvalContext, args: Expr[]) => {
    return [new Expr(ExprType.ExprFuncall, undefined, undefined, undefined, new Funcall('list', args)), null];
  },
  for: async (context: EvalContext, args: Expr[]) => {
    if (args.length < 2) {
      return [undefined, new Error('for() expects at least 2 arguments')];
    }

    if (args[0].type !== ExprType.ExprVar) {
      return [undefined, new Error('First arg of for() must be variable')];
    }
    const varName: string = args[0].asVar;

    const [list, error] = await context.evalExpr(args[1]);

    if (error || list === undefined) {
      return [undefined, error];
    }

    if (list.type !== ExprType.ExprFuncall || list.asFuncall?.name !== 'list') {
      return [undefined, new Error('Second arg of for() must be a list')];
    }

    const scope: EvalScope = {
      vars: {},
      funcs: {}
    };

    for (const arg of list.asFuncall.args) {
      scope.vars[varName] = arg;
    }

    context.pushScope(scope);
    for (const expr of args) {
      const [, err] = await context.evalExpr(expr);
      if (err instanceof Error) {
        return [undefined, err];
      }
    }
    context.popScope();

    return [undefined, null];
  },
  http: async (context: EvalContext, args: Expr[]) => {
    const url: string[] = [];

    for (const arg of args) {
      const [val, error] = await context.evalExpr(arg);
      if (error || val === undefined) {
        return [undefined, error];
      }
      if (val.type !== ExprType.ExprStr) {
        return [undefined, new Error('http() expects its arguments to be strings')];
      }
      url.push(val.asStr);
    }

    const resp = await axios.get(url.join(''));
    const body = await resp.data;

    return [new Expr(ExprType.ExprStr, undefined, body, undefined, undefined), null];
  }
};
