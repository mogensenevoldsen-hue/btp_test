using from './external/API_BUSINESS_PARTNER';

service VendorService {
  type Check {
    check   : String;
    ok      : Boolean;
    details : String;
  }

  type SupplierCheck {
    supplier        : String(10);
    businessPartner : String(10);
    name            : String(80);
    ok              : Boolean;
    failed          : Integer;
    checks          : many Check;
  }

  function supplierCheck(supplier : String(10)) returns SupplierCheck;
}
