using Microsoft.AspNetCore.Http;

namespace sguees.api.framework
{
    public static class CExtensions
    {
        public static void AddApplicationError(this HttpResponse response, string message)
        {
            response.Headers["Application-Error"] = message;
            response.Headers["Access-Control-Expose-Headers"] = "Application-Error";
            response.Headers["Access-Control-Allow-Origin"] = "*";
        }
    }
}
