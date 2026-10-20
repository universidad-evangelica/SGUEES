// Qué hace: permite anotar string? sin encender avisos de nulos en el resto del archivo.
// Cómo lo hace: habilita solo las anotaciones. El proyecto sigue con nulabilidad desactivada.
#nullable enable annotations
namespace eFrameworkAPI.Core.AI
{
    public interface IAIModelRouter
    {
        string GetDefaultModel();
        string ResolveModel(string? requestedModel);
    }
}
