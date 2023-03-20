import type { CommandContext } from '@/types/command';
import { evaluate, parse } from '@bot/language';
import { Expr, ExprType } from '@bot/language/dist/lib/expression';
import type { EvalContext, EvalScope } from '@bot/language/dist/lib/scoping';

export default class BotLanguage {
  static async evaluate(code: string, commandContext: CommandContext) {
    const parsedExpressions = parse(code);

    const botScope: EvalScope = {
      vars: {
        author: new Expr(ExprType.ExprStr, undefined, commandContext.atAuthor),
        owner: new Expr(ExprType.ExprStr, undefined, commandContext.atOwner)
      },
      funcs: {
        say: async (context: EvalContext, args: Expr[]) => {
          let response = '';
          for (let i = 0; i < args.length; i++) {
            const [val, err] = await context.evalExpr(args[i]);
            if (err !== null) {
              return [undefined, err];
            }
            response = response + (val?.asStr as string);
          }
          await commandContext.adapter.send(commandContext, response);
          return [undefined, null];
        }
      }
    };
    return evaluate(parsedExpressions, botScope);
  }
}
