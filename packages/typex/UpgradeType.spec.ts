import { IType, IUseType } from './index';
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
        };
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

    const user3 = await upgradeUser({
      email: 'jane.does@company.domain',
      firstName: 'Jane',
      id: '2',
      lastName: 'Does',
      phone: '123-456-7890',
      type: 'UserV4',
    });

    expect(user3).toEqual(user2);
  });
  it('edges 1', async () => {
    type IUser1 = IUseType<IUserVersions, 'User'>;
    const upgradeUser1 = UpgradeType<IUser1, IUser1>('User').take('User');

    const user1: IUser1 = await upgradeUser1({
      type: 'User',
      id: '1',
      name: 'John Doe',
    });

    expect(user1).toEqual({
      id: '1',
      name: 'John Doe',
      type: 'User',
    });

    type IUserVersions2 = IUseType<IUserVersions, 'User' | 'UserV2'>;
    type IUser2 = IUpgradedType<IUserVersions2, 'UserV2'>;

    const upgradeUser2 = UpgradeType<IUserVersions2, IUser2>('UserV2')
      .take('User')
      .upgrade('User', 'UserV2', (user) => {
        const [firstName, lastName = ''] = user.name.split(' ');
        return {
          type: 'UserV2',
          id: user.id,
          firstName,
          lastName,
        };
      });

    const user2: IUser2 = await upgradeUser2({
      type: 'User',
      id: '1',
      name: 'Jonny Doe',
    });

    expect(user2).toEqual({
      firstName: 'Jonny',
      id: '1',
      lastName: 'Doe',
      type: 'UserV2',
    });
  });
});
