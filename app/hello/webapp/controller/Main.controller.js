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

    externalFailedCount: function (external) {
      const failed = (external?.results || []).filter((r) => r.status === "Failed").length;
      return failed ? String(failed) : "";
    },

    externalIconColor: function (external) {
      const failed = (external?.results || []).some((r) => r.status === "Failed");
      return external?.error || failed ? "Negative" : "Positive";
    },

    formatTimestamp: function (value) {
      return value ? new Date(value).toLocaleString() : "–";
    },

    onCheckSupplier: async function () {
      const supplierModel = this.getView().getModel("supplier");
      supplierModel.setData({});
      const supplier = this.byId("supplier").getValue().trim();
      if (!supplier) {
        return;
      }
      const operation = this.getView().getModel("vendor").bindContext("/supplierCheck(...)");
      operation.setParameter("supplier", supplier);
      try {
        await operation.invoke();
        supplierModel.setData(operation.getBoundContext().getObject());
        this.byId("tabs").setSelectedKey("checks");
      } catch (error) {
        MessageBox.error(error.message);
      }
    }
  });
});
