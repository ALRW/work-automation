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

const teamDetails = () => {
  const master = sheet(getProperty('MASTER_SPREADSHEET_ID'))
  const teamData = sheetData(master).slice(1).map(datum => {
    datum.splice(1, 2)
    return datum
  })
  return teamData
}

function logger() {
  Logger.log('hello')
}
