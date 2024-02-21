# Welcome 👋

this is a brand new discord bot that has a dashboard! its pertty basic but it also includes a prefix and coming soon a slash command handler!

# Currently being worked on

## 🎫 | a ticket system in the dashboard

    | Which means you can configure ticket settings though the dashboard

## ⚙️ | more commands

    | basic commands like moderation and such

## 💫 | slash command handler

    | ScriptingBytes will probbly add this but its so you can use slash commands in this bot!

## 🌃 | and dashboard revamp

    | Make the dashboard more funtional and better looking as it is pretty basic rn

# Self hosting 🚀

## When self hosting the bot please mind the [licenes](./LICENSE)

clone this repo ```git clone https://github.com/hotsu0p/chaotic.git```

run ```npm install```

then rename [The example config (Example config)](./example.config.js) to `config.js`

Then populate the config.

## how to popluate the config vaules

`prefix` = the base prefix for the bot ( the default prefix in the dashboard also)
        <li> default is `!` </li>

`id` = your discord bot client id . you can get this in the o2auth page of your bot at [Here](https://discord.com/devlopers)

`usingCustomDomain` = turn this to true if you are using a domain other than localhost

`domain` = your domain for the dashboard to be hosted on
         <li>The default is <http://localhost> </li>

`discordInvite` = the invite to your discord support server

`mongodbUrl` = THe url for your mongo db for storing data of the bot

`clientSecret`=  your discord bot client secret. you can get this in the o2auth page of your bot at [Here](https://discord.com/devlopers)

`token` = your discord bot token

## after populating the config

run `Npm run start` or `node .`

# Want to add something to this repo?

  fork and make a pr!