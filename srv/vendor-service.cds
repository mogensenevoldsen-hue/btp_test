using from './external/API_BUSINESS_PARTNER';
using from './external/API_SUPPLIERINVOICE_PROCESS_SRV';

service VendorService {
  type Check {
    check   : String;
    ok      : Boolean;
    details : String;
  }

  type Detail {
    label : String;
    value : String;
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
    details         : many Detail;
    invoices        : many Invoice;
    invoicesError   : String;
  }

  function supplierCheck(supplier : String(10)) returns SupplierCheck;
}
