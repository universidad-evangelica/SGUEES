using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_ACTOR_ASIGNACIONParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ASIGNACION { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public int CORR_ACTOR { get; set; }
        public int CORR_UNIDAD { get; set; }
        
    }
}