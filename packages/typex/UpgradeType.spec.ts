import { IType } from './index';
import { IUpgradedType, UpgradeType } from './UpgradeType';

import { describe, expect, it } from 'vitest';

type IUserVersions =
  | IType<{
      type: 'User';
      id: string;
      name: string;
    }>
  | IType<{
      type: 'UserV2';
      id: string;
      firstName: string;
      lastName: string;
    }>
  | IType<{
      type: 'UserV3';
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    }>
  | IType<{
      type: 'UserV4';
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    }>;

type IUser = IUpgradedType<IUserVersions, 'UserV4'>;

describe(UpgradeType.name, () => {
  it('works', async () => {
    const upgradeUser = UpgradeType<IUserVersions, IUser>('UserV4')
      .take('User')
      .upgrade('User', 'UserV2', async (user) => {
        const [firstName, lastName = ''] = user.name.split(' ');
        return {
          type: 'UserV2',
          id: user.id,
          firstName,
          lastName,
          // email: `${firstName
          //   .charAt(0)
          //   .toLowerCase()}.${lastName.toLowerCase()}@company.domain`,
        };
        // satisfies IUseType<IUserVersions, 'UserV3'>;
      })
      .upgrade('UserV2', 'UserV3', (input) => {
        return {
          type: 'UserV3',
          id: input.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email:
            `${input.firstName}.${input.lastName}@company.domain`.toLowerCase(),
        };
      })
      .upgrade('UserV3', 'UserV4', (input) => {
        return {
          type: 'UserV4',
          id: input.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: '123-456-7890',
        };
      });

    const user1: IUser = await upgradeUser({
      type: 'User',
      id: '1',
      name: 'John Doe',
    });

    expect(user1).toEqual({
      email: 'john.doe@company.domain',
      firstName: 'John',
      id: '1',
      lastName: 'Doe',
      phone: '123-456-7890',
      type: 'UserV4',
    });

    const user2: IUser = await upgradeUser({
      type: 'UserV2',
      id: '2',
      firstName: `Jane`,
      lastName: `Does`,
    });

    expect(user2).toEqual({
      email: 'jane.does@company.domain',
      firstName: 'Jane',
      id: '2',
      lastName: 'Does',
      phone: '123-456-7890',
      type: 'UserV4',
    });
  });
});
