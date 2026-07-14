using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL { get; set; }
    }
}
