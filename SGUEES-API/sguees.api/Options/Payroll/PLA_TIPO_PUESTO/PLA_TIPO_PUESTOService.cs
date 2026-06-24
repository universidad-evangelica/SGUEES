using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class PLA_TIPO_PUESTOService : IPLA_TIPO_PUESTOService
    {
        private readonly IPLA_TIPO_PUESTORepository _repo;

        public PLA_TIPO_PUESTOService(IPLA_TIPO_PUESTORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_TIPO_PUESTO", Value = xWhere.ESTADO_TIPO_PUESTO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
            };

            AddColumnFilter("CORR_TIPO_PUESTO", xWhere.CORR_TIPO_PUESTO, System.Data.DbType.Int32);
            AddColumnFilter("NOMBRE_TIPO_PUESTO", xWhere.NOMBRE_TIPO_PUESTO, System.Data.DbType.String);
            AddColumnFilter("USUARIO_CREA", xWhere.USUARIO_CREA, System.Data.DbType.String);
            AddColumnFilter("FECHA_CREA", xWhere.FECHA_CREA, System.Data.DbType.String);
            AddColumnFilter("ESTACION_CREA", xWhere.ESTACION_CREA, System.Data.DbType.String);
            AddColumnFilter("USUARIO_ACTU", xWhere.USUARIO_ACTU, System.Data.DbType.String);
            AddColumnFilter("FECHA_ACTU", xWhere.FECHA_ACTU, System.Data.DbType.String);
            AddColumnFilter("ESTACION_ACTU", xWhere.ESTACION_ACTU, System.Data.DbType.String);

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

        public async Task<CResult> GetAsync(PLA_TIPO_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = xWhere.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_TIPO_PUESTO = Data.NOMBRE_TIPO_PUESTO.Trim();
            Data.ESTADO_TIPO_PUESTO ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_TIPO_PUESTO = Data.NOMBRE_TIPO_PUESTO.Trim();
            Data.ESTADO_TIPO_PUESTO ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            Data.ESTADO_TIPO_PUESTO = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static CResult Validate(PLA_TIPO_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del tipo de puesto.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_TIPO_PUESTO))
            {
                return ValidationError("Debe ingresar el nombre del tipo de puesto.");
            }

            if (Data.NOMBRE_TIPO_PUESTO.Trim().Length > 100)
            {
                return ValidationError("El nombre del tipo de puesto no puede superar 100 caracteres.");
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
                ErrorSource = "[PLA_TIPO_PUESTOService]",
                RowsAffected = 0
            };
        }
    }
}
