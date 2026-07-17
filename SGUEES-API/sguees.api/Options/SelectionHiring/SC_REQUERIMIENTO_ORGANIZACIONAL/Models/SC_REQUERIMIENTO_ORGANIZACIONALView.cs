// DTO de lectura de requerimiento organizacional (proyección de la vista SQL).
using System;

namespace SGUEES.Models
{
    // Campos expuestos por la vista de consulta de requerimiento organizacional.
    public class SC_REQUERIMIENTO_ORGANIZACIONALView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_REQUERIMIENTO_ORGANIZACIONAL { get; set; }
        public string DESCRIPCION { get; set; }
        public bool? ESTADO_REQUERIMIENTO_ORGANIZACIONAL { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
