using System.Collections.Generic;

namespace eFrameworkAPI.Core.QA
{
    public class OptionsQAFinding
    {
        public string Severity { get; set; } = "info"; // info | warning | error
        public string Key { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Suggestion { get; set; }
    }

    public interface IOptionsQAEvaluator
    {
        IEnumerable<OptionsQAFinding> Evaluate();
    }
}
