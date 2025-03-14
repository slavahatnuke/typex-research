import { IType } from '@slavax/typex';
import { fastId } from '@slavax/funx/fastId';

import { IAppContext } from '@typex-reserach/app';

const userToken = `user-token-${fastId()}`;

export function AppContext(
  context: Partial<IAppContext> = {},
): IType<IAppContext> {
  return {
    type: 'AppContext',
    userToken: userToken,
    traceId: fastId(),
    ...context,
  };
}
