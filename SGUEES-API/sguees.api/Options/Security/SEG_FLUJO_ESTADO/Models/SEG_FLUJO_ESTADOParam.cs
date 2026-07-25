using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_ESTADOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ESTADO { get; set; }
        public int CORR_TIPO_DOCUMENTO { get; set; }
        public string NOMBRE_ESTADO { get; set; }
       
    }
}