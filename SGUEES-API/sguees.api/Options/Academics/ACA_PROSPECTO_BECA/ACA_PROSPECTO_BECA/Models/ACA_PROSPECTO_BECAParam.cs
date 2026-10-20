using eFramework.Data;

namespace sguees.Models
{
    public class ACA_PROSPECTO_BECAParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_RESPUESTA_BECA { get; set; }
        public short ANIO { get; set; }
        public byte NUMERO_PERIODO { get; set; }
    }
}
