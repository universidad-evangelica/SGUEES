using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_PASOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PASO { get; set; }
        public int CORR_FLUJO_PROCESO { get; set; }
        public decimal ORDEN { get; set; }
        public string NOMBRE_PASO { get; set; }
        public int CORR_ACTOR_ORIGEN { get; set; }
        public int? CORR_ESTADO_ORIGEN { get; set; }
        public int? CORR_ESTADO_ORIGEN_ALT { get; set; }
        public int? CORR_PASO_RETORNO { get; set; }
        public int? CORR_UNIDAD_DESTINO { get; set; }
        public int? CORR_ACTOR_DESTINO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}