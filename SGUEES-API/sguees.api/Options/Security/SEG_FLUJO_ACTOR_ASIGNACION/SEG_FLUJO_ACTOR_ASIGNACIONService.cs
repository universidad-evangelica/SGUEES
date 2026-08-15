using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_ACTOR_ASIGNACIONService : ISEG_FLUJO_ACTOR_ASIGNACIONService
    {
        private readonly ISEG_FLUJO_ACTOR_ASIGNACIONRepository _repo;

        public SEG_FLUJO_ACTOR_ASIGNACIONService(ISEG_FLUJO_ACTOR_ASIGNACIONRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_ACTOR_ASIGNACIONParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_ASIGNACION != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ASIGNACION",Value=xWhere.CORR_ASIGNACION,DbType=System.Data.DbType.Int32});
            }

            if (!string.IsNullOrEmpty(xWhere.LOGIN_SISTEMA))
            {
                p.Add(new CParameter() {ParameterName="LOGIN_SISTEMA",Value=xWhere.LOGIN_SISTEMA,DbType=System.Data.DbType.String});
            }

            if (xWhere.CORR_ACTOR != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ACTOR",Value=xWhere.CORR_ACTOR,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_UNIDAD != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_UNIDAD",Value=xWhere.CORR_UNIDAD,DbType=System.Data.DbType.Int32});
            }

            p.Add(new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Boolean});

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_ACTOR_ASIGNACIONParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_ASIGNACION",Value=xWhere.CORR_ASIGNACION,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_ACTOR_ASIGNACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_ACTOR_ASIGNACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_ACTOR_ASIGNACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}