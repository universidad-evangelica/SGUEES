using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_NIVELService : ISC_ORGANIGRAMA_ESTRUCTURAL_NIVELService
    {
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_NIVELRepository _repo;

        public SC_ORGANIGRAMA_ESTRUCTURAL_NIVELService(ISC_ORGANIGRAMA_ESTRUCTURAL_NIVELRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_NIVEL != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_NIVEL",Value=xWhere.CORR_NIVEL,DbType=System.Data.DbType.Int32});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_NIVEL))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_NIVEL",Value=xWhere.NOMBRE_NIVEL,DbType=System.Data.DbType.String});
            }

            p.Add(new CParameter() {ParameterName="OPCION_CONSULTA",Value=xWhere.OPCION_CONSULTA,DbType=System.Data.DbType.Int32});

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_NIVEL",Value=xWhere.CORR_NIVEL,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_NIVEL))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del nivel es obligatorio" };

            if (Data.NOMBRE_NIVEL.Length > 50)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del nivel no puede exceder los 50 caracteres" };

            if (Data.CANTIDAD_CARACTERES <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La cantidad de caracteres debe ser mayor a 0" };

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_NIVEL))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del nivel es obligatorio" };

            if (Data.NOMBRE_NIVEL.Length > 50)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del nivel no puede exceder los 50 caracteres" };

            if (Data.CANTIDAD_CARACTERES <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La cantidad de caracteres debe ser mayor a 0" };

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}