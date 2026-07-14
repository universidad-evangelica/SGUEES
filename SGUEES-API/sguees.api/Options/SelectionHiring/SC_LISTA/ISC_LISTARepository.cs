using eFramework.Core;

namespace SGUEES.Repositories
{
    public interface ISC_LISTARepository
    {
        CResult GetNIVEL_DOMINIO();
        CResult GetSEXO();
        CResult GetESTADO_FAMILIAR();
        CResult GetLICENCIA();
        CResult GetTIPO_REQUERIDO();
        CResult GetFORMATO();
        CResult GetNIVEL();
    }
}
