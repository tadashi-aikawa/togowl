import { toEmojiString, trimBracketContents, trimBracketDate, trimBracketTime, trimPrefixEmoji } from './string';

describe.each`
  str                      | expected
  ${'hoge (9:00)'}         | ${'hoge'}
  ${'hoge(9:00)'}          | ${'hoge'}
  ${'hoge (13:35)'}        | ${'hoge'}
  ${'hoge (huga) (13:35)'} | ${'hoge'}
  ${'hoge (huga)(13:35)'}  | ${'hoge'}
  ${'hoge(huga)(13:35)'}   | ${'hoge'}
`('trimBracketContents', ({ str, expected }) => {
  test(`${str} -> ${expected}`, () => expect(trimBracketContents(str)).toBe(expected));
});

describe.each`
  str                            | expected
  ${'hoge (9:00)'}               | ${'hoge'}
  ${'hoge(9:00)'}                | ${'hoge'}
  ${'hoge (13:35)'}              | ${'hoge'}
  ${'hoge (huga) (13:35)'}       | ${'hoge (huga)'}
  ${'hoge (huga)(13:35)'}        | ${'hoge (huga)'}
  ${'hoge(huga)(13:35)'}         | ${'hoge(huga)'}
  ${'hoge (9:00-)'}              | ${'hoge'}
  ${'hoge (13:35-)'}             | ${'hoge'}
  ${'hoge (huga) (13:35-)'}      | ${'hoge (huga)'}
  ${'hoge (9:00-10:00)'}         | ${'hoge'}
  ${'hoge (13:35-14:30)'}        | ${'hoge'}
  ${'hoge (huga) (13:35-14:30)'} | ${'hoge (huga)'}
`('trimBracketTime', ({ str, expected }) => {
  test(`${str} -> ${expected}`, () => expect(trimBracketTime(str)).toBe(expected));
});

describe.each`
  str                     | expected
  ${'hoge [x1/6]'}        | ${'hoge'}
  ${'hoge [x01/6]'}       | ${'hoge'}
  ${'hoge [x1/06]'}       | ${'hoge'}
  ${'hoge [x01/06]'}      | ${'hoge'}
  ${'hoge [x2019/1/6]'}   | ${'hoge'}
  ${'hoge [x2019/01/6]'}  | ${'hoge'}
  ${'hoge [x2019/1/06]'}  | ${'hoge'}
  ${'hoge [x2019/01/06]'} | ${'hoge'}
  ${'hoge[x1/6]'}         | ${'hoge'}
  ${'hoge (hoge) [x1/6]'} | ${'hoge (hoge)'}
  ${'hoge [x1/6] (hoge)'} | ${'hoge (hoge)'}
  ${'hoge [01/06]'}       | ${'hoge [01/06]'}
  ${'hoge (hoge) [hoge]'} | ${'hoge (hoge) [hoge]'}
`('trimBracketDate', ({ str, expected }) => {
  test(`${str} -> ${expected}`, () => expect(trimBracketDate(str)).toBe(expected));
});

describe.each`
  str                       | expected
  ${'hoge'}                 | ${'hoge'}
  ${':emoji: hoge'}         | ${'hoge'}
  ${' :emoji: hoge'}        | ${'hoge'}
  ${':emoji:hoge'}          | ${'hoge'}
  ${':emoji: hoge :emoji:'} | ${'hoge :emoji:'}
`('trimPrefixEmoji', ({ str, expected }) => {
  test(`${str} -> ${expected}`, () => expect(trimPrefixEmoji(str)).toBe(expected));
});

describe.each`
  str                    | expectedPattern
  ${':smile: good :+1:'} | ${/<img .+smile.+\/> good <img .+thumbsup.+\/>/}
`('toEmojiString', ({ str, expectedPattern }: { str: string; expectedPattern: string }) => {
  test(`toEmojiString(${str}) match ${expectedPattern}`, () => {
    expect(toEmojiString(str)).toMatch(expectedPattern);
  });
});
