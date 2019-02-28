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

const getFeedbackData = () => {
  const sheet = getResultsSheet()
  const lastr = lastRow(sheet) - 1
  const lastc = lastColumn(sheet) - 1
  return sheet.getRange(2, 2, lastr, lastc).getValues()
}

const getPersonData = (name: string, data: Object[][]): Object[][] =>
  data.filter(datum => name === datum[0])

const cleanPersonData = (data: Object[][]): string[][] =>
  data.map(datum =>
    datum.map(item =>
    item.toString().replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')))

//This currently drops the text fields
const dataToNumeric = (data: string[][]): string[][] =>
  data.map(datum =>
    datum.slice(1).map(item => {
      const map = {
        "are smashing it": 3,
        "are spot on": 2,
        "have room to do more": 1
      }
      return map[item]
    }))

function logger() {
  const data = getPersonData("Andrew", getFeedbackData())
  const cleanData = cleanPersonData(data)
  Logger.log(dataToNumeric(cleanData))
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}
