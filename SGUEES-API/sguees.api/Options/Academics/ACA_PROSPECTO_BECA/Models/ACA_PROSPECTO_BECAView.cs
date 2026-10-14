using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_BECA_CONSULTA (solicitud en borrador o enviada).
    // Cómo lo hace: cada tipo coincide con la vista; eFramework asigna sin convertir.
    public class ACA_PROSPECTO_BECAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public string CODIGO_PROSPECTO { get; set; }
        public string NOMBRE_COMPLETO { get; set; }
        public string DUI { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public int CORR_BECA { get; set; }
        public string CODIGO_BECA { get; set; }
        public string NOMBRE_BECA { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public short ANIO { get; set; }
        public byte? NUMERO_PERIODO { get; set; }
        public string CICLO { get; set; }
        public string ESTADO_BECA { get; set; }
        public string ESTADO_BECA_TEXTO { get; set; }
        public decimal? PUNTAJE_TOTAL { get; set; }
        public decimal? PORCENTAJE_TOTAL { get; set; }
        public string RESULTADO_EVALUACION { get; set; }
        public string PRIORIDAD_EVALUACION { get; set; }
        public DateTime FECHA_SOLICITUD { get; set; }
    }
}
