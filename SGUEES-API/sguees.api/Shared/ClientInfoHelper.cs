using sguees.api.Shared;
using System.Net;

namespace sguees.api.Shared
{
    /// <summary>
    /// Servicio para obtener información del cliente (IP y nombre de máquina)
    /// que se registra en los campos ESTACION_CREA y ESTACION_ACTU.
    /// </summary>
    public static class ClientInfoHelper
    {
        /// <summary>
        /// Obtiene la IP del cliente y su hostname (si está disponible).
        /// Soporta X-Forwarded-For para reverse proxy (IIS/Nginx).
        /// Formato: "192.168.1.50 (PC-COMPRAS01)" o "192.168.1.50" si no hay hostname.
        /// </summary>
        public static string GetClientStation(HttpContext context)
        {
            // Priorizar X-Forwarded-For si hay reverse proxy
            var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace(ip))
            {
                ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            }
            else
            {
                // X-Forwarded-For puede tener múltiples IPs: "client, proxy1, proxy2"
                ip = ip.Split(',')[0].Trim();
            }

            // Normalizar IPv6 loopback a IPv4
            if (ip == "::1") ip = "127.0.0.1";

            // Intentar resolver hostname
            try
            {
                var hostEntry = Dns.GetHostEntry(ip);
                if (!string.IsNullOrEmpty(hostEntry.HostName) && hostEntry.HostName != ip)
                {
                    return $"{ip} ({hostEntry.HostName})";
                }
            }
            catch
            {
                // Si no puede resolver, solo devuelve la IP
            }

            return ip;
        }
    }
}
