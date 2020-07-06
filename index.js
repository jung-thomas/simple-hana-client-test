require('dotenv').config()
const xsenv = require("@sap/xsenv")
xsenv.loadEnv()
var options = ''
if (!process.env.TARGET_CONTAINER) {
    options = xsenv.getServices({ hana: { tag: 'hana' } })
} else {
    options = xsenv.getServices({ hana: { name: process.env.TARGET_CONTAINER } })
}
testHdbext()
testHanaClient()
testHdbextPromise()
testHdb()

function testHdbext() {
    const hdbext = require("@sap/hdbext")
    hdbext.createConnection(options.hana, (error, client) => {
        if (error) {
            console.error(`Error Inside @sap/hdbext test`)
            return console.error(error)
        } else {
            client.prepare(
                `SELECT SESSION_USER, CURRENT_SCHEMA FROM "DUMMY"`,
                (error, statement) => {
                    if (error) {
                        console.error(`Error Inside @sap/hdbext test`)
                        return console.error(error)
                    }
                    statement.exec([],
                        (error, results) => {
                            if (error) {
                                console.error(`Error Inside @sap/hdbext test`)
                                return console.error(error)
                            } else {
                                console.log(`Test @sap/hdbext`)
                                return console.table(results)
                            }
                        })
                })
        }
    })
}

function testHanaClient() {
    const hanaClient = require("@sap/hana-client")
    const connParams = {
        serverNode: options.hana.host + ":" + options.hana.port,
        uid: options.hana.user,
        pwd: options.hana.password,
        ca: options.hana.certificate
    }
    const client = hanaClient.createClient(connParams)
    client.connect((error) => {
        if (error) {
            console.error(`Error Inside @sap/hana-client test`)
            return console.error(error)
        } else {
            client.exec(`SELECT SESSION_USER, CURRENT_SCHEMA FROM "DUMMY"`, (error, results) => {
                if (error) {
                    console.error(`Error Inside @sap/hana-client test`)
                    return console.error(error)
                } else {
                    client.disconnect()
                    console.log(`Test @sap/hana-client`)
                    return console.table(results)
                }
            })
        }
    })
}

async function testHdbextPromise() {
    try {
        const dbClass = require("sap-hdbext-promisfied")
        const db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)))
        const statement = await db.preparePromisified(`SELECT SESSION_USER, CURRENT_SCHEMA FROM "DUMMY"`)
        const results = await db.statementExecPromisified(statement, [])
        console.log(`Test sap-hdbext-promisfied`)
        return console.table(results)
    } catch (error) {
        console.error(`Error Inside sap-hdbext-promisfied`)
        console.error(error)
    }
}

function testHdb() {
    const hdb = require("hdb")
    const client = hdb.createClient(options.hana)
    client.connect(function (error) {
        if (error) {
            console.error(`Error Inside hdb`)
            return console.error(error)
        }
        client.exec(`SELECT SESSION_USER, CURRENT_SCHEMA FROM "DUMMY"`, function (error, results) {
            client.end()
            if (error) {
                console.error(`Error Inside hdb`)
                return console.error(error)
            }
            console.log(`Test hdb`)
            return console.table(results)
        })
    })
}