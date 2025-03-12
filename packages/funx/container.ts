export const ContainerDefinitionSymbol = Symbol('ContainerDefinitionSymbol');

const TYPE_SERVICE = 'service';
const TYPE_FACTORY = 'factory';

export type IContainerServiceDefinition<Shape, ReturnType = void> = {
  type: typeof TYPE_SERVICE;
  factory: (box: Shape) => ReturnType;
  [ContainerDefinitionSymbol]: true;
};
export type IContainerFactoryDefinition<Shape, ReturnType = void> = {
  type: typeof TYPE_FACTORY;
  factory: (box: Shape) => ReturnType;
  [ContainerDefinitionSymbol]: true;
};

export type IContainerDefinition<Shape, ReturnType> =
  | IContainerServiceDefinition<Shape, ReturnType>
  | IContainerFactoryDefinition<Shape, ReturnType>;

export type IContainerSpecDefinition<Shape, ReturnType> =
  | ReturnType
  | IContainerDefinition<Shape, ReturnType>;

export type IContainerSpec<Shape extends object> = {
  [P in keyof Shape]: IContainerSpecDefinition<Shape, Shape[P]>;
};

export function isContainerDefinition(
  definition: IContainerSpecDefinition<any, any>,
): boolean {
  return definition instanceof Object && definition[ContainerDefinitionSymbol];
}

export function ContainerService<Shape = any, ReturnType = void>(
  creator: (box: Shape) => ReturnType,
): IContainerServiceDefinition<Shape, ReturnType> {
  let called = false;
  let cachedValue: any = undefined;

  return {
    type: TYPE_SERVICE,

    factory: (box) => {
      if (called) {
        return cachedValue;
      }

      called = true;
      cachedValue = creator(box);

      return cachedValue;
    },

    [ContainerDefinitionSymbol]: true,
  };
}

export function ContainerFactory<Shape = any, ReturnType = void>(
  creator: (box: Shape) => ReturnType,
): IContainerFactoryDefinition<Shape, ReturnType> {
  return {
    type: TYPE_FACTORY,
    factory: creator,
    [ContainerDefinitionSymbol]: true,
  };
}

export function Container<Shape extends object>(
  containerSpec: IContainerSpec<Shape>,
): Shape {
  const box: any = new Proxy<IContainerSpec<Shape>>(containerSpec, {
    get: (target, prop) => {
      if (prop in target) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const value: any = target[prop];

        if (isContainerDefinition(value)) {
          return (value as IContainerDefinition<any, any>).factory(box);
        } else {
          return value;
        }
      } else {
        throw new Error(`No value: "${String(prop)}"`);
      }
    },
  });

  return box as Shape;
}
