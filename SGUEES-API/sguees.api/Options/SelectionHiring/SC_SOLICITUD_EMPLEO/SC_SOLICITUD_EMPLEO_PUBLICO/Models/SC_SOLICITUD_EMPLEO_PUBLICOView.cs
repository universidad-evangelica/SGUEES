using System;

namespace sguees.Models
{
    public class SC_SOLICITUD_EMPLEO_PUBLICOView
    {
        public bool VALIDO { get; set; }
        public int CORR_EMPRESA { get; set; }
        public DateTime? FECHA_EXPIRACION { get; set; }
        public string ESTADO_TOKEN { get; set; }
        /// <summary>True si la solicitud ya tiene CORR_PERSONA_DATOS (reentrada / precarga).</summary>
        public bool YA_TIENE_DATOS { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public int CORR_TIPO_CONTRATACION { get; set; }
        public string NOMBRE_TIPO_CONTRATACION { get; set; }
        public bool ES_PERMANENTE { get; set; }
        /// <summary>
        /// Correo de la invitación (SC_SOLICITUD_EMPLEO). El SPA lo precarga en el formulario.
        /// </summary>
        public string CORREO_INVITACION { get; set; }
        /// <summary>DUI registrado en la solicitud para precarga en el formulario.</summary>
        public string DUI { get; set; }
        /// <summary>Nombre del puesto de la requisición vinculada para precarga en Plaza Solicitada.</summary>
        public string PLAZA_SOLICITADA { get; set; }
    }
}
