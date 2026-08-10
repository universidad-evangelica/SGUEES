// Qué hace: campos de escritura de SC_UNIDADES_TIPO_USUARIO (unidades visibles por tipo de usuario/rol).
// Cómo: representa la fila de la tabla intermedia con ACTIVO y auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_UNIDADES_TIPO_USUARIOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public int TIPO_USUARIO { get; set; }
        public bool? ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
