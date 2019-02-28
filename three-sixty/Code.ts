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
  const lastr = lastRow(sheet)
  const lastc = lastColumn(sheet)
  return sheet.getRange(2, 2, lastr, lastc).getValues()
}

const getPersonData = (name: string, data: Object[][]): Object[][] =>
  data.filter(i => name === i[0])

function logger() {
  Logger.log(getPersonData("Andrew", getFeedbackData()))
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}
