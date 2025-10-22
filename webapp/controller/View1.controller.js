sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("project11.controller.View1", {

        onInit: function () {
            // JSONModel para armazenar os dados da tabela
            this._oJSONModel = new JSONModel({ items: [] });
            this.getView().setModel(this._oJSONModel, "local");
        },

        onSearch: function () {
            const oZTPINT = this.byId("inpZTPINT").getValue();
            const oZBATCH = this.byId("inpZBATCH").getValue();
            const oModel = this.getView().getModel(); // ODataModel
            const aFilters = [];

            if (oZTPINT) aFilters.push(new sap.ui.model.Filter("ZTPINT", sap.ui.model.FilterOperator.EQ, oZTPINT));
            if (oZBATCH) aFilters.push(new sap.ui.model.Filter("ZBATCH", sap.ui.model.FilterOperator.EQ, oZBATCH));

            oModel.read("/zbrv_036S", {
                filters: aFilters,
                success: (oData) => {
                    console.log("✅ Dados recebidos:", oData);
                    this.getView().getModel("local").setProperty("/items", oData.results);
                },
                error: (err) => {
                    sap.m.MessageBox.error("Erro ao buscar dados da tabela ZBRV_036S");
                    console.error(err);
                }
            });
        },

        onReprocessar: function () {
            const oTable = this.byId("tblMain");
            const aSelectedIndices = oTable.getSelectedIndices();

            // Exemplo: chama uma função OData ou serviço backend

            const oModel = this.getView().getModel();

            if (aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("Selecione pelo menos um item para reprocessar.");
                return;
            }

            // Pega os dados dos itens selecionados
            const aSelectedItems = aSelectedIndices.map((iIndex) => {
                const oContext = oTable.getContextByIndex(iIndex);
                return oContext ? oContext.getObject() : null;
            }).filter(Boolean);

            console.log("Itens selecionados para reprocessar:", aSelectedItems);

            sap.m.MessageBox.confirm(
                `Deseja reprocessar ${aSelectedItems.length} item(s)?`,
                {
                    actions: ["Sim", "Não"],
                    onClose: function (sAction) {
                        if (sAction === "Sim") {
                            // Loop por cada item selecionado
                            aSelectedIndices.forEach(iIndex => {
                                const oItem = oTable.getContextByIndex(iIndex).getObject();

                                oModel.callFunction("/Reprocessar", {
                                    method: "GET", // MiniSAP só aceita GET
                                    urlParameters: { INPUT: oItem.ZTPINT },
                                    success: () => sap.m.MessageToast.show(`Reprocessado ZTPINT=${oItem.ZTPINT}`),
                                    error: (err) => sap.m.MessageBox.error(`Erro ao reprocessar ZTPINT=${oItem.ZTPINT}`)
                                });
                            });
                        }
                    }
                }
            );
        },
        // 🔹 Evento disparado ao clicar na seta ">"
        onRowActionPress: function (oEvent) {
            const oContext = oEvent.getParameter("row").getBindingContext("local");
            if (!oContext) return;

            const oData = oContext.getObject();
            console.log("➡️ Navegando para detalhe:", oData);

            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Detail", {
                ZTPINT: encodeURIComponent(oData.ZTPINT),
                ZBATCH: encodeURIComponent(oData.ZBATCH)
            });
        }

    });
});
