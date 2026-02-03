using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.DirectoryServices.AccountManagement;

namespace sguees.Services.Security
{
    public class ADUserInfo
    {
        public bool Exists { get; set; }
        public bool Enabled { get; set; }
        public bool Checked { get; set; }
    }

    public interface IActiveDirectoryService
    {
        Task<ADUserInfo> GetUserStatusAsync(string userSamAccountName);
    }

    public class ActiveDirectoryService : IActiveDirectoryService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<ActiveDirectoryService> _logger;

        public ActiveDirectoryService(IConfiguration config, ILogger<ActiveDirectoryService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task<ADUserInfo> GetUserStatusAsync(string userSamAccountName)
        {
            var result = new ADUserInfo { Exists = false, Enabled = false, Checked = false };

            try
            {
                var section = _config.GetSection("ActiveDirectory");
                var enabled = section.GetValue<bool>("Enabled");
                if (!enabled)
                {
                    _logger.LogInformation("[AD] Validación AD deshabilitada por configuración.");
                    return result; // No valida AD si está deshabilitado
                }

                var domain = section.GetValue<string>("Domain");
                var container = section.GetValue<string>("Container");
                var username = section.GetValue<string>("Username");
                var password = section.GetValue<string>("Password");

                return await Task.Run(() =>
                {
                    PrincipalContext context;
                    if (string.IsNullOrWhiteSpace(container))
                    {
                        context = string.IsNullOrWhiteSpace(username)
                            ? new PrincipalContext(ContextType.Domain, domain)
                            : new PrincipalContext(ContextType.Domain, domain, username, password);
                    }
                    else
                    {
                        context = string.IsNullOrWhiteSpace(username)
                            ? new PrincipalContext(ContextType.Domain, domain, container)
                            : new PrincipalContext(ContextType.Domain, domain, container, username, password);
                    }

                    using var user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, userSamAccountName);
                    if (user == null)
                    {
                        _logger.LogWarning($"[AD] Usuario no encontrado en AD: {userSamAccountName}");
                        return new ADUserInfo { Exists = false, Enabled = false, Checked = true };
                    }

                    var enabled = user.Enabled.HasValue ? user.Enabled.Value : false;
                    return new ADUserInfo { Exists = true, Enabled = enabled, Checked = true };
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[AD] Error consultando AD para usuario {userSamAccountName}: {ex.Message}");
                return result; // Checked=false evita bloquear por error de conectividad
            }
        }
    }
}
