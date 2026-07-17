// DTO de lectura de disponibilidad de horario (proyección de la vista SQL).
using System;

namespace SGUEES.Models
{
    // Campos expuestos por la vista de consulta de disponibilidad de horario.
    public class SC_DISPONIBILIDAD_HORARIOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DISPONIBILIDAD_HORARIO { get; set; }
        public string NOMBRE_DISPONIBILIDAD_HORARIO { get; set; }
        public bool? ESTADO_DISPONIBILIDAD_HORARIO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
