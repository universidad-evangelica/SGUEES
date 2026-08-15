// Entidad de persistencia de riesgo del puesto (mapeo a la tabla).
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de tabla de riesgo del puesto, incluyendo auditoría.
    public class SC_RIESGO_PUESTOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_RIESGO_PUESTO { get; set; }
        public string NOMBRE_RIESGO_PUESTO { get; set; }
        // Estado del catálogo: true = activo, false = inactivo.
        public bool? ESTADO_RIESGO_PUESTO { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
