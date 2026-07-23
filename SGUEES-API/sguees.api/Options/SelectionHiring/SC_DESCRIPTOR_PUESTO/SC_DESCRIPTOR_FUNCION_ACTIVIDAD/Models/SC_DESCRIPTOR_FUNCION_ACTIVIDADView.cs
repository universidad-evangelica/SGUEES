using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_DESCRIPTOR_FUNCION_ACTIVIDAD: actividades (detalle) de una función del descriptor.
    public class SC_DESCRIPTOR_FUNCION_ACTIVIDADView
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de la función/actividad.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK a la función (SC_DESCRIPTOR_FUNCION) a la que pertenece esta actividad.
        public int CORR_FUNCION { get; set; }
        public int CORR_ACTIVIDAD { get; set; }
        public string NOMBRE_ACTIVIDAD { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
