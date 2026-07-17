using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_PASOService : ISEG_FLUJO_PASOService
    {
        private readonly ISEG_FLUJO_PASORepository _repo;

        public SEG_FLUJO_PASOService(ISEG_FLUJO_PASORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_PASOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_PASO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_PASO",Value=xWhere.CORR_PASO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_FLUJO_PROCESO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=xWhere.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_PASO))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_PASO",Value=xWhere.NOMBRE_PASO,DbType=System.Data.DbType.String});
            }

            p.Add(new CParameter() {ParameterName="OPCION_CONSULTA",Value=xWhere.OPCION_CONSULTA,DbType=System.Data.DbType.Int32});

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_PASOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PASO",Value=xWhere.CORR_PASO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_PASO))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del paso es obligatorio" };

            if (Data.NOMBRE_PASO.Length > 100)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del paso no puede exceder los 100 caracteres" };

            if (Data.ORDEN <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El orden del paso debe ser mayor a 0" };

            if (Data.CORR_FLUJO_PROCESO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un flujo" };

            if (Data.CORR_ACTOR_ORIGEN <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un actor" };

            if (Data.CORR_ESTADO_ORIGEN <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un estado origen" };

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_PASO))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del paso es obligatorio" };

            if (Data.NOMBRE_PASO.Length > 100)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del paso no puede exceder los 100 caracteres" };

            if (Data.ORDEN <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El orden del paso debe ser mayor a 0" };

            if (Data.CORR_FLUJO_PROCESO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un flujo" };

            if (Data.CORR_ACTOR_ORIGEN <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un actor" };

            if (Data.CORR_ESTADO_ORIGEN <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un estado origen" };

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}