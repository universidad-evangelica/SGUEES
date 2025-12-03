namespace eFrameworkAPI.Core.Options
{
    public class OllamaOptions
    {
        public const string SectionName = "Ollama";
        public string BaseUrl { get; set; } = "http://localhost:11434";
    }
}
