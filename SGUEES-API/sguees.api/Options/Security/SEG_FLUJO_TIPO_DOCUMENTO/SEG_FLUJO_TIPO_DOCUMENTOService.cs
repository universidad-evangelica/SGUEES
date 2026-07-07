using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_TIPO_DOCUMENTOService : ISEG_FLUJO_TIPO_DOCUMENTOService
    {
        private readonly ISEG_FLUJO_TIPO_DOCUMENTORepository _repo;

        public SEG_FLUJO_TIPO_DOCUMENTOService(ISEG_FLUJO_TIPO_DOCUMENTORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_TIPO_DOCUMENTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_TIPO_DOCUMENTO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=xWhere.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_TIPO))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_TIPO",Value=xWhere.NOMBRE_TIPO,DbType=System.Data.DbType.String});
            }

            if (!string.IsNullOrEmpty(xWhere.TABLA_ORIGEN))
            {
                p.Add(new CParameter() {ParameterName="TABLA_ORIGEN",Value=xWhere.TABLA_ORIGEN,DbType=System.Data.DbType.String});
            }

          

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_TIPO_DOCUMENTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=xWhere.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_TIPO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_TIPO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_TIPO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}