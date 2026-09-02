using System;

namespace SGUEES.Models
{
    /// <summary>
    /// Candidato activo en proceso de selección asociado a una requisición.
    /// </summary>
    public class SC_REQUISICION_PERSONAL_CANDIDATOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_REQUISICION_PERSONAL { get; set; }
        public int CORR_SOLICITUD_EMPLEO { get; set; }
        public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public string NOMBRE_PERSONA { get; set; }
        public string DUI_PERSONA { get; set; }
        public DateTime FECHA_GENERACION { get; set; }
        public int CORR_ESTADO_EXPEDIENTE { get; set; }
    }
}
