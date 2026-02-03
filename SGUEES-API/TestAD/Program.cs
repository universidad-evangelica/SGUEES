using System;
using System.DirectoryServices.AccountManagement;
using Microsoft.Extensions.Configuration;

Console.WriteLine("=== Test de Conexión Active Directory ===\n");

// Cargar configuración desde el proyecto principal
var config = new ConfigurationBuilder()
    .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: true)
    .Build();

var enabled = config.GetValue<bool>("ActiveDirectory:Enabled");
var domain = config.GetValue<string>("ActiveDirectory:Domain");
var container = config.GetValue<string>("ActiveDirectory:Container");
var username = config.GetValue<string>("ActiveDirectory:Username");
var password = config.GetValue<string>("ActiveDirectory:Password");

Console.WriteLine($"Enabled: {enabled}");
Console.WriteLine($"Domain: {domain}");
Console.WriteLine($"Container: {container}");
Console.WriteLine($"Username: {username}");
Console.WriteLine($"Password: {(string.IsNullOrWhiteSpace(password) ? "(vacío)" : "***")}\n");

if (!enabled)
{
    Console.WriteLine("❌ ActiveDirectory.Enabled = false. Activalo en appsettings.json");
    return;
}

Console.WriteLine("Intentando conectar al dominio...");

try
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

    Console.WriteLine("✅ Conexión al dominio exitosa!\n");

    // Solicitar usuario a buscar
    Console.Write("Ingresa el SamAccountName del usuario a buscar (ej. jonathan.avalos): ");
    var samAccountName = Console.ReadLine();

    if (string.IsNullOrWhiteSpace(samAccountName))
    {
        Console.WriteLine("No se ingresó usuario.");
        return;
    }

    Console.WriteLine($"\nBuscando usuario: {samAccountName}...");

    using var user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, samAccountName);
    
    if (user == null)
    {
        Console.WriteLine($"❌ Usuario '{samAccountName}' NO encontrado en AD");
        return;
    }

    Console.WriteLine($"✅ Usuario encontrado!");
    Console.WriteLine($"  - DisplayName: {user.DisplayName}");
    Console.WriteLine($"  - Email: {user.EmailAddress}");
    Console.WriteLine($"  - SamAccountName: {user.SamAccountName}");
    Console.WriteLine($"  - DistinguishedName: {user.DistinguishedName}");
    Console.WriteLine($"  - Enabled: {(user.Enabled.HasValue ? user.Enabled.Value.ToString() : "N/A")}");
    Console.WriteLine($"  - LastLogon: {(user.LastLogon.HasValue ? user.LastLogon.Value.ToString() : "N/A")}");

    context.Dispose();
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    Console.WriteLine($"Tipo: {ex.GetType().Name}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"Inner: {ex.InnerException.Message}");
    }
}
