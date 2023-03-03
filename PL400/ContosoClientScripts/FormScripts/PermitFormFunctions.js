if (typeof (ContosoPermit) == "undefined"){
    var ContosoPermit = {__namespace: true};
}

if (typeof (ContosoPermit.Scripts) == "undefined"){
    ContosoPermit.Scripts = {__namespace: true};
}

ContosoPermit.Scripts.PermitForm = {
    handleOnLoad: function (executionContext) {
        console.log('on load - permit form (UPDATE 1)');
        ContosoPermit.Scripts.PermitForm._handlePermitTypeSettings(executionContext);
    },
    handleOnChangePermitType: function (executionContext) {
        console.log('on change - permit type (UPDATE 1)');
        ContosoPermit.Scripts.PermitForm._handlePermitTypeSettings(executionContext);
    },
    _handlePermitTypeSettings: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var permitType = formContext.getAttribute("contoso_permittype").getValue();
        console.log("This is permit type value:" + permitType);
        if (permitType == null) {
            formContext.ui.tabs.get("InspectionsTab").setVisible(false);
            formContext.getAttribute("contoso_newsize").setRequiredLevel("none");
            formContext.ui.controls.get("contoso_newsize").setVisible(false);
            return;
        } else {
            var permitTypeID = permitType[0].id;
            Xrm.WebApi.retrieveRecord("contoso_permittype", permitTypeID).then(function (result) {
                if (result.contoso_requireinspections) {
                    formContext.ui.tabs.get("inspectionsTab").setVisible(true);
                } else {
                    formContext.ui.tabs.get("inspectionsTab").setVisible(false);
                }
                
                if (result.contoso_requiresize) {
                    formContext.ui.controls.get("contoso_newsize").setVisible(true);
                    formContext.getAttribute("contoso_newsize").setRequiredLevel("required");
                } else {
                    formContext.getAttribute("contoso_newsize").setRequiredLevel("none");
                    formContext.ui.controls.get("contoso_newsize").setVisible(false);
                }
            },
            function (error) { alert('Error:' + error.message) });
        }
    },
    _lockPermitRequest : function (permitID, reason) {
        this.entity = { entityType: "contoso_permit", id: permitID };
        this.Reason = reason;
        this.getMetadata = function () {
            return {
                boundParameter: "entity", parameterTypes: {
                    "entity": {
                        typeName: "mscrm.contoso_permit",
                        structuralProperty: 5
                    },
                    "Reason": {
                        "typeName": "Edm.String",
                        "structuralProperty": 1 // Primitive Type
                    }
                },
                operationType: 0, // This is an action. Use '1' for functions and '2' for CRUD
                operationName: "contoso_LockPermit",
            };
        };
    },
    lockPermit: function (primaryControl) {
        formContext = primaryControl;
        var PermitID = formContext.data.entity.getId().replace('{', '').replace('}', '');
        var lockPermitRequest = new ContosoPermit.Scripts.PermitForm._lockPermitRequest(PermitID, "Admin Lock");
          // Use the request object to execute the function
        Xrm.WebApi.online.execute(lockPermitRequest).then(
        function (result) {
            if (result.ok) {
                console.log("Status: %s %s", result.status, result.statusText);
                // perform other operations as required;
                formContext.ui.setFormNotification("Status " + result.status, "INFORMATION");
            }
        },
        function (error) {
            console.log(error.message);
            // handle error conditions
        }
    );
    },
    
    __namespace: true
}