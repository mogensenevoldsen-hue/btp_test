using from './external/API_BUSINESS_PARTNER';

service VendorService {
  type SupplierStatus {
    supplier          : String(10);
    name              : String(80);
    blocked           : Boolean;
    postingBlocked    : Boolean;
    purchasingBlocked : Boolean;
    paymentBlocked    : Boolean;
  }

  function supplierStatus(supplier : String(10)) returns SupplierStatus;
}
