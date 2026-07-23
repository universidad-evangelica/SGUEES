using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_DESCRIPTOR_KPI_FUNCION: indicadores (KPI) de desempeño del descriptor.
    public class SC_DESCRIPTOR_KPI_FUNCIONView
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de este indicador.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_KPI_FUNCION { get; set; }
        public string NOMBRE_INDICADOR { get; set; }
        // FK al catálogo de frecuencia de medición del indicador.
        public int? CORR_FRECUENCIA { get; set; }
        // Snapshot: nombre de la frecuencia guardado en el registro.
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
