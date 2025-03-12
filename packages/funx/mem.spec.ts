import { mem } from './mem';

test('mem', function () {
  let counter = 0;
  const m = mem(() => {
    counter++;
    return counter + 10;
  });
  m();
  m();
  m();
  const val = m();
  expect(counter).toEqual(1);
  expect(val).toEqual(11);
});

test('mem.reset', function () {
  let counter = 0;
  const m = mem(() => {
    counter++;
    return counter + 10;
  });
  m();
  const val = m();
  expect(counter).toEqual(1);
  expect(val).toEqual(11);

  m.reset();

  m();
  m();
  m();

  expect(counter).toEqual(2);
  expect(m()).toEqual(12);
});
