const getProperty = (propertyName: string): string =>
  PropertiesService.getScriptProperties().getProperty(propertyName)

const getResultsSheet = () =>
  SpreadsheetApp
    .openById(getProperty("SPREADSHEET_ID"))
    .getSheetByName("Form responses 1")

const lastColumn = (sheet): number =>
  sheet.getLastColumn()

const lastRow = (sheet): number =>
  sheet.getLastRow()

const getFeedbackData = (): Object[][] => {
  const sheet = getResultsSheet()
  const lastr = lastRow(sheet)
  const lastc = lastColumn(sheet) - 1
  return sheet.getRange(1, 2, lastr, lastc).getValues()
}

const dataToTuples = (data: Object[][]): Object[][][] => {
  const headlines = data[0].map(s =>
    s.toString().substring(0, s.toString().indexOf('[')))
  return data.slice(1).map(datum =>
    datum.map((item, i) =>
      [headlines[i], item])
  )
}

const getPersonData = (name: string, data: Object[][][]): Object[][][] =>
  data.filter(datum => name === datum[0][1])

const cleanPersonData = (data: Object[][][]): string[][][] =>
  data.map(datum =>
    datum.map(tuple =>
      tuple.map(item =>
        item.toString().replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''))))

//currently an mvp hack
const sustainImprove = (data: string[][][]): string[] =>
  data[0].slice(-2).map(datum => datum[1])

//This currently drops the text fields and the initial name
const dataToNumeric = (data: string[][][]): string[][][] =>
  data.map(datum =>
    datum.slice(1).map(tuple => {
      const map = {
        "are smashing it": 3,
        "are spot on": 2,
        "have room to do more": 1
      }
      return [tuple[0], map[tuple[1]]]
    }))

//works for a single entry
const createDataArray = data =>
  data.slice(0, -2).map(([key, value]) =>
    ({value: key, result: value}))

function feedbackData(name) {
  const data = getFeedbackData()
  const tuples = dataToTuples(data)
  const person = getPersonData(name, tuples)
  const clean = cleanPersonData(person)
  const susImp = sustainImprove(clean)
  const numeric = dataToNumeric(clean)
  const dataArray = createDataArray(numeric[0])
  return ({body: {values: dataArray},
    name: name,
    sustain: susImp[0],
    improve: susImp[1]})
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
  const data = getFeedbackData()
  const tuples = dataToTuples(data)
  const person = getPersonData("Andrew", tuples)
  const clean = cleanPersonData(person)
  const susImp = sustainImprove(clean)
  const numeric = dataToNumeric(clean)
  const dataArray = createDataArray(numeric[0])
  Logger.log(susImp)
}
