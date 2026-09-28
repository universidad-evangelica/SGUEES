// Qué hace: campos de escritura de PLA_PUESTO.
// Cómo: código, nombre, tipo, activo, aprobación, misión, otros aspectos y auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class PLA_PUESTOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PUESTO { get; set; }
        public string CODIGO_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public int? CORR_TIPO_PUESTO { get; set; }
        public bool? ACTIVO_PUESTO { get; set; } = true;
        public bool? APROBACION_PUESTO { get; set; }
        public string MISION_PUESTO { get; set; }
        public string OTROS_ASPECTOS { get; set; }
        public string USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
    }
}
