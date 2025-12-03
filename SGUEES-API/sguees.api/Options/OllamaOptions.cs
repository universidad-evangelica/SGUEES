namespace sguees.api.Options
{
    public class OllamaOptions
    {
        public const string SectionName = "Ollama";
        public string BaseUrl { get; set; } = "http://localhost:11434"; // default local
    }
}
