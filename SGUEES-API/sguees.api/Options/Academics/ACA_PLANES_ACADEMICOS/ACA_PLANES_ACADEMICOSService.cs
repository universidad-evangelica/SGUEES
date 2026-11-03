using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
namespace sguees.Services
{
    public class ACA_PLANES_ACADEMICOSService : IACA_PLANES_ACADEMICOSService
    {
        private readonly IACA_PLANES_ACADEMICOSRepository _repo;
        public ACA_PLANES_ACADEMICOSService(IACA_PLANES_ACADEMICOSRepository repo) { _repo=repo; }
        public Task<CResult> GetAllAsync(ACA_PLANES_ACADEMICOSParam data)=>_repo.GetAllAsync(data);
        public Task<CResult> GetModalidadesAsync(ACA_PLANES_ACADEMICOSParam data)=>_repo.GetModalidadesAsync(data);
        public Task<CResult> CreateAsync(ACA_PLANES_ACADEMICOSTable data,string user,string station)=>Write(1,data,user,station);
        public Task<CResult> UpdateAsync(ACA_PLANES_ACADEMICOSTable data,string user,string station)=>Write(2,data,user,station);
        public Task<CResult> CambiarVigenciaAsync(ACA_PLANES_ACADEMICOSTable data,string user,string station)=>Write(3,data,user,station);
        private Task<CResult> Write(int operation,ACA_PLANES_ACADEMICOSTable data,string user,string station)
        {
            string error=null;
            if(data.CORR_EMPRESA<=0 || data.CORR_CARRERA<=0 || (operation!=1 && data.CORR_PLAN_ACADEMICO<=0))
                error="Seleccione una carrera guardada y un plan válido.";
            else if(operation!=3)
            {
                data.CODIGO_PLAN=data.CODIGO_PLAN?.Trim();
                if(string.IsNullOrWhiteSpace(data.CODIGO_PLAN) || data.CODIGO_PLAN.Length>20)
                    error="Ingrese el código del plan (máximo 20 caracteres).";
                else if(data.CORR_MODALIDAD<=0 || data.ANIO_PLAN<1 || data.ANIO_PLAN>9999)
                    error="Seleccione la modalidad e ingrese un año del plan entre 1 y 9999.";
                else if(!data.FECHA_VIGENCIA_INICIO.HasValue)
                    error="La fecha inicial de vigencia es obligatoria.";
                else if(data.FECHA_VIGENCIA_FIN?.Date<data.FECHA_VIGENCIA_INICIO.Value.Date)
                    error="La fecha final no puede ser anterior a la inicial.";
            }
            return error!=null ? Task.FromResult(new CResult{ErrorCode=51000,ErrorMessage=error}) : _repo.WriteAsync(operation,data,user,station);
        }
    }
}
