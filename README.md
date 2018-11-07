# Work Automation

A repo to hold various pieces of ad-hoc workplace automation

## Contents

 - [Standup Slack-bot](#standup-slack-bot)

## Standup Slack Bot

This bot picks a random member of the team to run standup Tuesday to Friday each week and posts the selection to a designated team channel. It is setup to run in [google app scripts](https://script.google.com) and uses a google sheet as a pseudo database.

In order to run properly is required the following Script Properties to be specified:

 - `SLACK_INCOMING_URL` The url for a slack incoming webhook.
 - `SPREADSHEET_ID` The id of the google sheet holding all the team members names
 - `SLACK_CHANNEL_NAME` The name of the channel to publish message to
 - `CALENDAR_NAME` The name of the team calendar. Used to try and work out when team members are out of office

The script can be setup programattically by running `createTriggers`. Or individual triggers can be created as needed using the app scripts GUI.
