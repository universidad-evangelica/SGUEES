using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_REQUISICION_PERSONAL_BITACORAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_REQUISICION_PERSONAL { get; set; }
        public string NOMBRE_ESTADO { get; set; }
        public string USUARIO { get; set; }
        public string OBSERVACIONES { get; set; }
        public DateTime FECHA { get; set; }
    }
}
