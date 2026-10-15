using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: filtros del API de sedes de una facultad.
    // Cómo lo hace: CORR_EMPRESA lo pone el controlador; CORR_FACULTAD es obligatorio para listar.
    public class ACA_FACULTADES_SEDESParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FACULTAD { get; set; }
        public int CORR_SEDE { get; set; }
        public bool? ACTIVO { get; set; }
    }
}
