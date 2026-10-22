using eFramework.Data;

namespace sguees.Models
{
    public class ACA_ASIGNATURAS_CARRERAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_FACULTAD { get; set; }
        public string CODIGO_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public bool ACTIVO { get; set; }
    }
}
