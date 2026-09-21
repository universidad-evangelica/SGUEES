using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_SOCIOECONOMICO (cabecera del estudio socioeconómico del prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_SOCIOECONOMICOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO_SOCIOECONOMICO { get; set; }
        public int CORR_VERSION { get; set; }
        public string CODIGO_VERSION { get; set; }
        public string NOMBRE_VERSION { get; set; }
        public bool TERMINOS_ACEPTADOS { get; set; }
        public bool APLICA_CUOTA_MAXIMA { get; set; }
        public int? CORR_TIPO_INSTITUCION { get; set; }
        public string TIPO_INSTITUCION_NOMBRE { get; set; }
        public DateTime FECHA_REGISTRO { get; set; }
        public DateTime? FECHA_ACTUALIZACION { get; set; }
        public int TOTAL_PREGUNTAS { get; set; }
        public int PREGUNTAS_RESPONDIDAS { get; set; }
    }
}
