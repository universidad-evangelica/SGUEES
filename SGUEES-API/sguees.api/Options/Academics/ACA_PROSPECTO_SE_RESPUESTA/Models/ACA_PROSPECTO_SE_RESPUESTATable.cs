using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_SE_RESPUESTA para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_SE_RESPUESTA.
    public class ACA_PROSPECTO_SE_RESPUESTATable : BaseEntity
    {
        public int CORR_RESPUESTA { get; set; }
        public int CORR_PROSPECTO_SOCIOECONOMICO { get; set; }
        public int CORR_PREGUNTA { get; set; }
        public string VALOR_TEXTO { get; set; }
        public decimal? VALOR_NUMERO { get; set; }
        public bool? VALOR_BIT { get; set; }
        public int? CORR_OPCION { get; set; }
        public string TEXTO_PREGUNTA_HISTORICO { get; set; }
        public string TEXTO_OPCION_HISTORICO { get; set; }
        public DateTime FECHA_RESPUESTA { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
