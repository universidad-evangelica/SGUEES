using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_RIESGO_PUESTOService : ISC_RIESGO_PUESTOService
    {
        private readonly ISC_RIESGO_PUESTORepository _repo;

        public SC_RIESGO_PUESTOService(ISC_RIESGO_PUESTORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_RIESGO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_RIESGO_PUESTO", Value = xWhere.ESTADO_RIESGO_PUESTO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
            };

            AddColumnFilter("CORR_RIESGO_PUESTO", xWhere.CORR_RIESGO_PUESTO, System.Data.DbType.Int32);
            AddColumnFilter("NOMBRE_RIESGO_PUESTO", xWhere.NOMBRE_RIESGO_PUESTO, System.Data.DbType.String);
            AddColumnFilter("USUARIO_CREA", xWhere.USUARIO_CREA, System.Data.DbType.String);
            AddColumnFilter("ESTACION_CREA", xWhere.ESTACION_CREA, System.Data.DbType.String);
            AddColumnFilter("FECHA_CREA", xWhere.FECHA_CREA, System.Data.DbType.String);
            AddColumnFilter("USUARIO_ACTU", xWhere.USUARIO_ACTU, System.Data.DbType.String);
            AddColumnFilter("ESTACION_ACTU", xWhere.ESTACION_ACTU, System.Data.DbType.String);
            AddColumnFilter("FECHA_ACTU", xWhere.FECHA_ACTU, System.Data.DbType.String);

            return await _repo.GetAllAsync(p);

            void AddColumnFilter(string parameterName, object value, System.Data.DbType dbType)
            {
                if (value == null ||
                    value is string text && string.IsNullOrWhiteSpace(text) ||
                    value is int number && number <= 0)
                {
                    return;
                }

                p.Add(new CParameter() { ParameterName = parameterName, Value = value, DbType = dbType });
            }
        }

        public async Task<CResult> GetAsync(SC_RIESGO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RIESGO_PUESTO", Value = xWhere.CORR_RIESGO_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null) return validation;

            Data.NOMBRE_RIESGO_PUESTO = Data.NOMBRE_RIESGO_PUESTO.Trim();
            Data.ESTADO_RIESGO_PUESTO ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null) return validation;

            Data.NOMBRE_RIESGO_PUESTO = Data.NOMBRE_RIESGO_PUESTO.Trim();
            Data.ESTADO_RIESGO_PUESTO ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(SC_RIESGO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            Data.ESTADO_RIESGO_PUESTO = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static CResult Validate(SC_RIESGO_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de riesgo de puesto.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_RIESGO_PUESTO))
            {
                return ValidationError("Debe ingresar el nombre de riesgo de puesto.");
            }

            if (Data.NOMBRE_RIESGO_PUESTO.Trim().Length > 150)
            {
                return ValidationError("El nombre de riesgo de puesto no puede superar 150 caracteres.");
            }

            return null;
        }

        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = message,
                ErrorSource = "[SC_RIESGO_PUESTOService]",
                RowsAffected = 0
            };
        }
    }
}
