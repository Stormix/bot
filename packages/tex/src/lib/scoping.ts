import type { Expr, Func } from './expression';
import { ExprType } from './expression';

export interface EvalScope {
  vars: { [key: string]: Expr };
  funcs: { [key: string]: Func };
}

export class EvalContext {
  scopes: EvalScope[] = [];

  lookUpVar(name: string): [Expr | undefined, boolean] {
    const scopes = this.scopes;
    for (let i = scopes.length - 1; i >= 0; i--) {
      const varr = scopes[i].vars[name];
      if (varr !== undefined) {
        return [varr, true];
      }
    }
    return [undefined, false];
  }

  lookUpFunc(name: string): [Func | undefined, boolean] {
    const scopes = this.scopes;
    for (let i = scopes.length - 1; i >= 0; i--) {
      const fun = scopes[i].funcs[name];
      if (fun !== undefined) {
        return [fun, true];
      }
    }
    return [undefined, false];
  }

  pushScope(scope: EvalScope): void {
    this.scopes.push(scope);
  }

  popScope(): void {
    if (this.scopes.length === 0) {
      throw new Error('No scopes found');
    }
    this.scopes.pop();
  }

  topScope(): EvalScope {
    if (this.scopes.length === 0) {
      throw new Error('No scopes found');
    }
    return this.scopes[this.scopes.length - 1];
  }

  async evalExpr(expr: Expr): Promise<[Expr | undefined, Error | null]> {
    switch (expr.type) {
      case ExprType.ExprVoid:
      case ExprType.ExprInt:
      case ExprType.ExprStr:
        return [expr, null];
      case ExprType.ExprVar:
        const [val, ok] = this.lookUpVar(expr.asVar!);
        if (!ok) {
          return [undefined, new Error(`Unknown variable '${expr.asVar!}'`)];
        }
        return this.evalExpr(val as Expr);
      case ExprType.ExprFuncall:
        const [fun, found] = this.lookUpFunc(expr.asFuncall?.name as string);
        if (!found) {
          return [undefined, new Error(`Unknown function '${expr.asFuncall?.name}'`)];
        }
        return await fun!(this, expr.asFuncall?.args ?? []);
      default:
        throw new Error('unreachable');
    }
  }
}
