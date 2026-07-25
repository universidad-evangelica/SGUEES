using System;

namespace sguees.Models
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_JEFE { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int CORR_EMPLEADO { get; set; }
        public string NOMBRE_EMPLEADO { get; set; }
        public string LOGIN_SISTEMA_WEB { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public bool ACTIVO { get; set; }
        public int? CORR_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
    }
}