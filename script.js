const request = require('request')
const readline = require('readline');
const fs = require('fs')
const sh = require('shelljs')
const parser = require('ua-parser-js');
const geoip = require('geoip-lite')
const converter = require("json-2-csv")

const lastArg = process.argv[process.argv.length - 1]
const FILE_NAME = 'consumer_track_test.log'
const accessLog = /true|false/i.test(process.argv[2]) ? FILE_NAME : process.argv[2]
const isTest = /true|false/i.test(lastArg) && JSON.parse(lastArg)

function processLineByLine() {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(FILE_NAME)
  });

  const jsonForCSV = []

  readInterface.on('line', (line) => {
    const data = getData(line)

    jsonForCSV.push(data)
  }).on('close', () => {
    converter.json2csv(jsonForCSV, (err, csv) => {
      if (err) throw err
      fs.writeFileSync('consumer_track_test.csv', csv)
    })
  })
}

// I treated the access log as if it was in common log format with
// the addition of a referrer field and a user-agent field
// https://en.wikipedia.org/wiki/Common_Log_Format

function getData(line) {
  console.log(line)
  const re = /".*?"/g
  const reMatches = line.match(re)

  const [ip, userIdentifier, userId, statusCode, contentLength] = sh.exec(
    `echo ${JSON.stringify(line)} | awk '{print $1, $2, $3, $9, $10}'`,
    { silent: true }
  ).stdout.split(' ')

  const timestamp = line.match(/\[.*?\]/)[0]

  const userAgent = reMatches[2].slice(1, -1)
  const userRequest = reMatches[0].slice(1, -1)
  const referrer = reMatches[1].slice(1, -1)

  const geo = geoip.lookup(ip)
  const uaParsed = parser(userAgent)

  return {
    deviceType: uaParsed.device.type || "unknown",
    browser: uaParsed.browser.name || "unknown",
    country: geo.country,
    state: geo.region,
    contentLength: contentLength.trim(),
    timestamp,
    referrer,
    userRequest,
    statusCode,
    userIdentifier,
    userId
  }
}

function beginProcess() {
  if (typeof isTest === 'boolean' && isTest) {
    sh.exec(`echo "$(head -50 consumer_track_test.log)" > consumer_track_test.log`)
  }
  processLineByLine()
}

fs.access(accessLog, fs.constants.F_OK, (err) => {
  if (err) request(accessLog)
    .pipe(fs.createWriteStream(FILE_NAME))
    .on('close', beginProcess)
  else beginProcess()
});
