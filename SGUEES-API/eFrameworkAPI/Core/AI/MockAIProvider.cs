using System.Text;

namespace eFrameworkAPI.Core.AI
{
    public class MockAIProvider : IAIProvider
    {
        public Task<string> CompleteAsync(string model, string prompt, CancellationToken ct = default)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"[modelo={model}] Resumen preliminar:");
            sb.AppendLine(prompt.Length > 0 ? prompt : "(prompt vacío)");
            sb.AppendLine("-- Respuesta simulada (Mock) --");
            return Task.FromResult(sb.ToString());
        }
    }
}
