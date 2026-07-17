// DTO de lectura de riesgo del puesto (proyección de la vista SQL).
using System;

namespace SGUEES.Models
{
    // Campos expuestos por la vista de consulta de riesgo del puesto.
    public class SC_RIESGO_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_RIESGO_PUESTO { get; set; }
        public string NOMBRE_RIESGO_PUESTO { get; set; }
        public bool? ESTADO_RIESGO_PUESTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
