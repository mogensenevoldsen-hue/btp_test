import cds from '@sap/cds'

export default class VendorService extends cds.ApplicationService {
  async init() {
    const bp = await cds.connect.to('API_BUSINESS_PARTNER')
    const { A_Supplier } = bp.entities

    this.on('supplierStatus', async req => {
      const { supplier } = req.data
      const s = await bp.run(SELECT.one.from(A_Supplier).where({ Supplier: supplier }))
      if (!s) return req.reject(404, `Leverandør ${supplier} findes ikke`)
      return {
        supplier: s.Supplier,
        name: s.SupplierName,
        blocked: !!(s.PostingIsBlocked || s.PurchasingIsBlocked || s.PaymentIsBlockedForSupplier),
        postingBlocked: !!s.PostingIsBlocked,
        purchasingBlocked: !!s.PurchasingIsBlocked,
        paymentBlocked: !!s.PaymentIsBlockedForSupplier
      }
    })

    return super.init()
  }
}
