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

    onSayHello: async function () {
      const name = this.byId("name").getValue() || "World";
      const operation = this.getView().getModel().bindContext("/hello(...)");
      operation.setParameter("to", name);
      try {
        await operation.invoke();
        this.byId("greeting").setText(operation.getBoundContext().getProperty("value"));
      } catch (error) {
        MessageBox.error(error.message);
      }
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
