using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_ESTADO_MENSAJEService : ISEG_FLUJO_ESTADO_MENSAJEService
    {
        private readonly ISEG_FLUJO_ESTADO_MENSAJERepository _repo;

        public SEG_FLUJO_ESTADO_MENSAJEService(ISEG_FLUJO_ESTADO_MENSAJERepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_ESTADO_MENSAJEParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_ESTADO_MENSAJE != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ESTADO_MENSAJE",Value=xWhere.CORR_ESTADO_MENSAJE,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_PASO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_PASO",Value=xWhere.CORR_PASO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_ESTADO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ESTADO",Value=xWhere.CORR_ESTADO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_ACTOR.HasValue && xWhere.CORR_ACTOR.Value != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ACTOR",Value=xWhere.CORR_ACTOR,DbType=System.Data.DbType.Int32});
            }

            if (!string.IsNullOrEmpty(xWhere.LOGIN_SISTEMA))
            {
                p.Add(new CParameter() {ParameterName="LOGIN_SISTEMA",Value=xWhere.LOGIN_SISTEMA,DbType=System.Data.DbType.String});
            }

            // Nuevos filtros por nombre (opcional)
            if (!string.IsNullOrEmpty(xWhere.NOMBRE_PASO))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_PASO",Value=xWhere.NOMBRE_PASO,DbType=System.Data.DbType.String});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_ESTADO))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_ESTADO",Value=xWhere.NOMBRE_ESTADO,DbType=System.Data.DbType.String});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_ACTOR))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_ACTOR",Value=xWhere.NOMBRE_ACTOR,DbType=System.Data.DbType.String});
            }

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_ESTADO_MENSAJEParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_ESTADO_MENSAJE",Value=xWhere.CORR_ESTADO_MENSAJE,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_ESTADO_MENSAJETable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_ESTADO_MENSAJETable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_ESTADO_MENSAJETable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}