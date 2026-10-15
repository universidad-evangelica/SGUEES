using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: llave de dbo.ACA_PROSPECTO_BECA_RESPUESTA para el repositorio.
    // Cómo lo hace: la pantalla lee la vista y actualiza la respuesta por su servicio.
    public class ACA_PROSPECTO_BECA_RESPUESTATable : BaseEntity
    {
        public int CORR_RESPUESTA_BECA { get; set; }
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_EMPRESA { get; set; }
    }
}
