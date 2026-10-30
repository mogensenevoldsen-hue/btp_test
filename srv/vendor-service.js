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
      if (!s) return req.reject(404, `Leverandør ${supplier} findes ikke`)

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

      add('Navn', !!s.SupplierName, s.SupplierName || 'Navn mangler')

      const taxIds = [
        ...(s.VATRegistration ? [`Moms: ${s.VATRegistration}`] : []),
        ...taxNumbers.filter(t => t.BPTaxNumber).map(t => `${t.BPTaxType}: ${t.BPTaxNumber}`)
      ]
      add('Moms/skattenummer', taxIds.length > 0, taxIds.join(', ') || 'Intet moms- eller skattenummer')

      const addressFields = [['StreetName', 'gade'], ['PostalCode', 'postnr.'], ['CityName', 'by'], ['Country', 'land']]
      const address = addresses.find(a => missing(a, addressFields).length === 0) ?? addresses[0]
      if (!address) add('Adresse', false, 'Ingen adresse')
      else {
        const gaps = missing(address, addressFields)
        const text = `${[address.StreetName, address.HouseNumber].filter(Boolean).join(' ')}, ${[address.PostalCode, address.CityName].filter(Boolean).join(' ')}, ${address.Country ?? ''}`
        add('Adresse', gaps.length === 0, gaps.length ? `Mangler ${gaps.join(', ')}: ${text}` : text)
      }

      const accounts = banks.filter(b => b.IBAN || b.BankAccount)
      add('Bankkonto', accounts.length > 0, accounts.length
        ? accounts.map(b => [b.BankName, b.IBAN ? `IBAN ${b.IBAN}` : `reg.nr. ${b.BankNumber ?? '-'} konto ${b.BankAccount}`].filter(Boolean).join(': ')).join('; ')
        : 'Ingen bankkonto')

      const companyFields = [['ReconciliationAccount', 'afstemningskonto'], ['PaymentTerms', 'betalingsbetingelser']]
      add('Firmakode', companies.length > 0 && companies.every(c => missing(c, companyFields).length === 0), companies.length
        ? companies.map(c => {
          const gaps = missing(c, companyFields)
          return gaps.length ? `${c.CompanyCode}: mangler ${gaps.join(', ')}` : `${c.CompanyCode}: afstemningskonto ${c.ReconciliationAccount}, betalingsbetingelser ${c.PaymentTerms}`
        }).join('; ')
        : 'Ikke oprettet i nogen firmakode')

      add('Indkøbsorganisation', purchasingOrgs.length > 0 && purchasingOrgs.every(p => p.PurchaseOrderCurrency), purchasingOrgs.length
        ? purchasingOrgs.map(p => p.PurchaseOrderCurrency ? `${p.PurchasingOrganization}: valuta ${p.PurchaseOrderCurrency}` : `${p.PurchasingOrganization}: mangler ordrevaluta`).join('; ')
        : 'Ikke oprettet i nogen indkøbsorganisation')

      const blocks = [[s.PostingIsBlocked, 'bogføring'], [s.PurchasingIsBlocked, 'indkøb'], [s.PaymentIsBlockedForSupplier, 'betaling']]
        .filter(([blocked]) => blocked).map(([, label]) => label)
      add('Spærringer', blocks.length === 0, blocks.length ? `Spærret for ${blocks.join(', ')}` : 'Ingen spærringer')

      add('Slettemarkering', !s.DeletionIndicator, s.DeletionIndicator ? 'Markeret til sletning' : 'Ikke markeret til sletning')

      const failed = checks.filter(c => !c.ok).length
      return { supplier: s.Supplier, businessPartner, name: s.SupplierName, ok: failed === 0, failed, checks }
    })

    return super.init()
  }
}
