const getProperty = (propertyName: string): string =>
  PropertiesService.getScriptProperties().getProperty(propertyName)

const selectAtRandom = (list: string[]): string =>
  list[Math.floor(Math.random() * list.length)]

const todayOrTomorrow = (forToday: boolean): Date => {
  const today: Date = new Date()
  const offset: number = today.getDay() === 5 ? 3 : 1
  const day = forToday ? today.getDate() : today.getDate() + offset
  return new Date(today.setDate(day))
}

const calendarEvents = (titlesOfInterest: string[], forToday: boolean) =>
  CalendarApp
    .getCalendarsByName(getProperty("CALENDAR_NAME"))[0]
    .getEventsForDay(todayOrTomorrow(forToday))
    .filter(event => titlesOfInterest.some(t => event.getTitle().indexOf(t) !== -1))

const allPeople = (): string[] =>
  SpreadsheetApp
    .openById(getProperty("SPREADSHEET_ID"))
    .getSheetByName("team")
    .getDataRange()
    .getValues()
    .map(p => p[0].toString())

const absentPeople = (forToday: boolean): string[] => {
  const eventsOfInterest = calendarEvents(["OOO", "WFH", "PTO", "AL"], forToday)
  const peopleOfInterest: string[] = eventsOfInterest.map(e => e.getCreators()[0])
  return peopleOfInterest.map(p => p.substr(0, p.indexOf('@')))
}

const peopleInWork = (forToday: boolean): string[] => 
  allPeople().filter(p => absentPeople(forToday).indexOf(p) === -1)

const isStandup = (forToday: boolean): boolean =>
  calendarEvents([getProperty("STANDUP_EVENT_NAME")], forToday).length > 0

const tomorrowAsString = (): string =>
  ["Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"][todayOrTomorrow(false).getDay()]

const sendMessage = (message: string): void => {
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
  const person: string = selectAtRandom(peopleInWork(false))
  const message: string = `@${person}, congratulations you have been selected to run ${tomorrowAsString()}'s standup`
  isStandup(false) && sendMessage(message)
}

function dailyUpdate(): void {
  const person: string = selectAtRandom(peopleInWork(true))
  const message: string = `@${person}, a _salubrious_ opportunity has presented itself! The :bear: is back and has decided that you should tell the rest of the world about your team's exploits in #gpo-engineering`
  sendMessage(message)
}

function createTriggers (): void {
  const days = [ScriptApp.WeekDay.MONDAY,
    ScriptApp.WeekDay.TUESDAY,
    ScriptApp.WeekDay.WEDNESDAY,
    ScriptApp.WeekDay.THURSDAY,
    ScriptApp.WeekDay.FRIDAY]
  days.forEach(day => ScriptApp.newTrigger("dailyUpdate")
    .timeBased().onWeekDay(day)
    .atHour(15).create())
}
