// Qué hace: lectura de V_PLA_PUESTO con el nombre del tipo de puesto.
// Cómo: proyecta las columnas vigentes de PLA_PUESTO más NOMBRE_TIPO_PUESTO.
using System;

namespace SGUEES.Models
{
    public class PLA_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PUESTO { get; set; }
        public string CODIGO_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public int? CORR_TIPO_PUESTO { get; set; }
        public string NOMBRE_TIPO_PUESTO { get; set; }
        public bool? ACTIVO_PUESTO { get; set; }
        public bool? APROBACION_PUESTO { get; set; }
        public string MISION_PUESTO { get; set; }
        public string OTROS_ASPECTOS { get; set; }
        public string USUARIO_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
    }
}
