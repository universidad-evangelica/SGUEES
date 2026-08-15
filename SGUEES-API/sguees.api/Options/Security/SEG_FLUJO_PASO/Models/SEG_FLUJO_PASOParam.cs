using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_PASOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PASO { get; set; }
        public int CORR_FLUJO_PROCESO { get; set; }
        public string NOMBRE_PASO { get; set; }
        public int OPCION_CONSULTA { get; set; } = 0; // 0=Todos, 1=Activos, 2=PorFlujo
    }
}