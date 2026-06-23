using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class PLA_NIVEL_ACADEMICOService : IPLA_NIVEL_ACADEMICOService
    {
        private readonly IPLA_NIVEL_ACADEMICORepository _repo;

        public PLA_NIVEL_ACADEMICOService(IPLA_NIVEL_ACADEMICORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(PLA_NIVEL_ACADEMICOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_NIVEL_ACADEMICO", Value = xWhere.ESTADO_NIVEL_ACADEMICO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
            };

            AddColumnFilter("CORR_NIVEL_ACADEMICO", xWhere.CORR_NIVEL_ACADEMICO, System.Data.DbType.Int32);
            AddColumnFilter("NOMBRE_NIVEL_ACADEMICO", xWhere.NOMBRE_NIVEL_ACADEMICO, System.Data.DbType.String);
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

        public async Task<CResult> GetAsync(PLA_NIVEL_ACADEMICOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_NIVEL_ACADEMICO", Value = xWhere.CORR_NIVEL_ACADEMICO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_NIVEL_ACADEMICO = Data.NOMBRE_NIVEL_ACADEMICO.Trim();
            Data.ESTADO_NIVEL_ACADEMICO ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            Data.NOMBRE_NIVEL_ACADEMICO = Data.NOMBRE_NIVEL_ACADEMICO.Trim();
            Data.ESTADO_NIVEL_ACADEMICO ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DesactivarAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            Data.ESTADO_NIVEL_ACADEMICO = false;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static CResult Validate(PLA_NIVEL_ACADEMICOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del nivel academico.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_NIVEL_ACADEMICO))
            {
                return ValidationError("Debe ingresar el nombre del nivel academico.");
            }

            if (Data.NOMBRE_NIVEL_ACADEMICO.Trim().Length > 150)
            {
                return ValidationError("El nombre del nivel academico no puede superar 150 caracteres.");
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
                ErrorSource = "[PLA_NIVEL_ACADEMICOService]",
                RowsAffected = 0
            };
        }
    }
}
