import type { Expr } from './lib/expression';
import { parseAllExprs } from './lib/parser';
import type { EvalScope } from './lib/scoping';
import { EvalContext } from './lib/scoping';

export const parse = (code: string) => {
  const formattedCode = code.replace(/\r?\n|\r/g, ''); // Remove newlines
  const [exprs, err] = parseAllExprs(formattedCode);

  if (err !== null) {
    throw err;
  }

  return exprs;
};

export const evaluate = (exprs: Expr[], scope?: EvalScope) => {
  const context = new EvalContext(scope);
  const results = exprs.map((expr) => context.evalExpr(expr));

  return Promise.all(results);
};
