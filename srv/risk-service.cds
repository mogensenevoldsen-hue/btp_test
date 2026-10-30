/**
 * Simulated external supplier risk provider (stands in for e.g. a business
 * registry, sanctions list and credit agency). All data is fictitious.
 */
@protocol : 'rest'
@path     : '/rest/risk'
@requires : 'any'
service RiskService {
  type BankAccountInput {
    iban       : String(34);
    account    : String(18);
    bankNumber : String(15);
  }

  type Result {
    check   : String;
    status  : String enum { OK; Warning; Failed };
    details : String;
  }

  type Assessment {
    provider       : String;
    simulated      : Boolean;
    checkedAt      : Timestamp;
    registeredName : String;
    riskScore      : Integer;
    riskRating     : String enum { Low; Medium; High };
    results        : many Result;
  }

  action assess(supplier : String(10), name : String(80), country : String(3), bankAccounts : many BankAccountInput) returns Assessment;
}
