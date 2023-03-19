import { EndOfSource } from './errors';
import { Expr, ExprType, Funcall } from './expression';
import { isDigit, isLetter, spanRunes, trimRunes } from './utils';

export const parseExpr = (sourceRunes: string[]): [string[], Expr | undefined, Error | null] => {
  sourceRunes = trimRunes(sourceRunes);
  const expr = new Expr();

  if (sourceRunes.length > 0) {
    if (sourceRunes[0] === '"') {
      expr.type = ExprType.ExprStr;
      sourceRunes = sourceRunes.slice(1);
      // TODO: parseExpr does not support string escaping
      const [literalRunes, restRune] = spanRunes(sourceRunes, (rune) => rune !== '"');
      if (restRune.length <= 0 && restRune[0] !== '"') {
        return [[], expr, new Error('unterminated string, expected "')];
      }
      sourceRunes = restRune.slice(1);
      expr.asStr = literalRunes.join('');
      return [sourceRunes, expr, null];
    } else if (isDigit(sourceRunes[0])) {
      expr.type = ExprType.ExprInt;
      const [digits, restRunes] = spanRunes(sourceRunes, isDigit);
      sourceRunes = restRunes;
      const val: number = parseInt(digits.join(''), 10);
      if (isNaN(val)) {
        return [sourceRunes, new Expr(), new Error('Invalid number')];
      }
      expr.asInt = val;
      return [sourceRunes, expr, null];
    } else if (isLetter(sourceRunes[0])) {
      const [name, restRunes] = spanRunes(sourceRunes, isLetter);
      sourceRunes = trimRunes(restRunes);

      if (sourceRunes.length > 0 && sourceRunes[0] === '(') {
        expr.type = ExprType.ExprFuncall;
        expr.asFuncall = new Funcall();
        expr.asFuncall.name = name.join('');

        while (true) {
          sourceRunes = sourceRunes.slice(1);
          const [restRunes, arg, err] = parseExpr(sourceRunes);
          if (err) {
            return [restRunes, arg, err];
          }
          sourceRunes = restRunes;
          expr.asFuncall.args.push(arg as Expr);

          sourceRunes = trimRunes(sourceRunes);
          if (sourceRunes.length <= 0 || sourceRunes[0] !== ',') {
            break;
          }
        }

        if (sourceRunes.length <= 0 || sourceRunes[0] !== ')') {
          return [sourceRunes, expr, new Error('Expected )')];
        }

        return [sourceRunes.slice(1), expr, null];
      } else {
        expr.type = ExprType.ExprVar;
        expr.asVar = name.join('');
        return [sourceRunes, expr, null];
      }
    } else {
      return [sourceRunes, undefined, new Error(`Unexpected character ${sourceRunes[0]}`)];
    }
  }

  return [sourceRunes, undefined, EndOfSource];
};

export const parseAllExprs = (source: string): [Expr[], Error | null] => {
  let sourceRunes = source.split('');
  const exprs: Expr[] = [];

  while (true) {
    const results = parseExpr(sourceRunes);

    const [restRunes, expr, _] = results;
    let err = results[2];

    if (err !== null) {
      if (err === EndOfSource) {
        err = null;
      }
      return [exprs, err];
    }

    sourceRunes = restRunes;
    exprs.push(expr as Expr);
  }
};
