import {
  trimBracketContents,
  trimBracketDate,
  trimBracketTime,
} from "./string";

describe.each`
  str                      | expected
  ${"hoge (9:00)"}         | ${"hoge"}
  ${"hoge(9:00)"}          | ${"hoge"}
  ${"hoge (13:35)"}        | ${"hoge"}
  ${"hoge (huga) (13:35)"} | ${"hoge"}
  ${"hoge (huga)(13:35)"}  | ${"hoge"}
  ${"hoge(huga)(13:35)"}   | ${"hoge"}
`("trimBracketContents", ({ str, expected }) => {
  test(`${str} -> ${expected}`, () =>
    expect(trimBracketContents(str)).toBe(expected));
});

describe.each`
  str                            | expected
  ${"hoge (9:00)"}               | ${"hoge"}
  ${"hoge(9:00)"}                | ${"hoge"}
  ${"hoge (13:35)"}              | ${"hoge"}
  ${"hoge (huga) (13:35)"}       | ${"hoge (huga)"}
  ${"hoge (huga)(13:35)"}        | ${"hoge (huga)"}
  ${"hoge(huga)(13:35)"}         | ${"hoge(huga)"}
  ${"hoge (9:00-)"}              | ${"hoge"}
  ${"hoge (13:35-)"}             | ${"hoge"}
  ${"hoge (huga) (13:35-)"}      | ${"hoge (huga)"}
  ${"hoge (9:00-10:00)"}         | ${"hoge"}
  ${"hoge (13:35-14:30)"}        | ${"hoge"}
  ${"hoge (huga) (13:35-14:30)"} | ${"hoge (huga)"}
`("trimBracketTime", ({ str, expected }) => {
  test(`${str} -> ${expected}`, () =>
    expect(trimBracketTime(str)).toBe(expected));
});

describe.each`
  str                     | expected
  ${"hoge [x1/6]"}        | ${"hoge"}
  ${"hoge [x01/6]"}       | ${"hoge"}
  ${"hoge [x1/06]"}       | ${"hoge"}
  ${"hoge [x01/06]"}      | ${"hoge"}
  ${"hoge [x2019/1/6]"}   | ${"hoge"}
  ${"hoge [x2019/01/6]"}  | ${"hoge"}
  ${"hoge [x2019/1/06]"}  | ${"hoge"}
  ${"hoge [x2019/01/06]"} | ${"hoge"}
  ${"hoge[x1/6]"}         | ${"hoge"}
  ${"hoge (hoge) [x1/6]"} | ${"hoge (hoge)"}
  ${"hoge [x1/6] (hoge)"} | ${"hoge (hoge)"}
  ${"hoge [01/06]"}       | ${"hoge [01/06]"}
  ${"hoge (hoge) [hoge]"} | ${"hoge (hoge) [hoge]"}
`("trimBracketDate", ({ str, expected }) => {
  test(`${str} -> ${expected}`, () =>
    expect(trimBracketDate(str)).toBe(expected));
});
