/* eslint-disable camelcase */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-useless-escape */
/* eslint-disable indent */

'use strict'
var express = require('express')
var stringifyObj = require('stringify-object')
var hdbext = require('@sap/hdbext')
var async = require('async')
const cron = require('node-cron')

module.exports = function () {
  var app = express.Router()
  var schedulerODALuve
  var schedulerSAGLuve

  const bodyParser = require('body-parser')

  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  )

  app.use(bodyParser.json())

  const promiseCallOrderUpdate = (tenantContainer) => {
    /* const dbConfigAccessLUVEQUA = {
       host: 'zeus.hana.prod.eu-central-1.whitney.dbaas.ondemand.com',
       port: '29389',
       driver: 'com.sap.db.jdbc.Driver',
       url: 'jdbc:sap://zeus.hana.prod.eu-central-1.whitney.dbaas.ondemand.com:29389?encrypt=true&validateCertificate=true&currentschema=QASLUVEECC',
       schema: 'QASLUVEECC',
       hdi_user: 'QASLUVEECC_6Q25J1DUMGGG468TLYUAKSLNO_DT',
       hdi_password: 'Is2XaOCLH5kvXXBibap.dAvksmNA.N4G9mREQ48KONBHVkuUFFy98_Lw7.f7LFZQG3de8.ZyxJaKc1IargfqFQhiQJ6ye_nmmFGZMXH9isChKN445iWL2y.PXDn-QKmw',
       user: 'QASLUVEECC_6Q25J1DUMGGG468TLYUAKSLNO_RT',
       password: 'Gy44YijIE1yKRkXJqWdqmM8R2rUbplmNx86Zdsk3WFoDJQyeg55jsGaShOzFszUc-3emwrrCo-reSKBNMEtvHNZpOOMhhQM4w2hp89Ufwj8ItFpSzj4Jbh3_KtTliwP1',
       certificate: '-----BEGIN CERTIFICATE-----\nMIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBh\nMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3\nd3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD\nQTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVT\nMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j\nb20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG\n9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsB\nCSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97\nnh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt\n43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7P\nT19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4\ngdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAO\nBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbR\nTLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUw\nDQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/Esr\nhMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg\n06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJF\nPnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0ls\nYSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQk\nCAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=\n-----END CERTIFICATE-----\n'
     } */

    return new Promise((resolve, reject) => {
      try {
        hdbext.createConnection(tenantContainer, (err, client) => {
          if (err) {
            console.log('SCHEDULER ERROR: ' + stringifyObj(err))
            // eslint-disable-next-line prefer-promise-reject-errors
            reject()
          } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Schedulers::UpdateTask', function (_err, sp) {
              sp('F', (err, parameters, returns) => {
                if (err) {
                  console.error('SCHEDULER ODA LUVE ERROR: ' + err)
                  // eslint-disable-next-line prefer-promise-reject-errors
                  reject()
                } else {
                  for (let index = 0; index < returns.length; index++) {
                    const element = returns[index]
                    element.APPLICAZIONE = 'ODA'
                    element.EVENT = 'NOR'
                  }
                  sendMail(tenantContainer, returns)
                  console.log('SCHEDULER ODA LUVE OOOK')
                  resolve()
                }
              })
            })
          }
        })
      } catch (error) {
        console.log('JOB ODA LUVE ERROR EXCEPT ' + error)
        // eslint-disable-next-line prefer-promise-reject-errors
        reject()
      }
    })
  }

  const promiseCallSAGUpdate = (tenantContainer) => {
    /* const dbConfigAccessLUVEQUA = {
       host: 'zeus.hana.prod.eu-central-1.whitney.dbaas.ondemand.com',
       port: '29389',
       driver: 'com.sap.db.jdbc.Driver',
       url: 'jdbc:sap://zeus.hana.prod.eu-central-1.whitney.dbaas.ondemand.com:29389?encrypt=true&validateCertificate=true&currentschema=QASLUVEECC',
       schema: 'QASLUVEECC',
       hdi_user: 'QASLUVEECC_6Q25J1DUMGGG468TLYUAKSLNO_DT',
       hdi_password: 'Is2XaOCLH5kvXXBibap.dAvksmNA.N4G9mREQ48KONBHVkuUFFy98_Lw7.f7LFZQG3de8.ZyxJaKc1IargfqFQhiQJ6ye_nmmFGZMXH9isChKN445iWL2y.PXDn-QKmw',
       user: 'QASLUVEECC_6Q25J1DUMGGG468TLYUAKSLNO_RT',
       password: 'Gy44YijIE1yKRkXJqWdqmM8R2rUbplmNx86Zdsk3WFoDJQyeg55jsGaShOzFszUc-3emwrrCo-reSKBNMEtvHNZpOOMhhQM4w2hp89Ufwj8ItFpSzj4Jbh3_KtTliwP1',
       certificate: '-----BEGIN CERTIFICATE-----\nMIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBh\nMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3\nd3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD\nQTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVT\nMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j\nb20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG\n9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsB\nCSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97\nnh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt\n43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7P\nT19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4\ngdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAO\nBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbR\nTLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUw\nDQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/Esr\nhMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg\n06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJF\nPnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0ls\nYSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQk\nCAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=\n-----END CERTIFICATE-----\n'
     } */

    return new Promise((resolve, reject) => {
      try {
        hdbext.createConnection(tenantContainer, (err, client) => {
          if (err) {
            console.log('SCHEDULER ERROR: ' + stringifyObj(err))
            // eslint-disable-next-line prefer-promise-reject-errors
            reject()
          } else {
            hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Schedulers::UpdateTask', function (_err, sp) {
              sp('L', (err, parameters, returns) => {
                if (err) {
                  console.error('SCHEDULER SAG LUVE ERROR: ' + err)
                  // eslint-disable-next-line prefer-promise-reject-errors
                  reject()
                } else {
                  for (let index = 0; index < returns.length; index++) {
                    const element = returns[index]
                    element.APPLICAZIONE = 'P_CONS'
                    element.EVENT = 'NPC'
                  }
                  sendMail(tenantContainer, returns)
                  console.log('SCHEDULER SAG LUVE OOOK')
                  resolve()
                }
              })
            })
          }
        })
      } catch (error) {
        console.log('JOB SAG LUVE ERROR EXCEPT ' + error)
        // eslint-disable-next-line prefer-promise-reject-errors
        reject()
      }
    })
  }

  // JOB START & STOP
  app.get('/JobUpdateStatus', function (req, res) {
    var record

    const sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_SCHEDULER_SETTINGS\"'

    hdbext.createConnection(req.tenantContainer, function (error, client) {
      if (error) {
        console.error('ERROR T_SCHEDULER_SETTINGS :' + stringifyObj(error))
        return res.status(500).send('T_SCHEDULER_SETTINGS CONNECTION ERROR: ' + stringifyObj(error))
      }
      if (client) {
        async.waterfall([

          function prepare (callback) {
            client.prepare(sql,
              function (err, statement) {
                callback(null, err, statement)
              })
          },

          function execute (_err, statement, callback) {
            statement.exec([], function (execErr, results) {
              callback(null, execErr, results)
            })
          },

          function response (err, results, callback) {
            if (err) {
              return res.type('application/json').status(500).send({ ERROR: err })
            } else {
              console.log('SCHEDULER: ' + JSON.stringify(results))
              if (results !== null && results.length > 0) {
                results.forEach(element => {
                  record = element

                  if (record && record.SCHEDULER_STATUS === 'X' && record.APPLICATION === 'F') {
                    console.log('SCHEDULER schedulerODALuve: ' + schedulerODALuve)
                    console.log('SCHEDULER ODA STARTING ')
                    if (schedulerODALuve === undefined) {
                      console.log('SCHEDULER schedulerODALuve NOT EXIST')
                      schedulerODALuve = cron.schedule(record.SCHEDULER_TIME_REPEAT, async () => promiseCallOrderUpdate(req.tenantContainer))
                      schedulerODALuve.start()
                      console.log('SCHEDULER ODA STARTED')
                    } else {
                      console.log('SCHEDULER schedulerODALuve ALREADY EXIST')
                      schedulerODALuve.stop()
                      schedulerODALuve.destroy()
                      schedulerODALuve = cron.schedule(record.SCHEDULER_TIME_REPEAT, async () => promiseCallOrderUpdate(req.tenantContainer))
                      schedulerODALuve.start()
                      console.log('SCHEDULER ODA STARTED')
                    }
                  } else {
                    if (record && record.SCHEDULER_STATUS === '' && record.APPLICATION === 'F') {
                      console.log('SCHEDULER ODA STOPPING')
                      if (schedulerODALuve !== undefined) {
                        console.log('SCHEDULER ODA STOP')
                        schedulerODALuve.stop()
                        console.log('SCHEDULER ODA STOPPED')
                      } else {
                        console.log('CAN NOT STOP ODA UNDEFINED')
                      }
                    }
                  }

                  if (record && record.SCHEDULER_STATUS === 'X' && record.APPLICATION === 'L') {
                    console.log('SCHEDULER schedulerSAGLuve: ' + schedulerSAGLuve)
                    console.log('SCHEDULER SAG STARTING ')
                    if (schedulerSAGLuve === undefined) {
                      console.log('SCHEDULER schedulerSAGLuve NOT EXIST')
                      schedulerSAGLuve = cron.schedule(record.SCHEDULER_TIME_REPEAT, async () => promiseCallSAGUpdate(req.tenantContainer))
                      schedulerSAGLuve.start()
                      console.log('SCHEDULER SAG STARTED')
                    } else {
                      console.log('SCHEDULER schedulerSAGLuve ALREADY EXIST')
                      schedulerSAGLuve.stop()
                      schedulerSAGLuve.destroy()
                      schedulerSAGLuve = cron.schedule(record.SCHEDULER_TIME_REPEAT, async () => promiseCallSAGUpdate(req.tenantContainer))
                      schedulerSAGLuve.start()
                      console.log('SCHEDULER SAG STARTED')
                    }
                  } else {
                    if (record && record.SCHEDULER_STATUS === '' && record.APPLICATION === 'L') {
                      console.log('SCHEDULER SAG STOPPING')
                      if (schedulerSAGLuve !== undefined) {
                        console.log('SCHEDULER SAG STOP')
                        schedulerSAGLuve.stop()
                        console.log('SCHEDULER SAG STOPPED')
                      } else {
                        console.log('CAN NOT STOP SAG UNDEFINED')
                      }
                    }
                  }
                })
              }
            }
            callback()
            return res.status(200).send({
              results: record
            })
          }
        ], function done (err, parameters, rows) {
          console.log('---->>> CLIENT END T_SCHEDULER_SETTINGS <<<<<-----')
          client.close()
          if (err) {
            return console.error('Done error', err)
          }
        })
      }
    })
  })

  // READ ORDER FOR JOB
  app.get('/UpdateTask', function (req, res) {
    var bstyp = req.query.I_BSTYP !== undefined && req.query.I_BSTYP !== null && req.query.I_BSTYP !== '' ? req.query.I_BSTYP : ''

    if (bstyp === '') {
      return res.status(500).send('I_BSTYP mandatory ')
    }

    hdbext.createConnection(req.tenantContainer, (err, client) => {
      if (err) {
        return res.status(500).send('CREATE CONNECTION ERROR: ' + stringifyObj(err))
      } else {
        hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Schedulers::UpdateTask', function (_err, sp) {
          sp(bstyp, (err, parameters, returns) => {
            if (err) {
              console.error('ERROR: ' + err)
              return res.status(500).send(stringifyObj(err))
            } else {
              for (let index = 0; index < returns.length; index++) {
                const element = returns[index]
                if (bstyp === 'F') {
                  element.APPLICAZIONE = 'ODA'
                  element.EVENT = 'NOR'
                }
                if (bstyp === 'L') {
                  element.APPLICAZIONE = 'P_CONS'
                  element.EVENT = 'NPC'
                }
              }
              sendMail(req.tenantContainer, returns)
              return res.status(200).send('ok')
            }
          })
        })
      }
    })
  })

  function sendMail (tenantContainer, confirms) {
    var lifnrs = '('
    for (let index = 0; index < confirms.length; index++) {
      var element = confirms[index]
      if (lifnrs.indexOf(element.LIFNR) < 0) {
        lifnrs = lifnrs + '\'' + element.LIFNR + '\','
      }
    }
    lifnrs = lifnrs + ')'
    lifnrs = lifnrs.replace(',)', ')')
    console.log('LIFNR ' + lifnrs)

    confirms.forEach(element => {
      var sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_MASTER\" WHERE APPLICAZIONE = \'' + element.APPLICAZIONE + '\' and EVENTO = \'' + element.EVENT + '\''
      console.log('sql T_NOTIF_MASTER' + sql)
      hdbext.createConnection(tenantContainer, function (error, client) {
        if (error) {
          console.error('ERROR T_NOTIF_MASTER :' + stringifyObj(error))
          client.close()
          //   return res.status(500).send('T_NOTIF_MASTER CONNECTION 1 ERROR: ' + stringifyObj(error))
        } else {
          client.exec(sql, function (error, results) {
            console.log('RESULTS T_NOTIF_MASTER: ' + stringifyObj(results))
            if (error) {
              console.err('Error during direct statement execution T_NOTIF_MASTER: ' + error)
              client.close()
              //   return res.status(500).send('T_NOTIF_MASTER CONNECTION 2 ERROR: ' + stringifyObj(error))
            } else {
              /* if (results && results[0]) {
                   var flusso = results[0].FLUSSO
                   var tipoStruttura = results[0].TIPO_STRUTTURA
                   var applicazione = results[0].APPLICAZIONE
                   var evento = results[0].EVENTO
                   var direzione = results[0].DIREZIONE
               } */

              sql = 'SELECT METAID FROM \"AUPSUP_DATABASE.data.tables::T_METAID_FORN\" WHERE LIFNR IN ' + lifnrs
              console.log('sql lista metafornitori: ' + sql)
              client.exec(sql, function (error, results) {
                if (error) {
                  console.error('Error during direct statement execution T_METAID_FORN: ' + stringifyObj(error))
                  client.close()
                  //  return res.status(500).send('T_NOTIF_MASTER T_METAID_FORN 2 ERROR: ' + stringifyObj(error))
                } else {
                  console.log('RESULTS T_METAID_FORN: ' + stringifyObj(results))
                  var listMETAIDS = '('
                  for (let index = 0; index < results.length; index++) {
                    var elemMETAID = results[index]
                    if (listMETAIDS.indexOf(elemMETAID.METAID) < 0) {
                      listMETAIDS = listMETAIDS + '\'' + elemMETAID.METAID + '\','
                    }
                  }
                  listMETAIDS = listMETAIDS + ')'
                  listMETAIDS = listMETAIDS.replace(',)', ')')
                  console.log('listMETAIDS: ' + listMETAIDS)
                  // FLUSSO PROC
                  sql = 'SELECT MAIL AS RECEIVER,\'U\' as REC_TYPE,null as REC_ID,null as REPLY_DOC,null as REC_DATE,null as PROXY_ID,null as RETRN_CODE,null as EXPRESS,null as COPY,null as BLIND_COPY,null as NO_FORWARD,null as NO_PRINT,null as TO_ANSWER,null as TO_DO_EXPL,null as TO_DO_GRP,null as COM_TYPE,null as LFDNR,null as FAX,null as COUNTRY,null as SPOOL_ID,null as NOTIF_DEL,null as NOTIF_READ,null as NOTIF_NDEL,null as SAP_BODY FROM "AUPSUP_DATABASE.data.tables::T_METASUPPLIER_CONTACTS" WHERE METAID IN ' + listMETAIDS + ' AND TIPOLOGIA = \'02\''
                  console.log('sql MAIL: ' + sql)
                  client.exec(sql, function (error, results) {
                    console.log('LISTA MAIL: ' + stringifyObj(results))
                    if (error) {
                      console.error('Error during direct statement execution T_METASUPPLIER_CONTACTS: ' + error)
                      client.close()
                      //  return res.status(500).send('T_NOTIF_MASTER T_METASUPPLIER_CONTACTS ERROR: ' + stringifyObj(error))
                    } else {
                      var emailList = results

                      sql = 'SELECT (SELECT TEXT FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_TEXT\" WHERE TEXT_TYPE = \'MAIL_BODY\' AND' +
                        ' EVENT = \'' + element.EVENT + '\' AND APP = \'' + element.APPLICAZIONE + '\') AS BODY, (SELECT TEXT FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_TEXT\" WHERE ' +
                        'TEXT_TYPE = \'MAIL_SUBJ\' AND EVENT = \'' + element.EVENT + '\' AND APP = \'' + element.APPLICAZIONE + '\') AS SUBJ FROM \"AUPSUP_DATABASE.data.synonyms::DUMMY\"'
                      console.log('sql T_NOTIF_TEXT: ' + sql)
                      client.exec(sql, function (error, results) {
                        console.log('RESULTS T_NOTIF_TEXT: ' + stringifyObj(results))
                        if (error) {
                          console.error('Error during direct statement execution T_NOTIF_TEXT: ' + error)
                          client.close()
                          //  return res.status(500).send('T_NOTIF_TEXT ERROR: ' + stringifyObj(error))
                        } else {
                          if (results && results.length > 0) {
                            var subject = results[0].SUBJ
                            var body = results[0].BODY
                            var bodyLines = []
                            if (body !== undefined) {
                              body = body.replace('EBELN', element.EBELN)
                              body = body.replace('EBELP', element.EBELP)
                              body = body.replace('MATNR', element.MATNR)
                              bodyLines.push({ LINE: body })
                            }

                            var sql = 'SELECT * FROM \"AUPSUP_DATABASE.data.tables::T_NOTIF_PORTAL_LINKS\" WHERE APP = \'' + element.APPLICAZIONE + '\' and EVENT = \'' + element.EVENT + '\''
                            console.log('sql T_NOTIF_PORTAL_LINKS' + sql)
                            client.exec(sql, function (error, results) {
                              if (error) {
                                console.error('Error during direct statement execution T_NOTIF_PORTAL_LINKS: ' + stringifyObj(error))
                                client.close()
                                //  return res.status(500).send('T_NOTIF_PORTAL_LINKS ERROR: ' + stringifyObj(error))
                              } else {
                                if (results && results[0]) {
                                  // SPAZIO VUOTO
                                  bodyLines.push({ LINE: '' })
                                  var link = results[0].LINK
                                  link = link.replace('EBELN', element.EBELN)
                                  link = link.replace('EBELP', element.EBELP)
                                  bodyLines.push({ LINE: link })
                                }
                              }

                              hdbext.loadProcedure(client, null, 'AUPSUP_DATABASE.data.procedures.Utils::SendMail', function (_err, sp) {
                                sp('', subject, bodyLines, emailList, (err) => {
                                  if (err) {
                                    console.error('ERROR: ' + stringifyObj(err))
                                    // return res.status(500).send(stringifyObj(err))
                                  } else {
                                    // return res.status(200).send('OK')
                                  }
                                })
                              })
                            })
                          }
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    })
  }

  app.use(express.json())

  return app
}
