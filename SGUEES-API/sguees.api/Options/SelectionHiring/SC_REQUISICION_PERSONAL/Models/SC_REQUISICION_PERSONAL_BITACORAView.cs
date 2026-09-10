using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_REQUISICION_PERSONAL_BITACORAView
    {
        public int CORR_EMPRESA { get; set; }
        /// <summary>Alias de CORR_DOCUMENTO de V_SEG_FLUJO_BITACORA_FIRMAS.</summary>
        public int CORR_REQUISICION_PERSONAL { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public string ESTADO_DESTINO { get; set; }
        public string COMENTARIO { get; set; }
        public DateTime FECHA_ACCION { get; set; }
    }
}
