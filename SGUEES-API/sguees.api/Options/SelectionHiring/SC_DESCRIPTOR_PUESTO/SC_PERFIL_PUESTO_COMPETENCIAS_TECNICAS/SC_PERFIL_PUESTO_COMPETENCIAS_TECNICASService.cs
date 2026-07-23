using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASService : ISC_PERFIL_PUESTO_COMPETENCIAS_TECNICASService
    {
        // Niveles de dominio técnico aceptados al guardar una competencia.
        private static readonly HashSet<string> NivelesDominioValidos = new(StringComparer.OrdinalIgnoreCase)
        {
            "BASICO",
            "INTERMEDIO",
            "AVANZADO",
        };

        private readonly ISC_PERFIL_PUESTO_COMPETENCIAS_TECNICASRepository _repo;
        private readonly ISC_COMPETENCIAS_TECNICASRepository _competenciasRepo;

        public SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASService(
            ISC_PERFIL_PUESTO_COMPETENCIAS_TECNICASRepository repo,
            ISC_COMPETENCIAS_TECNICASRepository competenciasRepo)
        {
            _repo = repo;
            _competenciasRepo = competenciasRepo;
        }

        // Lista competencias técnicas del perfil; convierte filtros a parámetros SQL y consulta el repositorio.
        public async Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene una competencia técnica por empresa, perfil e id del registro.
        public async Task<CResult> GetAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeCorr: true));
        }

        // Completa datos desde el catálogo, valida nivel 3 y crea el registro en SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS.
        public async Task<CResult> CreateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Busca la competencia en SC_COMPETENCIAS_TECNICAS y copia nombre, código y descripción si faltan.
            var prepare = await PrepareFromCatalogAsync(Data, esNuevo: true);
            if (prepare != null)
            {
                return prepare;
            }

            // Revisa descriptor, perfil, nivel de dominio y longitudes antes de insertar.
            var validation = Validate(Data, esNuevo: true);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza una competencia técnica existente en SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS.
        public async Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Revisa id, nivel de dominio y longitudes antes de actualizar.
            var validation = Validate(Data, esNuevo: false);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida claves y elimina la competencia de SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS.
        public async Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS <= 0)
            {
                return ValidationError("Debe indicar la competencia tecnica del perfil a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Al crear: lee SC_COMPETENCIAS_TECNICAS, exige nivel NIV3 y rellena nombre/código/descripción vacíos.
        private async Task<CResult> PrepareFromCatalogAsync(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, bool esNuevo)
        {
            if (!esNuevo || Data.CORR_COMPETENCIAS_TECNICAS is not > 0)
            {
                return null;
            }

            // Consulta el catálogo maestro por CORR_COMPETENCIAS_TECNICAS.
            var catalogResult = await _competenciasRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS.Value, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not SC_COMPETENCIAS_TECNICASView catalog)
            {
                return ValidationError("No se encontro la competencia tecnica en el catalogo.");
            }

            if (!string.Equals(catalog.NIVEL?.Trim(), "NIV3", StringComparison.OrdinalIgnoreCase))
            {
                return ValidationError("Solo se pueden asociar competencias tecnicas de nivel 3.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_TECNICAS))
            {
                Data.NOMBRE_COMPETENCIAS_TECNICAS = catalog.NOMBRE_COMPETENCIAS_TECNICAS?.Trim();
            }

            if (string.IsNullOrWhiteSpace(Data.CODIGO_COMPETENCIAS_TECNICAS))
            {
                Data.CODIGO_COMPETENCIAS_TECNICAS = catalog.CODIGO_COMPETENCIAS_TECNICAS?.Trim();
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                Data.DESCRIPCION = catalog.DESCRIPCION?.Trim();
            }

            return null;
        }

        // Arma parámetros SQL: empresa; opcionalmente descriptor, perfil e id de competencia del perfil.
        private static List<CParameter> BuildParameters(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam xWhere, bool includeCorr = false)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (xWhere.CORR_PERFIL_PUESTO > 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PERFIL_PUESTO", Value = xWhere.CORR_PERFIL_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            if (includeCorr && xWhere.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS > 0)
            {
                p.Add(new CParameter()
                {
                    ParameterName = "CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS",
                    Value = xWhere.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS,
                    DbType = System.Data.DbType.Int32,
                });
            }

            return p;
        }

        // Revisa empresa, descriptor, perfil, competencia nivel 3, dominio y longitudes de texto.
        private static CResult Validate(SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable Data, bool esNuevo)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar competencias tecnicas.");
            }

            if (Data.CORR_PERFIL_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el perfil del puesto antes de registrar competencias tecnicas.");
            }

            if (esNuevo && Data.CORR_COMPETENCIAS_TECNICAS is not > 0)
            {
                return ValidationError("Debe seleccionar una competencia tecnica.");
            }

            if (!esNuevo && Data.CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS <= 0)
            {
                return ValidationError("Debe indicar la competencia tecnica del perfil a actualizar.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_TECNICAS))
            {
                return ValidationError("Debe indicar el nombre de la competencia tecnica.");
            }

            if (Data.NOMBRE_COMPETENCIAS_TECNICAS.Trim().Length > 150)
            {
                return ValidationError("El nombre no puede superar 150 caracteres.");
            }

            if (!string.IsNullOrEmpty(Data.DESCRIPCION) && Data.DESCRIPCION.Trim().Length > 500)
            {
                return ValidationError("La descripcion no puede superar 500 caracteres.");
            }

            if (string.IsNullOrWhiteSpace(Data.NIVEL_DOMINIO)
                || !NivelesDominioValidos.Contains(Data.NIVEL_DOMINIO.Trim()))
            {
                return ValidationError("El nivel de dominio debe ser BASICO, INTERMEDIO o AVANZADO.");
            }

            Data.NOMBRE_COMPETENCIAS_TECNICAS = Data.NOMBRE_COMPETENCIAS_TECNICAS.Trim();
            Data.CODIGO_COMPETENCIAS_TECNICAS = string.IsNullOrWhiteSpace(Data.CODIGO_COMPETENCIAS_TECNICAS)
                ? null
                : Data.CODIGO_COMPETENCIAS_TECNICAS.Trim();
            if (Data.CODIGO_COMPETENCIAS_TECNICAS?.Length > 30)
            {
                Data.CODIGO_COMPETENCIAS_TECNICAS = Data.CODIGO_COMPETENCIAS_TECNICAS.Substring(0, 30);
            }
            Data.DESCRIPCION = string.IsNullOrWhiteSpace(Data.DESCRIPCION) ? null : Data.DESCRIPCION.Trim();
            Data.NIVEL_DOMINIO = Data.NIVEL_DOMINIO.Trim().ToUpperInvariant();

            return null;
        }

        // Devuelve un CResult con ErrorCode 4101 y el mensaje de validación.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = 4101,
                ErrorMessage = message,
                ErrorSource = "",
            };
        }
    }
}
