using System;

namespace sguees.Models
{
    public class SEG_FLUJO_INSTANCIAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_INSTANCIA { get; set; }
        public int CORR_TIPO_DOCUMENTO { get; set; }
        public int CORR_DOCUMENTO { get; set; }
        public int CORR_FLUJO_PROCESO { get; set; }
        public int? CORR_PASO_ACTUAL { get; set; }
        public int CORR_ESTADO_ACTUAL { get; set; }
        public int CORR_UNIDAD_DOCUMENTO { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
