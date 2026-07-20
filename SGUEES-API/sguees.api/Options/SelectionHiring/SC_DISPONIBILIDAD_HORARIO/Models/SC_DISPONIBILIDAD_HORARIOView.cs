// Qué hace: DTO de lectura de disponibilidad de horario.
// Cómo: proyecta los campos de la vista V_SC_DISPONIBILIDAD_HORARIO usada por las consultas.
using System;

namespace SGUEES.Models
{
    // Qué hace: representa los campos de la vista V_SC_DISPONIBILIDAD_HORARIO.
    // Cómo: expone el correlativo, el nombre, el estado y los campos de auditoría devueltos por las consultas.
    public class SC_DISPONIBILIDAD_HORARIOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DISPONIBILIDAD_HORARIO { get; set; }
        public string NOMBRE_DISPONIBILIDAD_HORARIO { get; set; }
        // Indica si la disponibilidad de horario está activa (true) o inactiva (false).
        public bool? ESTADO_DISPONIBILIDAD_HORARIO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
