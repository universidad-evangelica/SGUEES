using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_PASO_ACTOR_DESTINOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PASO_ACTOR_DESTINO { get; set; }
        public int CORR_PASO { get; set; }
        public int CORR_ACTOR { get; set; }
        public int? CORR_UNIDAD { get; set; }
        public int ORDEN { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}