using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using scueesRpt.Controllers;


namespace scueesRpt
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {                     
            config.MapHttpAttributeRoutes();

            config.MessageHandlers.Add(new TokenValidationHandler());

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}"                
            );            
        }

    }
}
