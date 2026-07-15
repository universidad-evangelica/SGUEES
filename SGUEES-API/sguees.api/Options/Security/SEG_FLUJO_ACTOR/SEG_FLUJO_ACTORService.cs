using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_ACTORService : ISEG_FLUJO_ACTORService
    {
        private readonly ISEG_FLUJO_ACTORRepository _repo;

        public SEG_FLUJO_ACTORService(ISEG_FLUJO_ACTORRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_ACTORParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_ACTOR != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ACTOR",Value=xWhere.CORR_ACTOR,DbType=System.Data.DbType.Int32});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_ACTOR))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_ACTOR",Value=xWhere.NOMBRE_ACTOR,DbType=System.Data.DbType.String});
            }

            p.Add(new CParameter() {ParameterName="OPCION_CONSULTA",Value=xWhere.OPCION_CONSULTA,DbType=System.Data.DbType.Int32});

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_ACTORParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_ACTOR",Value=xWhere.CORR_ACTOR,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> GetEmpleadosByUnidadAsync(SEG_FLUJO_ACTORParam xWhere)
        {
            var pEmpleados = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_UNIDAD_EMPLEADO", Value=xWhere.CORR_UNIDAD_EMPLEADO, DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetEmpleadosDisponiblesAsync(pEmpleados);
        }
        public async Task<CResult> CreateAsync(SEG_FLUJO_ACTORTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_ACTOR))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del actor es obligatorio" };

            if (Data.NOMBRE_ACTOR.Length > 100)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del actor no puede exceder los 100 caracteres" };

            if (Data.DESCRIPCION != null && Data.DESCRIPCION.Length > 500)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La descripción no puede exceder los 500 caracteres" };

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_ACTORTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_ACTOR))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del actor es obligatorio" };

            if (Data.NOMBRE_ACTOR.Length > 100)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del actor no puede exceder los 100 caracteres" };

            if (Data.DESCRIPCION != null && Data.DESCRIPCION.Length > 500)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La descripción no puede exceder los 500 caracteres" };

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_ACTORTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}