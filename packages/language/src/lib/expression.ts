import type { EvalContext } from './scoping';

export enum ExprType {
  ExprVoid,
  ExprInt,
  ExprStr,
  ExprVar,
  ExprFuncall
}

export class Funcall {
  name: string;
  args: Expr[];

  constructor(name?: string, args?: Expr[]) {
    this.name = name ?? '';
    this.args = args ?? [];
  }

  toString() {
    return `${this.name}(${this.args.join(', ')})`;
  }
}

export class Expr {
  type: ExprType = ExprType.ExprVoid;
  asInt: number;
  asStr: string;
  asVar: string;
  asFuncall: Funcall | undefined = undefined;

  constructor(type?: ExprType, asInt?: number, asStr?: string, asVar?: string, asFuncall?: Funcall) {
    this.type = type ?? ExprType.ExprVoid;
    this.asInt = asInt ?? -1;
    this.asStr = asStr ?? '';
    this.asVar = asVar ?? '';
    this.asFuncall = asFuncall;
  }

  dump(level = 0) {
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
        console.log(`Funcall: ${this.asFuncall?.name}`);
        for (const arg of this.asFuncall?.args ?? []) {
          arg.dump(level + 1);
        }
        break;
    }
  }

  toString() {
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
        return `Funcall: ${this.asFuncall?.toString()}`;
      default:
        throw new Error('unreachable');
    }
  }
}

export type Func = (context: EvalContext, args: Expr[]) => Promise<[Expr | undefined, Error | null]>;
