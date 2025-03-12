import { matchLeftAndRightArrays } from './match-left-and-right-arrays';

test(matchLeftAndRightArrays.name, async () => {
  const values1: { id: string; name: string }[] = [
    { id: '1', name: 'John' },
    { id: '2', name: 'Mary' },
    { id: '3', name: 'XX' },
  ];
  const values2: { userId: string; lastName: string }[] = [
    { userId: '1', lastName: 'Smith' },
    { userId: '2', lastName: 'Doe' },
    { userId: '50', lastName: 'YY' },
  ];

  const result = matchLeftAndRightArrays(
    values1,
    values2,
    (left) => left.id,
    (right) => right.userId,
  );

  expect(result.unmatched.left).toEqual([{ id: '3', name: 'XX' }]);
  expect(result.unmatched.right).toEqual([{ userId: '50', lastName: 'YY' }]);

  expect(result.matched).toEqual([
    {
      left: { id: '1', name: 'John' },
      right: { userId: '1', lastName: 'Smith' },
    },
    {
      left: { id: '2', name: 'Mary' },
      right: { userId: '2', lastName: 'Doe' },
    },
  ]);

  expect(result).toEqual({
    matched: [
      {
        left: {
          id: '1',
          name: 'John',
        },
        right: {
          lastName: 'Smith',
          userId: '1',
        },
      },
      {
        left: {
          id: '2',
          name: 'Mary',
        },
        right: {
          lastName: 'Doe',
          userId: '2',
        },
      },
    ],
    unmatched: {
      left: [
        {
          id: '3',
          name: 'XX',
        },
      ],
      right: [
        {
          lastName: 'YY',
          userId: '50',
        },
      ],
    },
  });
});
