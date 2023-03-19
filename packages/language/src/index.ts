import { standardLibrary } from "./lib/language";
import { parseAllExprs } from "./lib/parser";
import { EvalContext, EvalScope } from "./lib/scoping";

export const evaluate = (code: string, additionalScope?: EvalScope) => {
  const scope: EvalScope = {
    vars: {
      ...additionalScope?.vars
    },
    funcs: {
      ...standardLibrary,
      ...additionalScope?.funcs
    }
  };

  const context = new EvalContext(scope);
  const formattedCode = code.replace(/\r?\n|\r/g, ''); // Remove newlines
  const [exprs, err] = parseAllExprs(formattedCode);

  if (err !== null) {
    throw err;
  }

  const results = exprs.map((expr) => context.evalExpr(expr));

  return Promise.all(results);
}

