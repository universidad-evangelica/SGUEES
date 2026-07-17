using System;

namespace SGUEES.Models
{
    // Filas leídas desde V_PLA_TIPO_PUESTO para consultas.
    public class PLA_TIPO_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_TIPO_PUESTO { get; set; } // PK del catálogo
        public string NOMBRE_TIPO_PUESTO { get; set; }
        public string CODIGO_TIPO_PUESTO { get; set; } // Código único por empresa
        public bool? ESTADO_TIPO_PUESTO { get; set; } // Activo/inactivo
        public string USUARIO_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
    }
}
