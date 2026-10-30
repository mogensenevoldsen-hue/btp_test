/* Subset of SAP S/4HANA Cloud API_BUSINESS_PARTNER (OData V2) */
@cds.external : true
service API_BUSINESS_PARTNER {
  @cds.persistence.skip : true
  entity A_Supplier {
    key Supplier                    : String(10);
        SupplierName                : String(80);
        PostingIsBlocked            : Boolean;
        PurchasingIsBlocked         : Boolean;
        PaymentIsBlockedForSupplier : Boolean;
  }
}
