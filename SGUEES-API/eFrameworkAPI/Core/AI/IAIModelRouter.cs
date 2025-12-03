namespace eFrameworkAPI.Core.AI
{
    public interface IAIModelRouter
    {
        string GetDefaultModel();
        string ResolveModel(string? requestedModel);
    }
}
