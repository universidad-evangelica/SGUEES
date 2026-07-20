// Qué hace: lógica de negocio del catálogo disponibilidad de horario.
// Cómo: valida los datos y llama a ISC_DISPONIBILIDAD_HORARIORepository para ejecutar el CRUD.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    // Qué hace: servicio de disponibilidad de horario.
    // Cómo: valida los datos y llama al repositorio para persistir la información.
    public class SC_DISPONIBILIDAD_HORARIOService : ISC_DISPONIBILIDAD_HORARIOService
    {
        private readonly ISC_DISPONIBILIDAD_HORARIORepository _repo;

        public SC_DISPONIBILIDAD_HORARIOService(ISC_DISPONIBILIDAD_HORARIORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: obtiene el listado de disponibilidades de horario.
        // Cómo: llama a GetAllAsync del repositorio con los parámetros armados por BuildParameters.
        public async Task<CResult> GetAllAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene solo las disponibilidades de horario activas de la empresa.
        // Cómo: llama a GetDisponibilidadesActivasAsync del repositorio filtrando por CORR_EMPRESA.
        public async Task<CResult> GetDisponibilidadesActivasAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetDisponibilidadesActivasAsync(p);
        }

        // Qué hace: obtiene una disponibilidad de horario puntual.
        // Cómo: llama a GetAsync del repositorio filtrando por CORR_EMPRESA y CORR_DISPONIBILIDAD_HORARIO.
        public async Task<CResult> GetAsync(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DISPONIBILIDAD_HORARIO", Value = xWhere.CORR_DISPONIBILIDAD_HORARIO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea una disponibilidad de horario.
        // Cómo: valida la empresa de sesión y los datos con ValidateEmpresaSesion y Validate, normaliza con NormalizeData y llama a CreateAsync del repositorio.
        public async Task<CResult> CreateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            NormalizeData(Data);
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: actualiza una disponibilidad de horario.
        // Cómo: valida la empresa de sesión, los datos y el CORR_DISPONIBILIDAD_HORARIO a actualizar, normaliza con NormalizeData y llama a UpdateAsync del repositorio.
        public async Task<CResult> UpdateAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (Data.CORR_DISPONIBILIDAD_HORARIO <= 0)
            {
                return ValidationError("No se pudo identificar la disponibilidad de horario a actualizar.");
            }

            NormalizeData(Data);
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina una disponibilidad de horario.
        // Cómo: valida la empresa de sesión con ValidateEmpresaSesion y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo de una disponibilidad de horario.
        // Cómo: valida la empresa de sesión y el CORR_DISPONIBILIDAD_HORARIO a actualizar, y llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(SC_DISPONIBILIDAD_HORARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_DISPONIBILIDAD_HORARIO <= 0)
            {
                return ValidationError("No se pudo identificar la disponibilidad de horario a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: arma los parámetros de filtro para el repositorio.
        // Cómo: construye la lista con CORR_EMPRESA a partir de xWhere.
        private static List<CParameter> BuildParameters(SC_DISPONIBILIDAD_HORARIOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Qué hace: normaliza los datos antes de guardar.
        // Cómo: recorta espacios de NOMBRE_DISPONIBILIDAD_HORARIO y aplica ESTADO_DISPONIBILIDAD_HORARIO activo cuando no viene informado.
        private static void NormalizeData(SC_DISPONIBILIDAD_HORARIOTable Data)
        {
            Data.NOMBRE_DISPONIBILIDAD_HORARIO = Data.NOMBRE_DISPONIBILIDAD_HORARIO?.Trim();
            Data.ESTADO_DISPONIBILIDAD_HORARIO ??= true;
        }

        // Qué hace: valida los datos obligatorios de la disponibilidad de horario.
        // Cómo: comprueba que Data no sea nulo y que NOMBRE_DISPONIBILIDAD_HORARIO no esté vacío ni supere 150 caracteres.
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

        // Qué hace: verifica que exista empresa en la sesión.
        // Cómo: si corrEmpresa es mayor a cero devuelve null; de lo contrario devuelve un CResult con el error de empresa no asignada.
        private static CResult ValidateEmpresaSesion(int corrEmpresa)
        {
            if (corrEmpresa > 0)
            {
                return null;
            }

            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = 4100,
                ErrorMessage = "No se pudo guardar la disponibilidad de horario porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_DISPONIBILIDAD_HORARIOService]",
                RowsAffected = 0
            };
        }

        // Qué hace: construye un resultado de error de validación.
        // Cómo: arma un CResult con Result en false y el mensaje recibido.
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
