using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_LIMITACION_FISICA para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_LIMITACION_FISICA.
    public class ACA_PROSPECTO_LIMITACION_FISICATable : BaseEntity
    {
        public int CORR_PROSPECTO_LIMITACION_FISICA { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_LIMITACION_FISICA { get; set; }
        public string ESPECIFIQUE { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
