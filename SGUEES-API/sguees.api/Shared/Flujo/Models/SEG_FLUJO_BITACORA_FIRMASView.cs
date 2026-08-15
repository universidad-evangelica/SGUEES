using System;

namespace sguees.Models
{
    public class SEG_FLUJO_BITACORA_FIRMASView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_TIPO_DOCUMENTO { get; set; }
        public int CORR_DOCUMENTO { get; set; }
        public int CORR_INSTANCIA { get; set; }
        public int CORR_BITACORA { get; set; }
        public int CORR_PASO { get; set; }
        public int? CORR_ESTADO_ANTERIOR { get; set; }
        public int CORR_ESTADO_NUEVO { get; set; }
        public string ESTADO_DESTINO { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public string COMENTARIO { get; set; }
        public DateTime FECHA_ACCION { get; set; }
        public DateTime FECHA_BITACORA { get; set; }
        public int CORR_UNIDAD_EJECUTOR { get; set; }
        public string NOMBRE_PASO { get; set; }
        public string ESTADO_ORIGEN { get; set; }
        public int ORDEN_FIRMA { get; set; }
    }
}