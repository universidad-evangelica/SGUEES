using eFramework.Data;

namespace sguees.Models
{
    public class ACA_TIPOS_PRACTICATable : BaseEntity
    {
        public int CORR_TIPO_PRACTICA { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string CODIGO_TIPO { get; set; }
        public string NOMBRE_TIPO { get; set; }
        public bool HABILITA_COBROS_ADICIONALES { get; set; }
        public bool ACTIVO { get; set; }
        public byte[] VERSION { get; set; }
    }
}
