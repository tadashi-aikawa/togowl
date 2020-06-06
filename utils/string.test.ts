import {
  trimBracketContents,
  trimBracketDate,
  trimBracketTime,
  markdownToSlack,
} from "./string";

describe.each`
  str                      | expected
  ${"hoge (9:00)"}         | ${"hoge"}
  ${"hoge(9:00)"}          | ${"hoge(9:00)"}
  ${"hoge (13:35)"}        | ${"hoge"}
  ${"hoge (huga) (13:35)"} | ${"hoge"}
  ${"hoge (huga)(13:35)"}  | ${"hoge"}
  ${"hoge(huga)(13:35)"}   | ${"hoge(huga)(13:35)"}
`("trimBracketContents", ({ str, expected }) => {
  test(`${str} -> ${expected}`, () =>
    expect(trimBracketContents(str)).toBe(expected));
});

describe.each`
  str                            | expected
  ${"hoge (9:00)"}               | ${"hoge"}
  ${"hoge(9:00)"}                | ${"hoge(9:00)"}
  ${"hoge (13:35)"}              | ${"hoge"}
  ${"hoge (huga) (13:35)"}       | ${"hoge (huga)"}
  ${"hoge (huga)(13:35)"}        | ${"hoge (huga)(13:35)"}
  ${"hoge(huga)(13:35)"}         | ${"hoge(huga)(13:35)"}
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
  ${"hoge[x1/6]"}         | ${"hoge[x1/6]"}
  ${"hoge (hoge) [x1/6]"} | ${"hoge (hoge)"}
  ${"hoge [x1/6] (hoge)"} | ${"hoge (hoge)"}
  ${"hoge [01/06]"}       | ${"hoge [01/06]"}
  ${"hoge (hoge) [hoge]"} | ${"hoge (hoge) [hoge]"}
`("trimBracketDate", ({ str, expected }) => {
  test(`${str} -> ${expected}`, () =>
    expect(trimBracketDate(str)).toBe(expected));
});

describe.each`
  str                               | expected
  ${"http://hoge"}                  | ${"<http://hoge>"}
  ${"📙 http://hoge"}               | ${"📙 <http://hoge>"}
  ${"📙 http://hoge tail"}          | ${"📙 <http://hoge> tail"}
  ${"aaahttp://hoge"}               | ${"aaahttp://hoge"}
  ${"[title](http://hoge)"}         | ${"<http://hoge|title>"}
  ${"📙 [title](http://hoge)"}      | ${"📙 <http://hoge|title>"}
  ${"📙 [title](http://hoge) tail"} | ${"📙 <http://hoge|title> tail"}
  ${"(xxx)[title](http://hoge)"}    | ${"(xxx)<http://hoge|title>"}
  ${"(xxx) [title](http://hoge)"}   | ${"(xxx) <http://hoge|title>"}
  ${"[title](http://hoge)(xxx)"}    | ${"<http://hoge|title>(xxx)"}
  ${"[title](http://hoge) (xxx)"}   | ${"<http://hoge|title> (xxx)"}
`("markdownToSlack ", ({ str, expected }) => {
  test(`${str} -> ${expected}`, () =>
    expect(markdownToSlack(str)).toBe(expected));
});
