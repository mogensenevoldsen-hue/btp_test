using from './external/API_BUSINESS_PARTNER';
using from './external/API_SUPPLIERINVOICE_PROCESS_SRV';

service VendorService {
  type Check {
    check   : String;
    ok      : Boolean;
    details : String;
  }

  type CompanyCodeData {
    companyCode           : String(4);
    reconciliationAccount : String(10);
    paymentTerms          : String(4);
    paymentMethods        : String(10);
    accountingClerk       : String(2);
    paymentBlock          : String(1);
  }

  type PurchasingOrgData {
    purchasingOrganization : String(4);
    currency               : String(5);
    paymentTerms           : String(4);
  }

  type BankData {
    bankName    : String(60);
    bankCountry : String(3);
    bankNumber  : String(15);
    account     : String(18);
    iban        : String(34);
    swift       : String(11);
  }

  type SupplierDetails {
    businessPartner : String(10);
    accountGroup    : String(4);
    createdOn       : Date;
    createdBy       : String(12);
    address         : String;
    phone           : String;
    email           : String;
    companyCodes    : many CompanyCodeData;
    purchasingOrgs  : many PurchasingOrgData;
    banks           : many BankData;
  }

  type Invoice {
    invoice        : String(10);
    fiscalYear     : String(4);
    companyCode    : String(4);
    reference      : String(16);
    postingDate    : Date;
    amount         : Decimal(14, 3);
    currency       : String(5);
    paymentBlocked : Boolean;
    status         : String;
  }

  type SupplierCheck {
    supplier        : String(10);
    businessPartner : String(10);
    name            : String(80);
    ok              : Boolean;
    failed          : Integer;
    checks          : many Check;
    details         : SupplierDetails;
    invoices        : many Invoice;
    invoicesError   : String;
  }

  function supplierCheck(supplier : String(10)) returns SupplierCheck;
}
