sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
  "use strict";

  return Controller.extend("project11.controller.Detail", {
    onInit: function () {
      // Cria o model local 'detail'
      this._oJSONModel = new JSONModel({ items: [] });
      this.getView().setModel(this._oJSONModel, "detail");

      const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
    },
    // Botao pra voltar
    onNavBack: function () {
      const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("RouteView1");  
    },

// Buscar
    _onObjectMatched: function (oEvent) {
      const sZTPINT = decodeURIComponent(oEvent.getParameter("arguments").ZTPINT);
      const sZBATCH = decodeURIComponent(oEvent.getParameter("arguments").ZBATCH);

      const oModel = this.getView().getModel();

      // Navegação via associação
      const sPath = `/zbrv_036S(ZTPINT='${sZTPINT}',ZBATCH='${sZBATCH}')/toZbrv_037`;

      oModel.read(sPath, {
        success: (oData) => {
          console.log("✅ Dados via toZbrv_037:", oData);
          this._oJSONModel.setProperty("/items", oData.results);
        },
        error: (err) => {
          MessageBox.error("Erro ao buscar dados via toZbrv_037");
          console.error(err);
        }
      });
    }
  });
});
