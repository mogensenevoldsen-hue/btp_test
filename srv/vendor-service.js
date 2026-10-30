import cds from '@sap/cds'

const missing = (obj, fields) => fields.filter(([field]) => !obj[field]).map(([, label]) => label)

export default class VendorService extends cds.ApplicationService {
  async init() {
    const bp = await cds.connect.to('API_BUSINESS_PARTNER')
    const {
      A_BusinessPartner, A_BusinessPartnerAddress, A_BusinessPartnerBank, A_BusinessPartnerTaxNumber,
      A_Supplier, A_SupplierCompany, A_SupplierPurchasingOrg
    } = bp.entities

    this.on('supplierCheck', async req => {
      const { supplier } = req.data
      const s = await bp.run(SELECT.one.from(A_Supplier).where({ Supplier: supplier }))
      if (!s) return req.reject(404, `Supplier ${supplier} not found`)

      // The business partner number is normally the same as the supplier number
      const partner = await bp.run(SELECT.one.from(A_BusinessPartner).where({ Supplier: supplier }))
      const businessPartner = partner?.BusinessPartner ?? supplier

      const [addresses, banks, taxNumbers, companies, purchasingOrgs] = await Promise.all([
        bp.run(SELECT.from(A_BusinessPartnerAddress).where({ BusinessPartner: businessPartner })),
        bp.run(SELECT.from(A_BusinessPartnerBank).where({ BusinessPartner: businessPartner })),
        bp.run(SELECT.from(A_BusinessPartnerTaxNumber).where({ BusinessPartner: businessPartner })),
        bp.run(SELECT.from(A_SupplierCompany).where({ Supplier: supplier })),
        bp.run(SELECT.from(A_SupplierPurchasingOrg).where({ Supplier: supplier }))
      ])

      const checks = []
      const add = (check, ok, details) => checks.push({ check, ok, details })

      add('Name', !!s.SupplierName, s.SupplierName || 'Name is missing')

      const taxIds = [
        ...(s.VATRegistration ? [`VAT: ${s.VATRegistration}`] : []),
        ...taxNumbers.filter(t => t.BPTaxNumber).map(t => `${t.BPTaxType}: ${t.BPTaxNumber}`)
      ]
      add('VAT/tax number', taxIds.length > 0, taxIds.join(', ') || 'No VAT or tax number')

      const addressFields = [['StreetName', 'street'], ['PostalCode', 'postal code'], ['CityName', 'city'], ['Country', 'country']]
      const address = addresses.find(a => missing(a, addressFields).length === 0) ?? addresses[0]
      if (!address) add('Address', false, 'No address')
      else {
        const gaps = missing(address, addressFields)
        const text = `${[address.StreetName, address.HouseNumber].filter(Boolean).join(' ')}, ${[address.PostalCode, address.CityName].filter(Boolean).join(' ')}, ${address.Country ?? ''}`
        add('Address', gaps.length === 0, gaps.length ? `Missing ${gaps.join(', ')}: ${text}` : text)
      }

      const accounts = banks.filter(b => b.IBAN || b.BankAccount)
      add('Bank account', accounts.length > 0, accounts.length
        ? accounts.map(b => [b.BankName, b.IBAN ? `IBAN ${b.IBAN}` : `bank number ${b.BankNumber ?? '-'} account ${b.BankAccount}`].filter(Boolean).join(': ')).join('; ')
        : 'No bank account')

      const companyFields = [['ReconciliationAccount', 'reconciliation account'], ['PaymentTerms', 'payment terms']]
      add('Company code', companies.length > 0 && companies.every(c => missing(c, companyFields).length === 0), companies.length
        ? companies.map(c => {
          const gaps = missing(c, companyFields)
          return gaps.length ? `${c.CompanyCode}: missing ${gaps.join(', ')}` : `${c.CompanyCode}: reconciliation account ${c.ReconciliationAccount}, payment terms ${c.PaymentTerms}`
        }).join('; ')
        : 'Not created in any company code')

      add('Purchasing organization', purchasingOrgs.length > 0 && purchasingOrgs.every(p => p.PurchaseOrderCurrency), purchasingOrgs.length
        ? purchasingOrgs.map(p => p.PurchaseOrderCurrency ? `${p.PurchasingOrganization}: currency ${p.PurchaseOrderCurrency}` : `${p.PurchasingOrganization}: missing order currency`).join('; ')
        : 'Not created in any purchasing organization')

      const blocks = [[s.PostingIsBlocked, 'posting'], [s.PurchasingIsBlocked, 'purchasing'], [s.PaymentIsBlockedForSupplier, 'payment']]
        .filter(([blocked]) => blocked).map(([, label]) => label)
      add('Blocks', blocks.length === 0, blocks.length ? `Blocked for ${blocks.join(', ')}` : 'No blocks')

      add('Deletion flag', !s.DeletionIndicator, s.DeletionIndicator ? 'Marked for deletion' : 'Not marked for deletion')

      const failed = checks.filter(c => !c.ok).length
      return { supplier: s.Supplier, businessPartner, name: s.SupplierName, ok: failed === 0, failed, checks }
    })

    return super.init()
  }
}
