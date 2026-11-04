using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    // Qué hace: reglas de la sección "Sedes de la Facultad".
    // Cómo lo hace: toda escritura valida primero que la facultad sea de la empresa de la sesión (la tabla no tiene
    //               CORR_EMPRESA). Al asignar, la sede debe estar activa. La oferta del portal exige facultad
    //               habilitada en la sede, así que desactivar o quitar una sede saca de ella las carreras de la facultad.
    public class ACA_FACULTADES_SEDESService : IACA_FACULTADES_SEDESService
    {
        private readonly IACA_FACULTADES_SEDESRepository _repo;

        public ACA_FACULTADES_SEDESService(IACA_FACULTADES_SEDESRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(ACA_FACULTADES_SEDESParam xWhere)
        {
            if (xWhere.CORR_FACULTAD <= 0)
            {
                return ValidationError("Debe indicar la facultad.");
            }

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_FACULTAD", Value = xWhere.CORR_FACULTAD, DbType = System.Data.DbType.Int32 },
            };
            if (xWhere.CORR_SEDE > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_SEDE", Value = xWhere.CORR_SEDE, DbType = System.Data.DbType.Int32 });
            }
            if (xWhere.ACTIVO.HasValue)
            {
                p.Add(new CParameter() { ParameterName = "ACTIVO", Value = xWhere.ACTIVO, DbType = System.Data.DbType.Boolean });
            }
            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(ACA_FACULTADES_SEDESParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_FACULTAD", Value = xWhere.CORR_FACULTAD, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_SEDE", Value = xWhere.CORR_SEDE, DbType = System.Data.DbType.Int32 },
            };
            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var error = await ValidarLlaveAsync(Data);
            if (error != null)
            {
                return error;
            }

            if (!await _repo.SedeActivaDeEmpresaAsync(Data.CORR_EMPRESA, Data.CORR_SEDE))
            {
                return ValidationError("Seleccione una sede activa.");
            }

            Data.ACTIVO ??= true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var error = await ValidarLlaveAsync(Data);
            if (error != null)
            {
                return error;
            }

            Data.ACTIVO ??= true;
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var error = await ValidarLlaveAsync(Data);
            if (error != null)
            {
                return error;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private async Task<CResult> ValidarLlaveAsync(ACA_FACULTADES_SEDESTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos de la sede.");
            }
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("No se pudo procesar la sede porque su usuario no tiene una empresa asignada.", 4100);
            }
            if (Data.CORR_FACULTAD <= 0)
            {
                return ValidationError("No se pudo identificar la facultad.");
            }
            if (Data.CORR_SEDE <= 0)
            {
                return ValidationError("Debe seleccionar la sede.");
            }
            if (!await _repo.FacultadEsDeEmpresaAsync(Data.CORR_EMPRESA, Data.CORR_FACULTAD))
            {
                return ValidationError("La facultad no existe en la empresa de la sesión.");
            }
            return null;
        }

        private static CResult ValidationError(string message, int code = -1)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = code,
                ErrorMessage = message,
                ErrorSource = "[ACA_FACULTADES_SEDESService]",
                RowsAffected = 0
            };
        }
    }
}
