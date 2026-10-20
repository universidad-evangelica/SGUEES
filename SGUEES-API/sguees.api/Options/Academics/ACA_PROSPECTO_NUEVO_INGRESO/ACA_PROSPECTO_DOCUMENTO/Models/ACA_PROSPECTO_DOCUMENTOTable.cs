using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: tipo requerido por el repositorio base. Esta pantalla solo consulta.
    public class ACA_PROSPECTO_DOCUMENTOTable : BaseEntity
    {
        public int CORR_PROSPECTO_DOCUMENTO { get; set; }
    }
}
