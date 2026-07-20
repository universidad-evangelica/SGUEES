using System;

namespace sguees.Models
{
	public class SC_REQUISICION_OBSERVADORESView
	{
        public int CORR_EMPRESA { get; set; }
        public int? CORR_REQUISICION_PERSONAL { get; set; }
        public int CORR_REQUISICION_OBSERVADORES { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public string NOMBRE_USUARIO { get; set; } //Nombre del usuario (JOIN SEG_USUARIO)
        public string TIPO_OBSERVADOR { get; set; } //D Defecto/ R requisicion
        public DateTime FECHA_ASIGNACION { get; set; }
        public bool ACTIVO { get; set; } //Estado observador
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
