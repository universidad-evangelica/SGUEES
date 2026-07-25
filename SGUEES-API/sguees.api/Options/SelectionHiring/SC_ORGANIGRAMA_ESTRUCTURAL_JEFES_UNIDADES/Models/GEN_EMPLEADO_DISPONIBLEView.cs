using System;

namespace sguees.Models
{
    public class GEN_EMPLEADO_DISPONIBLEView
    {
        public int CORR_EMPLEADO { get; set; }
        public string NOMBRE_EMPLEADO { get; set; }
        public string LOGIN_SISTEMA_WEB { get; set; }
        public int? CORR_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public int CORR_UNIDAD_EMPLEADO { get; set; }
        public string UNIDAD_EMPLEADO { get; set; }
        public string CODIGO_UNIDAD_EMPLEADO { get; set; }
    }
}