using eFramework.Data;

namespace sguees.Models
{
    public class ACA_ASIGNATURAS_PLANInput
    {
        public int CORR_ASIGNATURA { get; set; }
        public int CORR_PLAN_ACADEMICO { get; set; }
        public bool ACTIVO { get; set; }
        public byte[] VERSION { get; set; }
    }
}
