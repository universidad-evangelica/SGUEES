using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_SE_RESPUESTA (preguntas de la versión del estudio socioeconómico con su respuesta).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_SE_RESPUESTAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_SOCIOECONOMICO { get; set; }
        public int CORR_VERSION { get; set; }
        public int CORR_VERSION_PREGUNTA { get; set; }
        public int ORDEN { get; set; }
        public bool ES_REQUERIDO { get; set; }
        public int CORR_PREGUNTA { get; set; }
        public string CODIGO_PREGUNTA { get; set; }
        public int CORR_TIPO_PREGUNTA { get; set; }
        public string TIPO_PREGUNTA { get; set; }
        public string TIPO_PREGUNTA_NOMBRE { get; set; }
        public string ENUNCIADO { get; set; }
        public string AYUDA { get; set; }
        public int? CORR_RESPUESTA { get; set; }
        public string VALOR_TEXTO { get; set; }
        public decimal? VALOR_NUMERO { get; set; }
        public bool? VALOR_BIT { get; set; }
        public int? CORR_OPCION { get; set; }
        public string TEXTO_OPCION { get; set; }
        public string TEXTO_OPCIONES_MULTIPLES { get; set; }
        public bool? TIENE_RESPUESTA { get; set; }
        public DateTime? FECHA_RESPUESTA { get; set; }
    }
}
