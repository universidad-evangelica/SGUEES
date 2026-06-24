using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_DISPONIBILIDAD_HORARIOService : ISC_DISPONIBILIDAD_HORARIOService
    {
        private readonly ISC_DISPONIBILIDAD_HORARIORepository _repo;

        public SC_DISPONIBILIDAD_HORARIOService(ISC_DISPONIBILIDAD_HORARIORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_DISPONIBILIDAD_HORARIO", Value = xWhere.ESTADO_DISPONIBILIDAD_HORARIO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
            };

            AddColumnFilter("CORR_DISPONIBILIDAD_HORARIO", xWhere.CORR_DISPONIBILIDAD_HORARIO, System.Data.DbType.Int32);
            AddColumnFilter("NOMBRE_DISPONIBILIDAD_HORARIO", xWhere.NOMBRE_DISPONIBILIDAD_HORARIO, System.Data.DbType.String);
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

        public async Task<CResult> GetAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DISPONIBILIDAD_HORARIO", Value = xWhere.CORR_DISPONIBILIDAD_HORARIO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_DISPONIBILIDAD_HORARIO = Data.NOMBRE_DISPONIBILIDAD_HORARIO.Trim();
            Data.ESTADO_DISPONIBILIDAD_HORARIO ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_DISPONIBILIDAD_HORARIO = Data.NOMBRE_DISPONIBILIDAD_HORARIO.Trim();
            Data.ESTADO_DISPONIBILIDAD_HORARIO ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            Data.ESTADO_DISPONIBILIDAD_HORARIO = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static CResult Validate(SC_DISPONIBILIDAD_HORARIOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la disponibilidad de horario.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_DISPONIBILIDAD_HORARIO))
            {
                return ValidationError("Debe ingresar el nombre de la disponibilidad de horario.");
            }

            if (Data.NOMBRE_DISPONIBILIDAD_HORARIO.Trim().Length > 150)
            {
                return ValidationError("El nombre de la disponibilidad de horario no puede superar 150 caracteres.");
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
                ErrorSource = "[SC_DISPONIBILIDAD_HORARIOService]",
                RowsAffected = 0
            };
        }
    }
}
