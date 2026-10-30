/* Subset of SAP S/4HANA Cloud API_BUSINESS_PARTNER (OData V2) */
@cds.external : true
service API_BUSINESS_PARTNER {
  @cds.persistence.skip : true
  entity A_BusinessPartner {
    key BusinessPartner         : String(10);
        BusinessPartnerFullName : String(81);
        Supplier                : String(10);
  }

  @cds.persistence.skip : true
  entity A_BusinessPartnerAddress {
    key BusinessPartner : String(10);
    key AddressID       : String(10);
        StreetName      : String(60);
        HouseNumber     : String(10);
        PostalCode      : String(10);
        CityName        : String(40);
        Country         : String(3);
  }

  @cds.persistence.skip : true
  entity A_BusinessPartnerBank {
    key BusinessPartner    : String(10);
    key BankIdentification : String(4);
        BankCountryKey     : String(3);
        BankName           : String(60);
        BankNumber         : String(15);
        BankAccount        : String(18);
        IBAN               : String(34);
        SWIFTCode          : String(11);
  }

  @cds.persistence.skip : true
  entity A_BusinessPartnerTaxNumber {
    key BusinessPartner : String(10);
    key BPTaxType       : String(4);
        BPTaxNumber     : String(20);
  }

  @cds.persistence.skip : true
  entity A_Supplier {
    key Supplier                    : String(10);
        SupplierName                : String(80);
        SupplierAccountGroup        : String(4);
        VATRegistration             : String(20);
        PostingIsBlocked            : Boolean;
        PurchasingIsBlocked         : Boolean;
        PaymentIsBlockedForSupplier : Boolean;
        DeletionIndicator           : Boolean;
  }

  @cds.persistence.skip : true
  entity A_SupplierCompany {
    key Supplier              : String(10);
    key CompanyCode           : String(4);
        ReconciliationAccount : String(10);
        PaymentTerms          : String(4);
        PaymentMethodsList    : String(10);
  }

  @cds.persistence.skip : true
  entity A_SupplierPurchasingOrg {
    key Supplier               : String(10);
    key PurchasingOrganization : String(4);
        PurchaseOrderCurrency  : String(5);
        PaymentTerms           : String(4);
  }
}
