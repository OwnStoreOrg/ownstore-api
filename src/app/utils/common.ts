export const isEmptyObject = (object: object) => Object.keys(object).length === 0

export const prepareSEOKeywords = (keywords: string | null): string[] => {
  if (keywords) {
    return keywords.split(',')
  }
  return []
}

export const generateSlug = (title: string): string => {
  /*
    replace other than alpha numeric and hyphen characters with space
    replace spaces with hyphen
    repeated hyphen should be replaced by single
  */
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, ' ')
    .trim()
    .replace(/\s+/gi, '-')
}

export const fallbackDeciderForEmptyString = (val1: string | null, val2: string | null): string | null => {
  if (val1 === '<EMPTY>') return ''
  return val1 || val2
}

export const calculatePercentage = (percent: number, number: number, precision?: number | null) => {
  const _percent = (percent / 100) * number
  return precision ? Number(_percent.toFixed(precision)) : _percent
}

export const flattenList = (list: any[]): any[] => {
  return list.reduce((p, n) => p.concat(n), [])
}

export const uniqueList = (list: any[]): any[] => {
  return list.filter(function(item, pos) {
    return list.indexOf(item) == pos
  })
}
