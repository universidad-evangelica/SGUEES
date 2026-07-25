using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_PASO_ACCION_ESTADOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FLUJO_PROCESO { get; set; }
        public int CORR_PASO { get; set; }
        public int CORR_ACCION { get; set; }
        public int CORR_ESTADO_DESTINO { get; set; }
        public bool PERMITIDO { get; set; }
        public byte CORR_TIPO_MOVIMIENTO { get; set; }
        public byte CORR_TIPO_NOTIFICACION { get; set; }
        public int? CORR_PASO_DESTINO { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}