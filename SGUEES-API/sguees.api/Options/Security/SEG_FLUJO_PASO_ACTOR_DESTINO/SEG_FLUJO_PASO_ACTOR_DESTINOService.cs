using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_PASO_ACTOR_DESTINOService : ISEG_FLUJO_PASO_ACTOR_DESTINOService
    {
        private readonly ISEG_FLUJO_PASO_ACTOR_DESTINORepository _repo;

        public SEG_FLUJO_PASO_ACTOR_DESTINOService(ISEG_FLUJO_PASO_ACTOR_DESTINORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_PASO_ACTOR_DESTINOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_PASO_ACTOR_DESTINO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_PASO_ACTOR_DESTINO",Value=xWhere.CORR_PASO_ACTOR_DESTINO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_PASO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_PASO",Value=xWhere.CORR_PASO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_ACTOR != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ACTOR",Value=xWhere.CORR_ACTOR,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_UNIDAD.HasValue && xWhere.CORR_UNIDAD.Value != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_UNIDAD",Value=xWhere.CORR_UNIDAD,DbType=System.Data.DbType.Int32});
            }

            // Nuevos filtros por nombre (opcional)
            if (!string.IsNullOrEmpty(xWhere.NOMBRE_PASO))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_PASO",Value=xWhere.NOMBRE_PASO,DbType=System.Data.DbType.String});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_ACTOR))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_ACTOR",Value=xWhere.NOMBRE_ACTOR,DbType=System.Data.DbType.String});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_UNIDAD))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_UNIDAD",Value=xWhere.NOMBRE_UNIDAD,DbType=System.Data.DbType.String});
            }

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_PASO_ACTOR_DESTINOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PASO_ACTOR_DESTINO",Value=xWhere.CORR_PASO_ACTOR_DESTINO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_PASO_ACTOR_DESTINOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_PASO_ACTOR_DESTINOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_PASO_ACTOR_DESTINOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}