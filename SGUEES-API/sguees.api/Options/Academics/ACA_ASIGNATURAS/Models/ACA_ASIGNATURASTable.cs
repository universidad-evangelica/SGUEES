using eFramework.Data;

namespace sguees.Models
{
    public class ACA_ASIGNATURASTable : BaseEntity
    {
        public int CORR_ASIGNATURA { get; set; }
        public int CORR_EMPRESA { get; set; }
        public int CORR_CARRERA { get; set; }
        public string CODIGO_ASIGNATURA { get; set; }
        public string ALIAS { get; set; }
        public string NOMBRE_ASIGNATURA { get; set; }
        public decimal? UNIDADES_VALORATIVAS { get; set; }
        public DateTime? FECHA_APERTURA { get; set; }
        public int CORR_PERIODO_CURSO { get; set; }
        public int? CORR_TIPO_PRACTICA { get; set; }
        public bool ACTIVO { get; set; }
        public byte[] VERSION { get; set; }
    }
}
