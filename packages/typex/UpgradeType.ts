import { IPromise, IType, IUseType } from './index';

export type IUpgradeTypeFunction<
  Versions extends IType,
  TargetVersion extends Versions['type'],
> = (type: Versions) => IPromise<IUseType<Versions, TargetVersion>>;

export type IUpgradeTypeConfigurationChain<
  Config extends Readonly<{
    AllVersions: IType;
    TargetVersion: IType;

    NextVersionToUpgrade: string;
    NextVersionsToOutput: string;
  }>,
> = Readonly<{
  take: ITake<{
    VersionsToTake: Config['AllVersions'];
    TargetVersion: Config['TargetVersion'];
  }>;
  upgrade: IUpgrade<{
    AllVersions: Config['AllVersions'];
    TargetVersion: Config['TargetVersion'];
    NextVersionToUpgrade: Config['NextVersionToUpgrade'];
    NextVersionsToOutput: Config['NextVersionsToOutput'];
  }>;
}>;

export type IUpgradeType<
  Config extends Readonly<{
    AllVersions: IType;
    TargetVersion: IType;

    NextVersionToUpgrade: string;
    NextVersionsToOutput: string;
  }>,
> = Config['NextVersionsToOutput'] extends never
  ? IUpgradeTypeFunction<Config['AllVersions'], Config['NextVersionToUpgrade']>
  : ((input: `UpgradeType:${Config['NextVersionToUpgrade']}`) => never) &
      IUpgradeTypeConfigurationChain<Config>;

type ITake<
  Config extends Readonly<{
    VersionsToTake: IType;
    TargetVersion: IType;
  }>,
> = <Type extends Config['VersionsToTake']['type']>(
  type: Type,
) => IUpgradeType<{
  AllVersions: Config['VersionsToTake'];
  TargetVersion: Config['TargetVersion'];
  NextVersionToUpgrade: Type;
  NextVersionsToOutput: Exclude<Config['VersionsToTake']['type'], Type>;
}>;

type IUpgrade<
  Config extends Readonly<{
    AllVersions: IType;
    TargetVersion: IType;
    NextVersionToUpgrade: string;
    NextVersionsToOutput: string;
  }>,
> = <
  FromType extends Config['NextVersionToUpgrade'],
  ToType extends Config['NextVersionsToOutput'],
  Output extends ToType,
>(
  from: FromType,
  to: ToType,
  upgrade: (
    input: IUseType<Config['AllVersions'], FromType>,
  ) => IPromise<IUseType<Config['AllVersions'], Output>>,
) => IUpgradeType<{
  AllVersions: Config['AllVersions'];
  TargetVersion: Config['TargetVersion'];

  NextVersionToUpgrade: Output;
  NextVersionsToOutput: Exclude<
    Config['NextVersionsToOutput'],
    FromType | ToType | Output
  >;
}>;

type ITargetVersion<
  Versions extends IType,
  TargetVersion extends Versions['type'] | Versions,
> = TargetVersion extends IType ? TargetVersion['type'] : TargetVersion;

type IUpgradeTypeOutput<
  Versions extends IType,
  TargetVersion extends Versions['type'] | Versions,
> = IUpgradeType<{
  AllVersions: Versions;
  TargetVersion: IUseType<Versions, ITargetVersion<Versions, TargetVersion>>;
  NextVersionToUpgrade: Versions['type'];
  NextVersionsToOutput: Versions['type'];
}>;

type IMigrationRegistry<Versions extends IType> = {
  [Type in Versions['type']]?: (
    input: IUseType<Versions, Type>,
  ) => IPromise<Versions>;
};

export function UpgradeType<
  Versions extends IType,
  TargetVersion extends Versions['type'] | Versions,
>(
  targetVersion: ITargetVersion<Versions, TargetVersion>,
  { maxIterations = 100_000 }: Partial<{ maxIterations: number }> = {},
): IUpgradeTypeOutput<Versions, TargetVersion> {
  const registry: IMigrationRegistry<Versions> =
    {} as IMigrationRegistry<Versions>;

  const chain: IUpgradeTypeConfigurationChain<{
    AllVersions: Versions;
    TargetVersion: IUseType<Versions, ITargetVersion<Versions, TargetVersion>>;
    NextVersionToUpgrade: Versions['type'];
    NextVersionsToOutput: Versions['type'];
  }> = {
    take: (type) => {
      registry[type] = async (input) => {
        return input as any;
      };
      return mapper as any;
    },
    upgrade: (from, to, upgrade) => {
      registry[from] = upgrade;
      return mapper as any;
    },
  };

  const mapper: IUpgradeTypeFunction<
    Versions,
    ITargetVersion<Versions, TargetVersion>
  > = async (input) => {
    let _input = input;
    let iterations = 0;
    while (iterations < maxIterations) {
      iterations += 1;

      if (_input && 'type' in _input) {
        const handler = registry[_input.type as Versions['type']];

        if (handler) {
          const output = await handler(_input as any);
          if (output.type === targetVersion) {
            return output as IUseType<
              Versions,
              ITargetVersion<Versions, TargetVersion>
            >;
          }
          if (_input.type === output.type && output.type !== targetVersion) {
            throw new Error(
              `${UpgradeType.name}/InvalidUpgrade:${JSON.stringify({
                input: _input,
                output,
                targetVersion,
                inputType: _input.type,
                outputType: output.type,
              })}`,
            );
          } else {
            _input = output;
          }
        } else {
          if (input.type === targetVersion) {
            return input as IUseType<
              Versions,
              ITargetVersion<Versions, TargetVersion>
            >;
          } else {
            throw new Error(
              `${UpgradeType.name}/NoUpgradeFunction:${JSON.stringify(_input.type)}`,
            );
          }
        }
      } else {
        throw new Error(
          `${UpgradeType.name}/InvalidInput:${JSON.stringify(_input)}`,
        );
      }
    }

    throw new Error(
      `${UpgradeType.name}/ExceededNumberOfIterations:${JSON.stringify({ iterations, input })}`,
    );
  };

  return Object.assign(mapper, chain) as unknown as IUpgradeTypeOutput<
    Versions,
    TargetVersion
  >;
}

export type IUpgradedType<
  AllVersions extends IType,
  TargetType extends AllVersions['type'],
> = IUseType<AllVersions, TargetType>;
