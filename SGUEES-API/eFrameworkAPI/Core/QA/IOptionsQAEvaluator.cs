// Qué hace: permite anotar string? sin encender avisos de nulos en el resto del archivo.
// Cómo lo hace: habilita solo las anotaciones. El proyecto sigue con nulabilidad desactivada.
#nullable enable annotations
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
