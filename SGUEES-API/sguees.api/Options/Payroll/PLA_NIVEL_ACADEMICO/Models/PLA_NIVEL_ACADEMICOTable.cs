using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class PLA_NIVEL_ACADEMICOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_NIVEL_ACADEMICO { get; set; }
        public string NOMBRE_NIVEL_ACADEMICO { get; set; }
        public bool? ESTADO_NIVEL_ACADEMICO { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
    }
}
