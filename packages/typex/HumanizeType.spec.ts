import { HumanizeType } from './HumanizeType';
import { IType } from './index';
import { describe, expect, it } from 'vitest';

enum Tag {
  TagDoesNotExist = '02760402797344eda348d64f408d8478',
  TagSaved = 'da162e6ca8ef4cbc963654f6f3885470',
  TagDeleted = 'eb118feaa789469d8ec1bf20fecb6200',
  DbError = 'f116ee68309941688ececa9c9e75588f',
}

type ITag =
  | IType<{
      type: Tag.TagSaved;
      tag: {
        id: string;
        name: string;
      };
    }>
  | IType<{
      type: Tag.TagDeleted;
      tagId: string;
    }>
  | IType<{
      type: Tag.TagDoesNotExist;
      tagId: string;
    }>;

describe(HumanizeType.name, () => {
  it('should return the human type of an event', () => {
    const humanizeType = HumanizeType({
      Tag,
    });

    const event: ITag = {
      type: Tag.TagSaved,
      tag: {
        id: '1',
        name: 'tag',
      },
    };

    expect(event).toEqual({
      type: 'da162e6ca8ef4cbc963654f6f3885470',
      tag: {
        id: '1',
        name: 'tag',
      },
    });

    const result = humanizeType(event);

    expect(result).toEqual({
      type: 'da162e6ca8ef4cbc963654f6f3885470',
      type_: 'Tag.TagSaved',
      tag: {
        id: '1',
        name: 'tag',
      },
    });
  });
  it('should return the human type of an error', () => {
    const error = new Error('woops');
    // @ts-ignore
    error.type = Tag.DbError;

    const humanizeType = HumanizeType({
      Tag,
    });

    const result = humanizeType(error);
    expect(result).toBeInstanceOf(Error);
    expect(JSON.parse(JSON.stringify(result))).toEqual({
      name: 'Error',
      type: 'f116ee68309941688ececa9c9e75588f',
      type_: 'Tag.DbError',
    });
  });
  it('should return the human type of an array', () => {
    const humanizeType = HumanizeType({
      Tag,
    });

    const array: ITag[] = [
      {
        type: Tag.TagSaved,
        tag: {
          id: '1',
          name: 'tag',
        },
      },
      {
        type: Tag.TagDeleted,
        tagId: '1',
      },
    ];

    const result = humanizeType(array);
    expect(result).toEqual([
      {
        tag: {
          id: '1',
          name: 'tag',
        },
        type: 'da162e6ca8ef4cbc963654f6f3885470',
        type_: 'Tag.TagSaved',
      },
      {
        tagId: '1',
        type: 'eb118feaa789469d8ec1bf20fecb6200',
        type_: 'Tag.TagDeleted',
      },
    ]);
  });
  it('should return the human type of a nested object', () => {
    const humanizeType = HumanizeType({
      Tag: Tag,
    });

    const event: ITag = {
      type: Tag.TagSaved,
      tag: {
        id: '1',
        name: 'tag',
      },
    };

    const result = humanizeType({
      nestedObject: {
        event,
      },
    });

    expect(result).toEqual({
      nestedObject: {
        event: {
          tag: {
            id: '1',
            name: 'tag',
          },
          type: 'da162e6ca8ef4cbc963654f6f3885470',
          type_: 'Tag.TagSaved',
        },
      },
    });
  });
  it('should return the human type of a nested array', () => {
    const humanizeType = HumanizeType({
      Tag,
    });

    const event: ITag = {
      type: Tag.TagSaved,
      tag: {
        id: '1',
        name: 'tag',
      },
    };

    const result = humanizeType({
      nestedArray: [event],
    });

    expect(result).toEqual({
      nestedArray: [
        {
          tag: {
            id: '1',
            name: 'tag',
          },
          type: 'da162e6ca8ef4cbc963654f6f3885470',
          type_: 'Tag.TagSaved',
        },
      ],
    });
  });
  it('should return the human type of a nested error', () => {
    const error = new Error('woops');
    // @ts-ignore
    error.type = Tag.DbError;

    const humanizeType = HumanizeType({
      Tag,
    });

    const result = humanizeType({
      nestedError: error,
    });

    expect(JSON.parse(JSON.stringify(result))).toEqual({
      nestedError: {
        name: 'Error',
        type: 'f116ee68309941688ececa9c9e75588f',
        type_: 'Tag.DbError',
      },
    });
  });
});
