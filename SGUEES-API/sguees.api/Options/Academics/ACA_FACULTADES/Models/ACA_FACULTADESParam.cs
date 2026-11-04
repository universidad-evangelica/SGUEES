using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: filtros que acepta el API de facultades (query string).
    // Cómo lo hace: CORR_EMPRESA siempre lo pone el controlador desde el token; el resto es opcional.
    public class ACA_FACULTADESParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FACULTAD { get; set; }
        public string CODIGO_FACULTAD { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public bool? ACTIVO { get; set; }
    }
}
