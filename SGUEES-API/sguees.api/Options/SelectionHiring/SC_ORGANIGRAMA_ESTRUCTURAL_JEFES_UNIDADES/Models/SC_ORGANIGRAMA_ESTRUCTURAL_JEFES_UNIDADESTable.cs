using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_JEFE { get; set; }
        public int CORR_UNIDAD { get; set; }
        public int CORR_EMPLEADO { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}