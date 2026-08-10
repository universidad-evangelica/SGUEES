// Qué hace: lectura de V_SC_UNIDADES_TIPO_USUARIO con nombres de unidad y rol.
// Cómo: proyecta la asignación intermedia más CODIGO/NOMBRE de unidad y NOMBRE_TIPO_USUARIO.
using System;

namespace SGUEES.Models
{
    public class SC_UNIDADES_TIPO_USUARIOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string CODIGO_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int TIPO_USUARIO { get; set; }
        public string NOMBRE_TIPO_USUARIO { get; set; }
        public bool? ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
