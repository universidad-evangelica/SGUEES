using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: fila de dbo.ACA_FACULTADES_SEDES (sede donde se ofertan las carreras de una facultad).
    // Cómo lo hace: la llave es facultad + sede. CORR_EMPRESA no es columna de la tabla: lo pone el controlador
    //               desde el token para validar que la facultad sea de la empresa de la sesión.
    public class ACA_FACULTADES_SEDESTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FACULTAD { get; set; }
        public int CORR_SEDE { get; set; }
        public bool? ACTIVO { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
