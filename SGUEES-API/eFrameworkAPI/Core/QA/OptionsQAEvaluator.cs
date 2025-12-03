using System;
using System.Collections.Generic;
using System.Linq;
using eFrameworkAPI.Core.Options;
using Microsoft.Extensions.Configuration;

namespace eFrameworkAPI.Core.QA
{
    public class OptionsQAEvaluator : IOptionsQAEvaluator
    {
        private readonly IConfiguration _config;

        public OptionsQAEvaluator(IConfiguration config)
        {
            _config = config;
        }

        public IEnumerable<OptionsQAFinding> Evaluate()
        {
            var findings = new List<OptionsQAFinding>();

            // AI options checks
            var aiDefaultModel = _config["AI:DefaultAIModel"];
            if (string.IsNullOrWhiteSpace(aiDefaultModel))
            {
                findings.Add(new OptionsQAFinding
                {
                    Severity = "warning",
                    Key = "AI:DefaultAIModel",
                    Message = "El modelo IA por defecto está vacío.",
                    Suggestion = "Establece 'llama3' u otro modelo válido."
                });
            }

            // Ollama base URL
            var ollamaBaseUrl = _config["Ollama:BaseUrl"];
            if (string.IsNullOrWhiteSpace(ollamaBaseUrl))
            {
                findings.Add(new OptionsQAFinding
                {
                    Severity = "error",
                    Key = "Ollama:BaseUrl",
                    Message = "Ollama BaseUrl no está configurado.",
                    Suggestion = "Configura 'http://localhost:11434' si usas Ollama local."
                });
            }
            else if (!Uri.TryCreate(ollamaBaseUrl, UriKind.Absolute, out var uri) || (uri.Scheme != "http" && uri.Scheme != "https"))
            {
                findings.Add(new OptionsQAFinding
                {
                    Severity = "error",
                    Key = "Ollama:BaseUrl",
                    Message = "La URL de Ollama no es válida.",
                    Suggestion = "Usa una URL absoluta HTTP/HTTPS válida."
                });
            }

            // ConnectionStrings basic checks
            var defaultConn = _config.GetSection("ConnectionStrings").GetChildren().FirstOrDefault();
            if (defaultConn == null || string.IsNullOrWhiteSpace(defaultConn.Value))
            {
                findings.Add(new OptionsQAFinding
                {
                    Severity = "error",
                    Key = "ConnectionStrings",
                    Message = "No hay cadenas de conexión configuradas.",
                    Suggestion = "Define al menos una cadena de conexión válida."
                });
            }

            // ASP.NET URLs alignment with proxy
            var aspnetUrls = _config["ASPNETCORE_URLS"];
            if (!string.IsNullOrWhiteSpace(aspnetUrls) && !aspnetUrls.Contains("http://localhost:5198"))
            {
                findings.Add(new OptionsQAFinding
                {
                    Severity = "info",
                    Key = "ASPNETCORE_URLS",
                    Message = "La API puede estar escuchando en URLs distintas al proxy configurado en Angular (5198).",
                    Suggestion = "Alinear el proxy `SGUEES-SPA/proxy.conf.json` con las URLs activas."
                });
            }

            // Logging level basic sanity (optional)
            var loggingLevel = _config["Logging:LogLevel:Default"];
            if (string.Equals(loggingLevel, "None", StringComparison.OrdinalIgnoreCase))
            {
                findings.Add(new OptionsQAFinding
                {
                    Severity = "warning",
                    Key = "Logging:LogLevel:Default",
                    Message = "Nivel de logging 'None' puede dificultar el soporte.",
                    Suggestion = "Usa 'Information' en desarrollo."
                });
            }

            return findings;
        }
    }
}
