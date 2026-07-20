// Qué hace: DTO de lectura de frecuencia.
// Cómo: proyecta los campos de la vista V_SC_FRECUENCIA usada por las consultas.
using System;

namespace SGUEES.Models
{
    // Qué hace: representa los campos de la vista V_SC_FRECUENCIA.
    // Cómo: expone el correlativo, el nombre, el estado y los campos de auditoría devueltos por las consultas.
    public class SC_FRECUENCIAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FRECUENCIA { get; set; }
        public string NOMBRE_FRECUENCIA { get; set; }
        // Indica si la frecuencia está activa (true) o inactiva (false).
        public bool? ESTADO_FRECUENCIA { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
