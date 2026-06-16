using System.Collections.Concurrent;
using System.Net;

namespace sguees.api.Shared
{
    /// <summary>
    /// Middleware de rate limiting para endpoints públicos (login, reset password).
    /// Limita peticiones por IP para prevenir ataques de fuerza bruta.
    /// </summary>
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly int _maxRequests;
        private readonly TimeSpan _window;
        private readonly HashSet<string> _protectedPaths;

        // Almacena intentos por IP: IP -> lista de timestamps
        private static readonly ConcurrentDictionary<string, List<DateTime>> _requestLog = new();

        // Limpieza periódica de registros expirados
        private static readonly Timer _cleanupTimer = new(_ =>
        {
            var cutoff = DateTime.UtcNow.AddMinutes(-30);
            foreach (var key in _requestLog.Keys)
            {
                if (_requestLog.TryGetValue(key, out var timestamps))
                {
                    lock (timestamps)
                    {
                        timestamps.RemoveAll(t => t < cutoff);
                        if (timestamps.Count == 0)
                        {
                            List<DateTime> removed;
                            _requestLog.TryRemove(key, out removed);
                        }
                    }
                }
            }
        }, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));

        public RateLimitingMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;

            // Configuración desde appsettings (con defaults seguros)
            var section = configuration.GetSection("RateLimiting");
            _maxRequests = section.GetValue("MaxRequests", 10);
            _window = TimeSpan.FromSeconds(section.GetValue("WindowSeconds", 60));

            // Paths protegidos (endpoints anónimos sensibles)
            _protectedPaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "/seg_usuario/login",
                "/seg_usuario/cambio-clave",
                "/seg_usuario/solicitar-restablecer-contrasena",
                "/seg_usuario/forgot-password",
                "/seg_usuario/restablecer-contrasena",
                "/seg_usuario/reset-password"
            };
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value ?? string.Empty;

            // Solo aplicar a endpoints protegidos
            if (!_protectedPaths.Contains(path))
            {
                await _next(context);
                return;
            }

            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var now = DateTime.UtcNow;

            var timestamps = _requestLog.GetOrAdd(clientIp, _ => new List<DateTime>());

            bool limitExceeded;
            lock (timestamps)
            {
                // Limpiar registros fuera de la ventana
                timestamps.RemoveAll(t => t < now - _window);

                if (timestamps.Count >= _maxRequests)
                {
                    limitExceeded = true;
                }
                else
                {
                    limitExceeded = false;
                    timestamps.Add(now);
                }
            }

            if (limitExceeded)
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = _window.TotalSeconds.ToString("F0");
                await context.Response.WriteAsJsonAsync(new
                {
                    Result = false,
                    ErrorCode = 429,
                    ErrorMessage = "Demasiados intentos. Intente de nuevo en " + _window.TotalSeconds + " segundos."
                });
                return;
            }

            await _next(context);
        }
    }
}
