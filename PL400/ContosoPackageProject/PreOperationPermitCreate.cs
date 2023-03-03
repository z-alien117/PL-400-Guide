using Microsoft.Xrm.Sdk;
using System;
using Microsoft.Xrm.Sdk.Query;

namespace ContosoPackageProject
{
    /// <summary>
    /// Plugin development guide: https://docs.microsoft.com/powerapps/developer/common-data-service/plug-ins
    /// Best practices and guidance: https://docs.microsoft.com/powerapps/developer/common-data-service/best-practices/business-logic/
    /// </summary>
    public class PreOperationPermitCreate : PluginBase
    {

        public PreOperationPermitCreate(string unsecureConfiguration, string secureConfiguration)
            : base(typeof(PreOperationPermitCreate))
        {
            // TODO: Implement your custom configuration handling
            // https://docs.microsoft.com/powerapps/developer/common-data-service/register-plug-in#set-configuration-data
        }

        // Entry point for custom business logic execution
        protected override void ExecuteDataversePlugin(ILocalPluginContext localPluginContext)
        {

            if (localPluginContext == null)
            {
                throw new ArgumentNullException(nameof(localPluginContext));
            }

            var context = localPluginContext.PluginExecutionContext;

            // TODO: Implement your custom business logic

            var permitEntity = context.InputParameters["Target"] as Entity;
            var buildSiteRef = permitEntity["contoso_buildsite"] as EntityReference;
            localPluginContext.Trace("Primary Entity Id: " + permitEntity.Id);
            localPluginContext.Trace("Build Site Entity Id: " + buildSiteRef.Id);
            string fetchString = "<fetch output-format='xml-platform' distinct='false' version='1.0' mapping='logical' aggregate='true'><entity name='contoso_permit'><attribute name='contoso_permitid' alias='Count' aggregate='count' /><filter type='and' ><condition attribute='contoso_buildsite' uitype='contoso_buildsite' operator='eq' value='{" + buildSiteRef.Id + "}'/><condition attribute='statuscode' operator='eq' value='[Locked Option Value]'/></filter></entity></fetch>";
            localPluginContext.Trace("Calling RetrieveMultiple for locked permits");
            var response = localPluginContext.InitiatingUserService.RetrieveMultiple(new FetchExpression(fetchString));
            int lockedPermitCount = (int)((AliasedValue)response.Entities[0]["Count"]).Value;
            localPluginContext.Trace("Locket Permit count : " + lockedPermitCount);
            if (lockedPermitCount > 0)
            {
                throw new InvalidPluginExecutionException("Too many locked permits for build site");
            }
            // Check for the entity on which the plugin would be registered
            //if (context.InputParameters.Contains("Target") && context.InputParameters["Target"] is Entity)
            //{
            //    var entity = (Entity)context.InputParameters["Target"];

            //    // Check for entity name on which this plugin would be registered
            //    if (entity.LogicalName == "account")
            //    {

            //    }
            //}
        }
    }
}
