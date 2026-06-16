using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_FRECUENCIAService : ISC_FRECUENCIAService
    {
        private readonly ISC_FRECUENCIARepository _repo;

        public SC_FRECUENCIAService(ISC_FRECUENCIARepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_FRECUENCIAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_FRECUENCIA", Value = xWhere.ESTADO_FRECUENCIA, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
            };

            AddColumnFilter("CORR_FRECUENCIA", xWhere.CORR_FRECUENCIA, System.Data.DbType.Int32);
            AddColumnFilter("NOMBRE_FRECUENCIA", xWhere.NOMBRE_FRECUENCIA, System.Data.DbType.String);
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

        public async Task<CResult> GetAsync(SC_FRECUENCIAParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_FRECUENCIA", Value = xWhere.CORR_FRECUENCIA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_FRECUENCIA = Data.NOMBRE_FRECUENCIA.Trim();
            Data.ESTADO_FRECUENCIA ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_FRECUENCIA = Data.NOMBRE_FRECUENCIA.Trim();
            Data.ESTADO_FRECUENCIA ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(SC_FRECUENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            Data.ESTADO_FRECUENCIA = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static CResult Validate(SC_FRECUENCIATable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la frecuencia.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_FRECUENCIA))
            {
                return ValidationError("Debe ingresar el nombre de la frecuencia.");
            }

            if (Data.NOMBRE_FRECUENCIA.Trim().Length > 50)
            {
                return ValidationError("El nombre de la frecuencia no puede superar 50 caracteres.");
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
                ErrorSource = "[SC_FRECUENCIAService]",
                RowsAffected = 0
            };
        }
    }
}
