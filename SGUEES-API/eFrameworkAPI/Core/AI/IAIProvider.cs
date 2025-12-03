namespace eFrameworkAPI.Core.AI
{
    public interface IAIProvider
    {
        // Returns a completion for a given prompt using the specified model name
        Task<string> CompleteAsync(string model, string prompt, CancellationToken ct = default);
    }
}
