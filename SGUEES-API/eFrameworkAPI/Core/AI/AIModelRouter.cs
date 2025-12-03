using eFrameworkAPI.Core.Options;

namespace eFrameworkAPI.Core.AI
{
    public class AIModelRouter : IAIModelRouter
    {
        private readonly AIOptions _options;

        public AIModelRouter(AIOptions options)
        {
            _options = options;
        }

        public string GetDefaultModel()
        {
            return string.IsNullOrWhiteSpace(_options.DefaultAIModel) ? "" : _options.DefaultAIModel;
        }

        public string ResolveModel(string? requestedModel)
        {
            if (!string.IsNullOrWhiteSpace(requestedModel))
            {
                return requestedModel!;
            }
            return GetDefaultModel();
        }
    }
}
