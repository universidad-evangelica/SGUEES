using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_TIPO_MOVIMIENTOService : ISEG_FLUJO_TIPO_MOVIMIENTOService
    {
        private readonly ISEG_FLUJO_TIPO_MOVIMIENTORepository _repo;

        public SEG_FLUJO_TIPO_MOVIMIENTOService(ISEG_FLUJO_TIPO_MOVIMIENTORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_TIPO_MOVIMIENTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_TIPO_MOVIMIENTO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_TIPO_MOVIMIENTO",Value=xWhere.CORR_TIPO_MOVIMIENTO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CODIGO_TIPO != 0)
            {
                p.Add(new CParameter() {ParameterName="CODIGO_TIPO",Value=xWhere.CODIGO_TIPO,DbType=System.Data.DbType.Byte});
            }

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_TIPO_MOVIMIENTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_TIPO_MOVIMIENTO",Value=xWhere.CORR_TIPO_MOVIMIENTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_TIPO_MOVIMIENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_TIPO_MOVIMIENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_TIPO_MOVIMIENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}