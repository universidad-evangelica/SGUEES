using eFramework.Data;
namespace sguees.Models
{
    public class SC_PERSONA_COMPETENCIAS_TECNICASParam : BaseParam
    {
        public int OPCION_CONSULTA { get; set; } = 0;
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public int CORR_COMPETENCIA_TECNICA { get; set; }
    }
}
