using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_SOCIOECONOMICO para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_SOCIOECONOMICO.
    public class ACA_PROSPECTO_SOCIOECONOMICOTable : BaseEntity
    {
        public int CORR_PROSPECTO_SOCIOECONOMICO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public bool TERMINOS_ACEPTADOS { get; set; }
        public bool APLICA_CUOTA_MAXIMA { get; set; }
        public int? CORR_TIPO_INSTITUCION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public int CORR_VERSION { get; set; }
    }
}
