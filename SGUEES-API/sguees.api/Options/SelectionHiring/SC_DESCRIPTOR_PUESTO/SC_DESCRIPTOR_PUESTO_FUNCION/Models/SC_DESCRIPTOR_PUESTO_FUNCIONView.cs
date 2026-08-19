using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_DESCRIPTOR_PUESTO_FUNCION: función del descriptor con el conteo de sus actividades.
    public class SC_DESCRIPTOR_PUESTO_FUNCIONView
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de esta función.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public string NOMBRE_FUNCION { get; set; }
        // Clasificación de la función, por ejemplo ESENCIAL o PERIODICA.
        public string TIPO_FUNCION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        // Columna calculada por la vista: cantidad de actividades (SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDAD) de la función.
        public int CANT_ACTIVIDADES { get; set; }
    }
}
