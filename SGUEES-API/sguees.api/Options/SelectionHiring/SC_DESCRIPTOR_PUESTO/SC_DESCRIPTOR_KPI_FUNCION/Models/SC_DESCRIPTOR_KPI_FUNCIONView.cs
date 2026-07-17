using System;

namespace SGUEES.Models
{
    // proyeccion de lectura (vista) de SC_DESCRIPTOR_KPI_FUNCION.
    public class SC_DESCRIPTOR_KPI_FUNCIONView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_KPI_FUNCION { get; set; }
        public string NOMBRE_INDICADOR { get; set; }
        public int? CORR_FRECUENCIA { get; set; }
        public string NOMBRE_FRECUENCIA { get; set; }
        public int? META { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
