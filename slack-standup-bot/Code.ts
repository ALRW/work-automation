// Get an environment variable.
const getProperty = (propertyName: string) =>
  PropertiesService.getScriptProperties().getProperty(propertyName)

// Gets the team calendar based on the calendar name.
const getCalendar = () => {
  const calName = getProperty("CALENDAR_NAME")
  return CalendarApp.getCalendarsByName(calName)[0]
}

// Calculates people who will be out of office the next day.
function getPeopleOOOForNextDay() {
  const today = new Date()
  const tomorrow = new Date(today.setDate(today.getDate() +1))
  const events = getCalendar().getEventsForDay(tomorrow)
  const eventsOfInterest = events.filter(function (event) {
    const title = event.getTitle()
    const titlesOfInterest = ["OOO", "WFH", "PTO", "AL"];
    return titlesOfInterest.some(function (t) {
      return title.indexOf(t) !== -1
    })
  })
  const peopleOfInterest = eventsOfInterest.map(function(e){return e.getCreators()[0]})
  return peopleOfInterest.map(function(p) { return p.substr(0, p.indexOf('@')) })
}

// Get the team sheet from the requested spreadsheet.
const getTeamSheet = () =>
  SpreadsheetApp.openById(getProperty("SPREADSHEET_ID")).getSheetByName("team")

// Select an item from a list at random.
const selectAtRandom = (list: Array<object>) =>
  list[Math.floor(Math.random() * list.length)]

// Get the team from the spreadsheet; 
// get the people who will be OOO from calendar; 
// select a person at random from those who are in.
const selectPerson = () => {
  const allPeople: Array<string> = getTeamSheet().getDataRange().getValues().map(p => p[0])
  const peopleOOO = getPeopleOOOForNextDay()
  const people = allPeople.filter(p => peopleOOO.indexOf(p) === -1)
  return selectAtRandom(people)
}

// Send a message to a particular slack channel.
const sendMessage = () => {
  const payload: object = {
    "channel": getProperty("SLACK_CHANNEL_NAME"),
    "username": "Bear Bot",
    "icon_emoji": ":trollparrot:",
    "link_names": 1,
    "text": "The master of ceremonies for the next standup is: @" + selectPerson()
  }
  const url: string = getProperty("SLACK_INCOMING_URL")
  const options: object = {
    "method": "post",
    "payload": JSON.stringify(payload)
  }
  UrlFetchApp.fetch(url, options)
}

// Programatically set applications triggers to run the 'sendMessage' function;
// This can be setup manually so this is more documentation than anything else
function createTriggers() {
   const days = [ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY,
               ScriptApp.WeekDay.WEDNESDAY, ScriptApp.WeekDay.THURSDAY];
   for (var i=0; i<days.length; i++) {
      ScriptApp.newTrigger("sendMessage")
               .timeBased().onWeekDay(days[i])
               .atHour(11).create();
   }
}
