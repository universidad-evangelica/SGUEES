using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_REQUISICION_PERSONALParam: BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_REQUISICION_PERSONAL { get; set; }
        public int OPCION_CONSULTA { get; set; } = 0;
    }
}
