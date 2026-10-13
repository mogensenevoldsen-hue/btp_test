import cds from '@sap/cds'

export default class HelloService extends cds.ApplicationService {
  init() {
    this.on('hello', req => `Hello ${req.data.to ?? 'World'}!`)
    return super.init()
  }
}
