using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_PROCESOService : ISEG_FLUJO_PROCESOService
    {
        private readonly ISEG_FLUJO_PROCESORepository _repo;

        public SEG_FLUJO_PROCESOService(ISEG_FLUJO_PROCESORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_PROCESOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_FLUJO_PROCESO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=xWhere.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_TIPO_DOCUMENTO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=xWhere.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_FLUJO))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_FLUJO",Value=xWhere.NOMBRE_FLUJO,DbType=System.Data.DbType.String});
            }

            p.Add(new CParameter() {ParameterName="OPCION_CONSULTA",Value=xWhere.OPCION_CONSULTA,DbType=System.Data.DbType.Int32});

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_PROCESOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=xWhere.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_PROCESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_FLUJO))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del flujo es obligatorio" };

            if (Data.NOMBRE_FLUJO.Length > 100)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del flujo no puede exceder los 100 caracteres" };

            if (Data.DESCRIPCION != null && Data.DESCRIPCION.Length > 500)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La descripción no puede exceder los 500 caracteres" };

            if (Data.CORR_TIPO_DOCUMENTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un tipo de documento" };

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_PROCESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_FLUJO))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del flujo es obligatorio" };

            if (Data.NOMBRE_FLUJO.Length > 100)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del flujo no puede exceder los 100 caracteres" };

            if (Data.DESCRIPCION != null && Data.DESCRIPCION.Length > 500)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La descripción no puede exceder los 500 caracteres" };

            if (Data.CORR_TIPO_DOCUMENTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un tipo de documento" };

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_PROCESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}