const VALUES: string[] = [
  'Execution',
  'Consistency',
  'Quality',
  'Design & Architecture',
  'Problem Solving',
  'Curiosity',
  'Accountability',
  'Communication',
  'Delivery',
  'Grit',
  'People Orientation',
  'Emotional Intelligence',
  'Craft',
  'Purpose',
]
const VALUE_MAPPING: { [s: string]: number }  = {
  "are smashing it": 3,
  "are spot on": 2,
  "have room to do more": 1
}

const getProperty = (propertyName: string): string =>
  PropertiesService.getScriptProperties().getProperty(propertyName)

const sheet = (id: string) =>
  SpreadsheetApp
    .openById(id)
    .getSheetByName("Sheet1")

const sheetData = (sheet): string[][] =>
  sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues()

const coreValues = (data: string[][]): string[][] =>
  data.map(datum =>
    datum.slice(2, -2))

const sustains = (data: string[][]): string[] =>
  data.reduce((res, datum) =>
    [...res, ...datum.slice(-2, -1)], [])

const improvements = (data: string[][]): string[] =>
  data.reduce((res, datum) =>
    [...res, ...datum.slice(-1)], [])

const valueToNumeric = (data: string[][]): number[][]=> {
  return data.map(datum =>
    datum.map((item: string, i: number) => {
      const withoutEmoji: string = item.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
      return VALUE_MAPPING[withoutEmoji]
    })
  )
}

const dataToChartValues = (data: number[]) =>
  data.map((n, i) =>
    ({value: VALUES[i], result: n}))

const numericMatrixToAverage = (data) => {
  const sum = data.slice(1).reduce((res, datum) =>
    datum.map((n, i) =>
      n + res[i]
    ), data[0]
  )
  return sum.map(n => n / data.length)
}

const createPayload = (personalData: string[][], teamData: string[][], name: string) => {
  const personWithoutHeaders = personalData.slice(1)
  const teamWithoutHeaders = teamData.slice(1)
  const personCore = coreValues(personWithoutHeaders)
  const personNumeric = valueToNumeric(personCore)
  // TODO implement for multiple rounds of feedback remove final [0]
  const oneRound = personNumeric[0]
  const personChartValues = dataToChartValues(oneRound)
  const personSustains = sustains(personWithoutHeaders)
  const personImprovements = improvements(personWithoutHeaders)
  const teamCore = coreValues(teamWithoutHeaders)
  const teamNumeric = valueToNumeric(teamCore)
  const teamAverage = numericMatrixToAverage(teamNumeric)
  const teamChartValues = dataToChartValues(teamAverage)
  const teamSustains = sustains(teamWithoutHeaders)
  const teamImprovements = improvements(teamWithoutHeaders)
  const payload = {
    individual: {
      values: personChartValues
    },
    team: {
      values: teamChartValues
    },
    name: name,
    sustain: [...personSustains, ...teamSustains],
    improve: [...personImprovements, ...teamImprovements]
  }
  return payload
}

function getFeedbackData (name: string) {
  const master = sheet(getProperty('MASTER_SPREADSHEET_ID'))
  // TODO enable multiple rounds of feedback and remove final [0]
  const personMetadata = sheetData(master).filter(datum => datum[0] === name)[0]
  const personalResults = sheetData(sheet(personMetadata[1]))
  const teamResults = sheetData(sheet(personMetadata[2]))
  const payload = createPayload(personalResults, teamResults, name)
  return payload
}

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}

// For development
function logger() {
  Logger.log("test")
}
