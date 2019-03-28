const getProperty = (propertyName: string): string =>
  PropertiesService.getScriptProperties().getProperty(propertyName)

const sheet = (id: string) =>
  SpreadsheetApp
    .openById(id)
    .getSheetByName('Form responses 1')

const sheetData = (sheet): string[][] =>
  sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues()

const getAllPeople = () => {
  const master = sheet(getProperty('MASTER_SPREADSHEET_ID'))
  const teamData = sheetData(master).slice(1).map(datum => {
    datum.splice(1, 2)
    datum[2] = FormApp.openById(datum[2]).getPublishedUrl()
    datum[3] = FormApp.openById(datum[3]).getPublishedUrl()
    return datum
  })
  return teamData
}

const emailBody = (name, personalFormUrl, teamMembers) =>
`Hi ${name}<br><br>It's that time again: to get your continuous improvement hat on and reflect on yourself over the last few weeks and months. As with anything the more you put into this the more you'll get out so please do go take a break, have a think and pour your thoughts into the following questions:<br><br><a href="${personalFormUrl}">Personal Reflection Questionaire</a><br><br>A crucial part of this process is also to have a think about the other members of your team and give them the same thoughtful feedback that you would like to receive. So could you answer the following questionaires for your team members:<br>${teamMembers.map(([pname, email, pFormUrl, teamFormUrl]) =>`<br><a href="${teamFormUrl}">${pname}'s feedback form</a><br>`)}<br>As a side note: please use your full name when answering the forms<br><br>If there are any issues then just let me know.<br>`

const sendEmail = (email, subject, body): void =>
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body
  })

const groupByTeam = data => data.reduce((teams, personData) => {
  const {6: teamName} = personData
  teamName in teams ? teams[teamName] = [...teams[teamName], personData] : teams[teamName] = [personData]
  return teams
}, {})

const teams = groupByTeam(getAllPeople())

const teamDetails = teamName => teams[teamName] || []

//TODO handle empty teamDetails array
function sendoutTeamFeedback(teamName): void {
  teamDetails(teamName)
  .forEach(([name, email, personalFormUrl, teamFormUrl], i, original) => {
    const restOfTeam = original.filter(([pname]) => pname !== name)
    const body = emailBody(name, personalFormUrl, restOfTeam)
    const subject = '360 Feedback'
    sendEmail(email, subject, body)
  })
}

function logger() {
  Logger.log('hello')
}
