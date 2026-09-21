using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_MEDIO_ORIGEN para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_MEDIO_ORIGEN.
    public class ACA_PROSPECTO_MEDIO_ORIGENTable : BaseEntity
    {
        public int CORR_PROSPECTO_MEDIO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_MEDIO_ORIGEN { get; set; }
        public string DESCRIPCION { get; set; }
        public string ESTUDIANTE_REFIERE { get; set; }
        public int? CORR_CARRERA_REFIERE { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
