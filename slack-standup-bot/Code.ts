const getProperty = (propertyName: string): string =>
  PropertiesService.getScriptProperties().getProperty(propertyName)

const selectAtRandom = (list: string[]): string =>
  list[Math.floor(Math.random() * list.length)]

const getWholeTeam = (): string[] =>
  SpreadsheetApp
    .openById(getProperty("SPREADSHEET_ID"))
    .getSheetByName("team")
    .getDataRange()
    .getValues()
    .map(p => p[0].toString())

const getAbsentTeamMembers = (): string[] => {
  const today: Date = new Date()
  const tomorrow: Date = new Date(today.setDate(today.getDate() +1))
  const events = CalendarApp
    .getCalendarsByName(getProperty("CALENDAR_NAME"))[0]
    .getEventsForDay(tomorrow)
  const eventsOfInterest = events.filter(event => {
    const title: string = event.getTitle()
    const titlesOfInterest: string[] = ["OOO", "WFH", "PTO", "AL"]
    return titlesOfInterest.some(t => title.indexOf(t) !== -1)
  })
  const peopleOfInterest: string[] = eventsOfInterest.map(e => e.getCreators()[0])
  return peopleOfInterest.map(p => p.substr(0, p.indexOf('@')))
}

const selectPerson = (): string => {
  const allPeople: string[] = getWholeTeam()
  const peopleOOO: string[] = getAbsentTeamMembers()
  const people: string[] = allPeople.filter(p => peopleOOO.indexOf(p) === -1)
  return selectAtRandom(people)
}

const tomorrow = (): string => {
  const today: Date = new Date()
  const tomorrow: number = new Date(today.setDate(today.getDate() + 1)).getDay()
  const workingDay: number = tomorrow === 6 ? 1 : tomorrow
  const days = ["Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"]
  return days[workingDay]
}

function sendMessage (): void {
  const payload: object = {
    "channel": getProperty("SLACK_CHANNEL_NAME"),
    "username": "Bear Bot",
    "icon_emoji": ":bear:",
    "link_names": 1,
    "text": "The master of ceremonies for " + tomorrow() + "'s standup is: @" + selectPerson()
  }
  const url: string = getProperty("SLACK_INCOMING_URL")
  const options: object = {
    "method": "post",
    "payload": JSON.stringify(payload)
  }
  UrlFetchApp.fetch(url, options)
}

const createTriggers = (): void => {
  const days = [ScriptApp.WeekDay.MONDAY,
    ScriptApp.WeekDay.TUESDAY,
    ScriptApp.WeekDay.WEDNESDAY,
    ScriptApp.WeekDay.THURSDAY,
    ScriptApp.WeekDay.FRIDAY]
  days.forEach(day => ScriptApp.newTrigger("sendMessage")
    .timeBased().onWeekDay(day)
    .atHour(10).create())
}
