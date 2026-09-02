using eFramework.Data;

namespace SGUEES.Models
{
    /// <summary>
    /// Filtros de identificación para consultar candidatos de una requisición.
    /// </summary>
    public class SC_REQUISICION_PERSONAL_CANDIDATOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_REQUISICION_PERSONAL { get; set; }
    }
}
