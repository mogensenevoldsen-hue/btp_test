/* Subset of SAP S/4HANA Cloud API_SUPPLIERINVOICE_PROCESS_SRV (OData V2) */
@cds.external : true
service API_SUPPLIERINVOICE_PROCESS_SRV {
  @cds.persistence.skip : true
  entity A_SupplierInvoice {
    key SupplierInvoice               : String(10);
    key FiscalYear                    : String(4);
        CompanyCode                   : String(4);
        InvoicingParty                : String(10);
        SupplierInvoiceIDByInvcgParty : String(16);
        DocumentDate                  : Date;
        PostingDate                   : Date;
        InvoiceGrossAmount            : Decimal(14, 3);
        DocumentCurrency              : String(5);
        PaymentTerms                  : String(4);
        PaymentBlockingReason         : String(1);
  }
}
