# GETTING STARTED

**First, install your packages**

```sh
npm i
```
---
**After that, find the access log that you want to parse.  It can be a URL or a local file.**

NOTE: This parser assumes your access log is in [Common Log Format](https://en.wikipedia.org/wiki/Common_Log_Format) with the addition of a referrer field and a user-agent field.

---
**Once you're ready with your access log, run the `npm start` command with one or two arguments**

*required*
(string) file
: access log to be parsed

*optional*
(boolean) test
: cut your access log to only 50 lines in order to process what might be a large access log very fast.  Defaults to false if empty or if argument is not "true" or "false".

```sh
npm start my_access_log.log true
```

---
**When the above command is finished, your log file should be converted to a CSV file within this folder.**

### Thanks for reviewing! 🎉
