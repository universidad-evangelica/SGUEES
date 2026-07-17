using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Entidad de escritura de la tabla PLA_NIVEL_ACADEMICO.
    public class PLA_NIVEL_ACADEMICOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; } // Empresa dueña del registro
        public int CORR_NIVEL_ACADEMICO { get; set; } // PK del catálogo
        public string NOMBRE_NIVEL_ACADEMICO { get; set; }
        public bool? ESTADO_NIVEL_ACADEMICO { get; set; } = true; // Activo/inactivo
        public string USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
    }
}
