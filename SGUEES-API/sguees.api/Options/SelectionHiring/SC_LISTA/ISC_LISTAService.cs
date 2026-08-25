using eFramework.Core;

namespace SGUEES.Services
{
    public interface ISC_LISTAService
    {
        CResult GetNIVEL_DOMINIO();
        CResult GetSEXO();
        CResult GetESTADO_FAMILIAR();
        CResult GetLICENCIA();
        CResult GetTIPO_REQUERIDO();
        CResult GetFORMATO();
        CResult GetESTADO_DESCRIPTOR();
        CResult GetUNIDAD_TIEMPO_INDUCCION();
        CResult GetNIVEL();
    }
}
