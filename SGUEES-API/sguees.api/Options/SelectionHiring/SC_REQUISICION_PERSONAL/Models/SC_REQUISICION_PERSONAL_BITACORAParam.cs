using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_REQUISICION_PERSONAL_BITACORAParam: BaseParam
    {
        //public int CORR_EMPRESA { get; set; }
        public int CORR_TIPO_DOCUMENTO { get; set; } //Documento del flujo
        public int CORR_REQUISICION_PERSONAL { get; set; } //id requisicion
    }
}
