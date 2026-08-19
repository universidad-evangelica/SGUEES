using System;
using eFramework.Data;
namespace sguees.Models
{
    public class SC_PERSONA_EXPERIENCIA_LABORALTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public int CORR_EXPERIENCIA_LABORAL { get; set; }
        public string EMPRESA { get; set; }
        public string TELEFONO { get; set; }
        public string CARGO { get; set; }
        public string JEFE_INMEDIATO { get; set; }
        public DateTime? FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public decimal? SALARIO_INICIAL { get; set; }
        public decimal? SALARIO_FINAL { get; set; }
        public string MOTIVO_SALIDA { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
