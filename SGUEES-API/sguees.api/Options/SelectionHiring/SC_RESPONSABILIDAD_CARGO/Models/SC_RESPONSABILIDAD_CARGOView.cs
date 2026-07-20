// DTO de lectura de responsabilidad del cargo (proyección de la vista SQL).
using System;

namespace SGUEES.Models
{
    // Campos expuestos por la vista de consulta de responsabilidad del cargo.
    public class SC_RESPONSABILIDAD_CARGOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_RESPONSABILIDAD { get; set; }
        public string NOMBRE_RESPONSABILIDAD { get; set; }
        // Estado del catálogo: true = activo, false = inactivo.
        public bool? ESTADO_RESPONSABILIDAD { get; set; }
        public string APLICA_DESCRIPTOR { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
