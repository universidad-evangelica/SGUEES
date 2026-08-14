// Qué hace: valida y coordina el mantenimiento de puestos (PLA_PUESTO).
// Cómo: valida empresa/nombre/salarios, unicidad de nombre y delega en IPLA_PUESTORepository.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class PLA_PUESTOService : IPLA_PUESTOService
    {
        private readonly IPLA_PUESTORepository _repo;

        public PLA_PUESTOService(IPLA_PUESTORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: lista los puestos de la empresa.
        // Cómo: arma parámetros con BuildParameters y llama a GetAllAsync del repositorio.
        public async Task<CResult> GetAllAsync(PLA_PUESTOParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Qué hace: obtiene un puesto por correlativo.
        // Cómo: llama a GetAsync con CORR_EMPRESA y CORR_PUESTO.
        public async Task<CResult> GetAsync(PLA_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PUESTO", Value = xWhere.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: crea un puesto nuevo.
        // Cómo: valida empresa, datos y unicidad de nombre; normaliza y llama a CreateAsync.
        public async Task<CResult> CreateAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            var duplicateNombre = await ValidateUniqueNombreAsync(Data, null);
            if (duplicateNombre != null)
            {
                return duplicateNombre;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: actualiza un puesto existente.
        // Cómo: valida empresa, datos, llave y unicidad; normaliza y llama a UpdateAsync.
        public async Task<CResult> UpdateAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

            if (Data.CORR_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el puesto a actualizar.");
            }

            NormalizeData(Data);

            var duplicateNombre = await ValidateUniqueNombreAsync(Data, Data.CORR_PUESTO);
            if (duplicateNombre != null)
            {
                return duplicateNombre;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: elimina un puesto.
        // Cómo: valida empresa y llama a DeleteAsync del repositorio.
        public async Task<CResult> DeleteAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: cambia el estado activo/inactivo del puesto.
        // Cómo: valida empresa y llave; llama a ActivarInactivarAsync del repositorio.
        public async Task<CResult> ActivarInactivarAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el puesto a actualizar.");
            }

            return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static List<CParameter> BuildParameters(PLA_PUESTOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static void NormalizeData(PLA_PUESTOTable Data)
        {
            Data.NOMBRE_PUESTO = Data.NOMBRE_PUESTO?.Trim();
            Data.CODIGO_PUESTO = string.IsNullOrWhiteSpace(Data.CODIGO_PUESTO) ? null : Data.CODIGO_PUESTO.Trim();
            Data.CODIGO_FORMATO = string.IsNullOrWhiteSpace(Data.CODIGO_FORMATO) ? null : Data.CODIGO_FORMATO.Trim();
            Data.VERSION_FORMATO = string.IsNullOrWhiteSpace(Data.VERSION_FORMATO) ? null : Data.VERSION_FORMATO.Trim();
            Data.MISION_PUESTO = string.IsNullOrWhiteSpace(Data.MISION_PUESTO) ? null : Data.MISION_PUESTO.Trim();
            Data.OTROS_ASPECTOS = string.IsNullOrWhiteSpace(Data.OTROS_ASPECTOS) ? null : Data.OTROS_ASPECTOS.Trim();
            Data.USUARIO_VALIDA = string.IsNullOrWhiteSpace(Data.USUARIO_VALIDA) ? null : Data.USUARIO_VALIDA.Trim();
            Data.USUARIO_AUTORIZA = string.IsNullOrWhiteSpace(Data.USUARIO_AUTORIZA) ? null : Data.USUARIO_AUTORIZA.Trim();
            Data.ESTADO_PUESTO ??= true;
            Data.APROBACION_PUESTO ??= false;

            if (Data.CORR_GERENCIA.HasValue && Data.CORR_GERENCIA.Value <= 0)
            {
                Data.CORR_GERENCIA = null;
            }
            if (Data.CORR_NIVEL_ACADEMICO.HasValue && Data.CORR_NIVEL_ACADEMICO.Value <= 0)
            {
                Data.CORR_NIVEL_ACADEMICO = null;
            }
            if (Data.CORR_TIPO_PUESTO.HasValue && Data.CORR_TIPO_PUESTO.Value <= 0)
            {
                Data.CORR_TIPO_PUESTO = null;
            }
        }

        private static CResult Validate(PLA_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del puesto.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_PUESTO))
            {
                return ValidationError("Debe ingresar el nombre del puesto.");
            }

            if (Data.NOMBRE_PUESTO.Trim().Length > 100)
            {
                return ValidationError("El nombre del puesto no puede superar 100 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.CODIGO_PUESTO) && Data.CODIGO_PUESTO.Trim().Length > 30)
            {
                return ValidationError("El codigo del puesto no puede superar 30 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.MISION_PUESTO) && Data.MISION_PUESTO.Trim().Length > 255)
            {
                return ValidationError("La mision del puesto no puede superar 255 caracteres.");
            }

            if (!string.IsNullOrWhiteSpace(Data.OTROS_ASPECTOS) && Data.OTROS_ASPECTOS.Trim().Length > 255)
            {
                return ValidationError("Otros aspectos no puede superar 255 caracteres.");
            }

            if (Data.SALARIO_INICIAL.HasValue && Data.SALARIO_FINAL.HasValue &&
                Data.SALARIO_INICIAL.Value > Data.SALARIO_FINAL.Value)
            {
                return ValidationError("El salario inicial no puede ser mayor que el salario final.");
            }

            return null;
        }

        private async Task<CResult> ValidateUniqueNombreAsync(PLA_PUESTOTable Data, int? excludeCorr)
        {
            var exists = await _repo.ExistsNombreAsync(
                Data.CORR_EMPRESA,
                Data.NOMBRE_PUESTO,
                excludeCorr ?? 0);

            if (!exists)
            {
                return null;
            }

            var nombre = (Data.NOMBRE_PUESTO ?? string.Empty).Trim();
            return DuplicateWarning(
                $"Ya existe un puesto con el nombre {nombre}. Escriba otro nombre para continuar.");
        }

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
                ErrorMessage = "No se pudo guardar el puesto porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[PLA_PUESTOService]",
                RowsAffected = 0
            };
        }

        private static CResult DuplicateWarning(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = 2627,
                ErrorMessage = message,
                ErrorSource = "[PLA_PUESTOService]",
                RowsAffected = 0
            };
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
                ErrorSource = "[PLA_PUESTOService]",
                RowsAffected = 0
            };
        }
    }
}
