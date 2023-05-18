export function dateTimeFormatter(date: Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short" }).format();
}

const pluralRule = new Intl.PluralRules();
export function getPlural(value: number, singular: string, plural: string) {
  return pluralRule.select(value) === "one" ? singular : plural;
}