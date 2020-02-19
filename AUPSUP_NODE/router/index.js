'use strict'

module.exports = function (app, server) {
  // SERVIZI UTILITY
  app.use('/Utils/UtilsManagement', require('../it/alteaup/supplier/portal/Utils/UtilsManagement')())

  // SERVIZI METASUPPLIER
  app.use('/MetasupplierManagement', require('../it/alteaup/supplier/portal/Supplier/MetasupplierManagement')())

  // SERVIZI PLANNING
  app.use('/PlanningManagement', require('../it/alteaup/supplier/portal/Planning/PlanningManagement')())

  // SERVIZI INBOUND DELIVERY
  app.use('/InboundDeliveryManagement', require('../it/alteaup/supplier/portal/InboundDelivery/InboundDeliveryManagement')())

  // SERVIZI DOCUMENTALE
  app.use('/DocumentManagement', require('../it/alteaup/supplier/portal/Document/DocumentManagement')())
}
