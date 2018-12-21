const getProperty = (propertyName: string): string =>
  PropertiesService.getScriptProperties().getProperty(propertyName)

const selectAtRandom = (list: string[]): string =>
  list[Math.floor(Math.random() * list.length)]

const nextWorkingDay = (): Date => {
  const today: Date = new Date()
  const offset: number = today.getDay() === 5 ? 3 : 1
  return new Date(today.setDate(today.getDate() + offset))
}

const calendarEvents = (titlesOfInterest: string[]) =>
  CalendarApp
    .getCalendarsByName(getProperty("CALENDAR_NAME"))[0]
    .getEventsForDay(nextWorkingDay())
    .filter(event => titlesOfInterest.some(t => event.getTitle().indexOf(t) !== -1))

const allPeople = (): string[] =>
  SpreadsheetApp
    .openById(getProperty("SPREADSHEET_ID"))
    .getSheetByName("team")
    .getDataRange()
    .getValues()
    .map(p => p[0].toString())

const absentPeople = (): string[] => {
  const eventsOfInterest = calendarEvents(["OOO", "WFH", "PTO", "AL"])
  const peopleOfInterest: string[] = eventsOfInterest.map(e => e.getCreators()[0])
  return peopleOfInterest.map(p => p.substr(0, p.indexOf('@')))
}

const peopleInWork = (): string[] => 
  allPeople().filter(p => absentPeople().indexOf(p) === -1)

const isStandup = (): boolean =>
  calendarEvents(["Stand Up"]).length > 0

const tomorrowAsString = (): string =>
  ["Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"][nextWorkingDay().getDay()]

const sendMessage = (message): void => {
  const payload: object = {
    "channel": getProperty("SLACK_CHANNEL_NAME"),
    "username": "Bear Bot",
    "icon_emoji": ":bear:",
    "link_names": 1,
    "text": message   }
  const url: string = getProperty("SLACK_INCOMING_URL")
  const options: object = {
    "method": "post",
    "payload": JSON.stringify(payload)
  }
  UrlFetchApp.fetch(url, options)
}

function standup (): void {
  const person: string = selectAtRandom(peopleInWork())
  const message: string = `The master of ceremonies for ${tomorrowAsString()}'s standup is: @${person}`
  isStandup() && sendMessage(message)
}

function update (): void {
  const person: string = selectAtRandom(peopleInWork())
  const message: string = `@${person}, congratulations! You have been _randomly_ selected to give a quick update in #cc-engineering on the Barter Bears' activities today.`
  sendMessage(message)
}

function createTriggers (): void {
  const days = [ScriptApp.WeekDay.MONDAY,
    ScriptApp.WeekDay.TUESDAY,
    ScriptApp.WeekDay.WEDNESDAY,
    ScriptApp.WeekDay.THURSDAY,
    ScriptApp.WeekDay.FRIDAY]
  days.forEach(day => ScriptApp.newTrigger("sendMessage")
    .timeBased().onWeekDay(day)
    .atHour(10).create())
}
