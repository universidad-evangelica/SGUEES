// Qué hace: campos de escritura de GEN_UNIDADES_PUESTO (puestos asignados a unidades).
// Cómo: representa la fila de la tabla intermedia con auditoría (sin ACTIVO).
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class GEN_UNIDADES_PUESTOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public int CORR_PUESTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
