using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using eFrameworkAPI.Core.Options;

namespace eFrameworkAPI.Core.AI
{
    public class OllamaAIProvider : IAIProvider
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly OllamaOptions _options;

        public OllamaAIProvider(IHttpClientFactory httpClientFactory, OllamaOptions options)
        {
            _httpClientFactory = httpClientFactory;
            _options = options;
        }

        private class GenerateRequest
        {
            public string model { get; set; } = string.Empty;
            public string prompt { get; set; } = string.Empty;
            public bool stream { get; set; } = false;
        }

        private class GenerateResponse
        {
            public string? response { get; set; }
        }

        public async Task<string> CompleteAsync(string model, string prompt, CancellationToken ct = default)
        {
            var client = _httpClientFactory.CreateClient("ollama");
            var req = new GenerateRequest { model = model, prompt = prompt, stream = false };
            using var httpResponse = await client.PostAsJsonAsync("/api/generate", req, ct);
            httpResponse.EnsureSuccessStatusCode();
            var json = await httpResponse.Content.ReadAsStringAsync(ct);
            // Ollama returns JSON with 'response'.
            var doc = JsonSerializer.Deserialize<GenerateResponse>(json);
            return doc?.response ?? string.Empty;
        }
    }
}
