using System;

namespace SGUEES.Models
{
    // proyeccion de lectura (vista) de SC_PERFIL_PUESTO_EDUCACION.
    public class SC_PERFIL_PUESTO_EDUCACIONView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_EDUCACION { get; set; }
        public string REQUISITO { get; set; }
        public string ESPECIFICACIONES { get; set; }
        public string TIPO_REQUERIDO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
