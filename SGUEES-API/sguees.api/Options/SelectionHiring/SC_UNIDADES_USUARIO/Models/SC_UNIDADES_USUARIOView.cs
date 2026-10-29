// Qué hace: lectura de V_SC_UNIDADES_USUARIO y de PRAL_DATA_SC_UNIDADES_USUARIO.
// Cómo: proyecta la asignación, nombres de catálogo y flags de origen del SP.
using System;

namespace SGUEES.Models
{
    public class SC_UNIDADES_USUARIOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string CODIGO_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public string NOMBRE_USUARIO { get; set; }
        // Qué hace: puesto asignado al usuario en la unidad según GEN_EMPLEADO_PUESTO.
        // Cómo: expone el campo devuelto por PRAL_DATA_SC_UNIDADES_USUARIO.
        public int? CORR_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public bool ES_POR_PUESTO { get; set; }
        public bool ES_JEFE_UNIDAD { get; set; }
        // Qué hace: true si la unidad es hija/descendiente de una donde el usuario es jefe activo.
        // Cómo: lo llena PRAL_DATA_SC_UNIDADES_USUARIO (no la vista de mantenimiento).
        public bool ES_HIJA_A_CARGO { get; set; }
        public bool ES_CONFIGURADA { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
