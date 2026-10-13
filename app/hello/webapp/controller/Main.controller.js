sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox"
], function (Controller, MessageBox) {
  "use strict";

  return Controller.extend("hello.controller.Main", {
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
    }
  });
});
