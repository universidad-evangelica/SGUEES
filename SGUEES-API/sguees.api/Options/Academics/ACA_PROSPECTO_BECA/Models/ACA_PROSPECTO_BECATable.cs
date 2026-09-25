using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: espejo mínimo de dbo.ACA_PROSPECTO_BECA.
    // Cómo lo hace: la consulta administrativa no escribe la solicitud; IRepository exige la entidad.
    public class ACA_PROSPECTO_BECATable : BaseEntity
    {
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_BECA { get; set; }
        public string ESTADO_BECA { get; set; }
        public decimal? PUNTAJE_TOTAL { get; set; }
        public decimal? PORCENTAJE_TOTAL { get; set; }
        public string RESULTADO_EVALUACION { get; set; }
        public string PRIORIDAD_EVALUACION { get; set; }
        public DateTime FECHA_SOLICITUD { get; set; }
        public int CORR_EMPRESA { get; set; }
    }
}
