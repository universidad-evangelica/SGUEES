using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_INDUCCIONService : ISC_INDUCCIONService
    {
        private readonly ISC_INDUCCIONRepository _repo;

        public SC_INDUCCIONService(ISC_INDUCCIONRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_INDUCCIONParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_INDUCCION", Value = xWhere.ESTADO_INDUCCION, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
            };

            AddColumnFilter("CORR_INDUCCION", xWhere.CORR_INDUCCION, System.Data.DbType.Int32);
            AddColumnFilter("NOMBRE_INDUCCION", xWhere.NOMBRE_INDUCCION, System.Data.DbType.String);
            AddColumnFilter("SEMANAS_INDUCCION", xWhere.SEMANAS_INDUCCION, System.Data.DbType.Int32);
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

        public async Task<CResult> GetAsync(SC_INDUCCIONParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_INDUCCION", Value = xWhere.CORR_INDUCCION, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null) return validation;

            Data.NOMBRE_INDUCCION = Data.NOMBRE_INDUCCION.Trim();
            Data.ESTADO_INDUCCION ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null) return validation;

            Data.NOMBRE_INDUCCION = Data.NOMBRE_INDUCCION.Trim();
            Data.ESTADO_INDUCCION ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(SC_INDUCCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            Data.ESTADO_INDUCCION = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static CResult Validate(SC_INDUCCIONTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de induccion.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_INDUCCION))
            {
                return ValidationError("Debe ingresar el nombre de induccion.");
            }

            if (Data.NOMBRE_INDUCCION.Trim().Length > 200)
            {
                return ValidationError("El nombre de induccion no puede superar 200 caracteres.");
            }
            if (Data.SEMANAS_INDUCCION <= 0)
            {
                return ValidationError("Debe ingresar semanas de induccion mayores a 0.");
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
                ErrorSource = "[SC_INDUCCIONService]",
                RowsAffected = 0
            };
        }
    }
}
