using eFramework.Data;
namespace sguees.Models
{
    public class SC_PERSONA_EXPERIENCIA_LABORALParam : BaseParam
    {
        public int OPCION_CONSULTA { get; set; } = 0;
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public int CORR_EXPERIENCIA_LABORAL { get; set; }
    }
}
