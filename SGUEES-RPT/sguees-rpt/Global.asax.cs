using System.Web.Http;

namespace sgueesRpt
{
	public class WebApiApplication : System.Web.HttpApplication
	{
		protected void Application_Start()
		{
			GlobalConfiguration.Configure(WebApiConfig.Register);
			// No llamar ASPxWebDocumentViewer.StaticInitialize aquí:
			// en IIS tumba el AppPool si el viewer no está completo.
			// SelectionHiring.aspx lo inicializa solo al abrir el visor.
		}
	}
}
