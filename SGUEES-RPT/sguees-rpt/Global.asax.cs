using System;
using System.Web;
using System.Web.Http;
using DevExpress.XtraReports.Web;

namespace sgueesRpt
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            // Inicializa el Document Viewer (recursos / handlers).
            ASPxWebDocumentViewer.StaticInitialize();
        }
    }
}
