// DTO de lectura de impacto económico (proyección de la vista SQL).
using System;

namespace SGUEES.Models
{
    // Qué hace: representa los campos expuestos por la vista de consulta de impacto económico.
    public class SC_IMPACTO_ECONOMICOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_IMPACTO_ECONOMICO { get; set; }
        public string DESCRIPCION { get; set; }
        public bool? ESTADO_IMPACTO_ECONOMICO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
