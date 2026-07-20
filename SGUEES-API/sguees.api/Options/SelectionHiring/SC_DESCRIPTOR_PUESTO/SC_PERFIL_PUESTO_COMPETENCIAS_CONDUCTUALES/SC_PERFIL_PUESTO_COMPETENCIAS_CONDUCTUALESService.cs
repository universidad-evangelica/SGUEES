using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESService : ISC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESService
    {
        private readonly ISC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESRepository _repo;
        private readonly ISC_COMPETENCIAS_CONDUCTUALESRepository _competenciasRepo;

        public SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESService(
            ISC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESRepository repo,
            ISC_COMPETENCIAS_CONDUCTUALESRepository competenciasRepo)
        {
            _repo = repo;
            _competenciasRepo = competenciasRepo;
        }

        // Lista competencias conductuales del perfil; convierte filtros a parámetros SQL y consulta el repositorio.
        public async Task<CResult> GetAllAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam xWhere)
        {
            return await _repo.GetAllAsync(BuildParameters(xWhere));
        }

        // Obtiene una competencia conductual por empresa, perfil e id del registro.
        public async Task<CResult> GetAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam xWhere)
        {
            return await _repo.GetAsync(BuildParameters(xWhere, includeCorr: true));
        }

        // Completa datos desde el catálogo, valida que esté activa y crea en SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES.
        public async Task<CResult> CreateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Busca la competencia en SC_COMPETENCIAS_CONDUCTUALES y copia nombre, tipo y descripción si faltan.
            var prepare = await PrepareFromCatalogAsync(Data, esNuevo: true);
            if (prepare != null)
            {
                return prepare;
            }

            // Revisa descriptor, perfil y longitudes antes de insertar.
            var validation = Validate(Data, esNuevo: true);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida y actualiza una competencia conductual en SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES.
        public async Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Revisa id y longitudes antes de actualizar.
            var validation = Validate(Data, esNuevo: false);
            if (validation != null)
            {
                return validation;
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Valida claves y elimina la competencia de SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES.
        public async Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data.CORR_EMPRESA <= 0 || Data.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES <= 0)
            {
                return ValidationError("Debe indicar la competencia conductual del perfil a eliminar.");
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Al crear: lee SC_COMPETENCIAS_CONDUCTUALES, exige activa y rellena nombre/tipo/descripción vacíos.
        private async Task<CResult> PrepareFromCatalogAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, bool esNuevo)
        {
            if (!esNuevo || Data.CORR_COMPETENCIAS_CONDUCTUALES is not > 0)
            {
                return null;
            }

            // Consulta el catálogo maestro por CORR_COMPETENCIAS_CONDUCTUALES.
            var catalogResult = await _competenciasRepo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_COMPETENCIAS_CONDUCTUALES.Value, DbType = System.Data.DbType.Int32 },
            });

            if (!catalogResult.Result || catalogResult.Data is not SC_COMPETENCIAS_CONDUCTUALESView catalog)
            {
                return ValidationError("No se encontro la competencia conductual en el catalogo.");
            }

            if (catalog.ESTADO_COMPETENCIAS_CONDUCTUALES == false)
            {
                return ValidationError("La competencia conductual seleccionada esta inactiva.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_CONDUCTUALES))
            {
                Data.NOMBRE_COMPETENCIAS_CONDUCTUALES = catalog.NOMBRE_COMPETENCIAS_CONDUCTUALES?.Trim();
            }

            if (string.IsNullOrWhiteSpace(Data.CODIGO_TIPO_PUESTO))
            {
                Data.CODIGO_TIPO_PUESTO = catalog.CODIGO_TIPO_PUESTO?.Trim();
            }

            if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
            {
                Data.DESCRIPCION = catalog.DESCRIPCION?.Trim();
            }

            return null;
        }

        // Arma parámetros SQL: empresa; opcionalmente descriptor, perfil e id de competencia del perfil.
        private static List<CParameter> BuildParameters(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam xWhere, bool includeCorr = false)
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

            if (includeCorr && xWhere.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES > 0)
            {
                p.Add(new CParameter()
                {
                    ParameterName = "CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES",
                    Value = xWhere.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES,
                    DbType = System.Data.DbType.Int32,
                });
            }

            return p;
        }

        // Revisa empresa, descriptor, perfil, competencia seleccionada y longitudes de texto.
        private static CResult Validate(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, bool esNuevo)
        {
            if (Data.CORR_EMPRESA <= 0)
            {
                return ValidationError("La empresa de sesion no es valida.");
            }

            if (Data.CORR_DESCRIPTOR_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el descriptor antes de registrar competencias conductuales.");
            }

            if (Data.CORR_PERFIL_PUESTO is not > 0)
            {
                return ValidationError("Debe guardar el perfil del puesto antes de registrar competencias conductuales.");
            }

            if (esNuevo && Data.CORR_COMPETENCIAS_CONDUCTUALES is not > 0)
            {
                return ValidationError("Debe seleccionar una competencia conductual.");
            }

            if (!esNuevo && Data.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES <= 0)
            {
                return ValidationError("Debe indicar la competencia conductual del perfil a actualizar.");
            }

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_CONDUCTUALES))
            {
                return ValidationError("Debe indicar el nombre de la competencia conductual.");
            }

            if (Data.NOMBRE_COMPETENCIAS_CONDUCTUALES.Trim().Length > 150)
            {
                return ValidationError("El nombre no puede superar 150 caracteres.");
            }

            if (!string.IsNullOrEmpty(Data.DESCRIPCION) && Data.DESCRIPCION.Trim().Length > 500)
            {
                return ValidationError("La descripcion no puede superar 500 caracteres.");
            }

            Data.NOMBRE_COMPETENCIAS_CONDUCTUALES = Data.NOMBRE_COMPETENCIAS_CONDUCTUALES.Trim();
            Data.CODIGO_TIPO_PUESTO = string.IsNullOrWhiteSpace(Data.CODIGO_TIPO_PUESTO)
                ? null
                : Data.CODIGO_TIPO_PUESTO.Trim();
            if (Data.CODIGO_TIPO_PUESTO?.Length > 30)
            {
                Data.CODIGO_TIPO_PUESTO = Data.CODIGO_TIPO_PUESTO.Substring(0, 30);
            }
            Data.DESCRIPCION = string.IsNullOrWhiteSpace(Data.DESCRIPCION) ? null : Data.DESCRIPCION.Trim();

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
