import { Container, ContainerFactory, ContainerService } from './container';

import { expect, test, vi, it } from 'vitest';

test('Container', async () => {
  const box = Container<{ boxName: string }>({
    boxName: 'box1',
  });

  expect(box.boxName).toEqual('box1');
});

test('Container service', async () => {
  let counter = 0;
  type IContainerShape = { boxName: string; dependencyName: string };
  const container = Container<IContainerShape>({
    boxName: ContainerService(
      (container) => `box1/${container.dependencyName}/counter-${counter++}`,
    ),
    dependencyName: ContainerService(() => `dependency-A`),
  });

  expect(container.boxName).toEqual('box1/dependency-A/counter-0');
  expect(container.boxName).toEqual('box1/dependency-A/counter-0');
  expect(container.boxName).toEqual('box1/dependency-A/counter-0');
});

test('Container factory', async () => {
  let counter = 0;
  let dependencyCounter = 0;

  const container = Container<{ boxName: string; dependencyName: string }>({
    boxName: ContainerFactory(
      (box) => `box1/${box.dependencyName}/counter-${counter++}`,
    ),
    dependencyName: ContainerFactory(
      () => `dependency-A-${dependencyCounter++}`,
    ),
  });

  expect(container.boxName).toEqual('box1/dependency-A-0/counter-0');
  expect(container.boxName).toEqual('box1/dependency-A-1/counter-1');
  expect(container.boxName).toEqual('box1/dependency-A-2/counter-2');
});
