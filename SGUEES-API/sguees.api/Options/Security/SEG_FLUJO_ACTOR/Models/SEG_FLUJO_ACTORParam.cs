using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_ACTORParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ACTOR { get; set; }
        public string NOMBRE_ACTOR { get; set; }
        public int OPCION_CONSULTA { get; set; } = 0; // 0=Todos, 1=Activos
    }
}