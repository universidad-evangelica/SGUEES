using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_ACTOR_ASIGNACIONTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ASIGNACION { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public int CORR_ACTOR { get; set; }
        public int CORR_UNIDAD { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
     
    }
}