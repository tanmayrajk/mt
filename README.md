# mt

![screenshot](screenshot.png)

## what is it?

mt is a slack bot for monkeytype. currently it allows five commands in total:

- `/setapekey` sets/updates the api key
- `/deleteapekey` deletes the api key associated with your user
- `/lastrun` gets info about your last run and displays it in a beautiful slack message
- `/activity` shows a github-like activity graph of your monkeytype activity
- `/leaderboard` shows the leaderboard for the specified mode (tho i just learned that the method im using for that rn is horrible so that will be rewritten)

---

## how to use?

- go to [https://monkeytype.com/account-settings?tab=apeKeys](https://monkeytype.com/account-settings?tab=apeKeys) and create an apekey (don't forget to enable it!).
- go on slack and use `/setapekey` to set your api key.
- try `/deleteapekey`, `/lastrun`, `/activity` or `/leaderboard`.

---

## how to build?

- create a slack app.
- add the following bot token scopes: `chat:write`, `chat:write.public`, `commands` and `groups:write` and install the bot in the org.
- then create a `.env` file and add the variables `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET`.
- add all the commands listed in the "what is it" section of the readme in your slack app and set their url to `{thehosturl}/slack/events`.
- enable interactivity and set the request url to `{thehosturl}/slack/events` as well.
- to build the thing first do a `bun install`.
- then run the thing with `bun run start`.

## ai usage

ai was occasionally used, by which i mean i just asked chatgpt/claude sometimes. no ai autocompletion was used as i keep it turned off.
