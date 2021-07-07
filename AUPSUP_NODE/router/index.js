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

  // SERVIZI QUALITY
  app.use('/QualityManagement', require('../it/alteaup/supplier/portal/Quality/QualityManagement')())

  // SERVIZI PIANI DI CONSEGNA
  app.use('/SchedulingAgreementManagement', require('../it/alteaup/supplier/portal/SchedulingAgreement/SchedulingAgreementManagement')())

  // SERVIZI ORDINI e PIANI CONSEGNA (per creazione)
  app.use('/OrdersManagement', require('../it/alteaup/supplier/portal/Orders/OrdersManagement')())

  // SERVIZI GESTIONE VARIANTI
  app.use('/VariantsManagement', require('../it/alteaup/supplier/portal/Variants/VariantsManagement')())

  // SERVIZI APP CUSTOMIZING
  app.use('/CustomizingManagement', require('../it/alteaup/supplier/portal/Customizing/CustomizingManagement')())

  // SERVIZI SCHEDULATORE LETTURA ORDINE E PIANI ecc..
  app.use('/SchedulersManagement', require('../it/alteaup/supplier/portal/Schedulers/SchedulersManagement')())

  // SERVIZI CONTO LAVORISTI
  app.use('/ContoLavManagement', require('../it/alteaup/supplier/portal/ContoLav/ContoLavManagement')())
}
