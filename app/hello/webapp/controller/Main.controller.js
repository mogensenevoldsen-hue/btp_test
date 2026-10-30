sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
  "use strict";

  return Controller.extend("hello.controller.Main", {
    onInit: function () {
      this.getView().setModel(new JSONModel({}), "supplier");
    },

    onLookupSupplier: async function () {
      const supplierModel = this.getView().getModel("supplier");
      supplierModel.setData({});
      const supplier = this.byId("supplier").getValue().trim();
      if (!supplier) {
        return;
      }
      const operation = this.getView().getModel("vendor").bindContext("/supplierStatus(...)");
      operation.setParameter("supplier", supplier);
      try {
        await operation.invoke();
        supplierModel.setData(operation.getBoundContext().getObject());
      } catch (error) {
        MessageBox.error(error.message);
      }
    }
  });
});
