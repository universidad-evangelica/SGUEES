using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using SGUEES.Repositories;
using sguees.Services;

namespace SGUEES.Services
{
    public class SC_DESCRIPTOR_PUESTOService : ISC_DESCRIPTOR_PUESTOService
    {
        private readonly ISC_DESCRIPTOR_PUESTORepository _repo;
        private readonly ISC_UNIDADES_USUARIORepository _unidadesUsuarioRepo;
        private readonly ISC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService _requerimientoOrganizacionalService;
        private readonly ISC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService _riesgoPuestoService;
        private readonly ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService _responsabilidadCargoService;
        private readonly ISC_REPORepository _repoRpt;
        private readonly ISEG_USUARIOService _repoUser;

        public SC_DESCRIPTOR_PUESTOService(
            ISC_DESCRIPTOR_PUESTORepository repo,
            ISC_UNIDADES_USUARIORepository unidadesUsuarioRepo,
            ISC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALService requerimientoOrganizacionalService,
            ISC_DESCRIPTOR_PUESTO_RIESGO_PUESTOService riesgoPuestoService,
            ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOService responsabilidadCargoService,
            ISC_REPORepository repoRpt,
            ISEG_USUARIOService repoUser)
        {
            _repo = repo;
            _unidadesUsuarioRepo = unidadesUsuarioRepo;
            _requerimientoOrganizacionalService = requerimientoOrganizacionalService;
            _riesgoPuestoService = riesgoPuestoService;
            _responsabilidadCargoService = responsabilidadCargoService;
            _repoRpt = repoRpt;
            _repoUser = repoUser;
        }

        // Qué hace: lista descriptores de la empresa visibles para el usuario de sesión.
        // Cómo: lee V_SC_DESCRIPTOR_PUESTO y deja solo los cuyo CORR_UNIDAD
        //       está en PRAL_DATA_SC_UNIDADES_USUARIO (puesto + jefe + configuradas).
        public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTOParam xWhere)
        {
            var result = await _repo.GetAllAsync(BuildParameters(xWhere));
            if (!result.Result || result.Data == null)
            {
                return result;
            }

            var login = (xWhere?.LOGIN_SISTEMA ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(login))
            {
                result.Data = new List<SC_DESCRIPTOR_PUESTOView>();
                result.RowsAffected = 0;
                return result;
            }

            var unidadesResult = await _unidadesUsuarioRepo.GetUnidadesUsuarioAsync(
                new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = login, DbType = System.Data.DbType.String },
                });

            if (!unidadesResult.Result)
            {
                return unidadesResult;
            }

            var unidadesPermitidas = (unidadesResult.Data as IEnumerable<SC_UNIDADES_USUARIOView> ?? Enumerable.Empty<SC_UNIDADES_USUARIOView>())
                .Select(u => u.CORR_UNIDAD)
                .Where(u => u > 0)
                .ToHashSet();

            var lista = (result.Data as IEnumerable<SC_DESCRIPTOR_PUESTOView> ?? Enumerable.Empty<SC_DESCRIPTOR_PUESTOView>())
                .Where(d => d.CORR_UNIDAD.HasValue && unidadesPermitidas.Contains(d.CORR_UNIDAD.Value))
                .OrderBy(d => d.CORR_DESCRIPTOR_PUESTO)
                .ToList();

            result.Data = lista;
            result.RowsAffected = lista.Count;
            return result;
        }

        // Obtiene un descriptor por empresa y CORR_DESCRIPTOR_PUESTO.
        public async Task<CResult> GetAsync(SC_DESCRIPTOR_PUESTOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAsync(p);
        }

        // Valida reglas de negocio, crea el descriptor, precarga catálogos e inicia el flujo en Borrador
        // (PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA OPERACION=1 / GUARDAR), igual que el simulador.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Rechaza si CORR_EMPRESA no viene en la sesión.
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            // Valida campos obligatorios (formato, unidad, puesto, fechas, etc.).
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (Data.CORR_PUESTO.HasValue && Data.CORR_UNIDAD.HasValue && Data.CORR_UNIDAD.Value > 0)
            {
                // Impide crear si la misma unidad+puesto ya tiene descriptor en borrador, flujo o activo.
                var exists = await _repo.ExistsDescriptorAbiertoPorPuestoAsync(
                    Data.CORR_EMPRESA,
                    Data.CORR_UNIDAD.Value,
                    Data.CORR_PUESTO.Value,
                    0);

                if (exists)
                {
                    return ValidationError(
                        "Ya existe un descriptor para este puesto en esta unidad que se encuentra en proceso de aprobacion o activo. Solo sera posible crear una nueva version cuando la version actual haya sido activada y posteriormente desactivada.");
                }
            }

            // Qué hace: asigna VERSION = MAX(empresa+unidad+puesto)+1 antes del Insert.
            // Cómo lo hace: consulta SC_DESCRIPTOR_PUESTO (incluye Inactivo) y fija Data.VERSION.
            await AsignarSiguienteVersionAsync(Data, excludeCorrDescriptor: 0);

            // Recorta textos, normaliza formato y estado antes de escribir en la tabla.
            NormalizeData(Data);
            var result = await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
            if (result.ErrorCode != 0)
            {
                return result;
            }

            var corrDescriptor = 0;
            if (result.Data is SC_DESCRIPTOR_PUESTOView created)
            {
                corrDescriptor = created.CORR_DESCRIPTOR_PUESTO;
            }
            else if (result.CodeHelper != null && int.TryParse(result.CodeHelper.ToString(), out var codeHelper))
            {
                corrDescriptor = codeHelper;
            }

            if (corrDescriptor > 0)
            {
                var seedMessages = new List<string>();

                // Copia requerimientos activos del catálogo al descriptor recién creado.
                var seedRequerimientos = await _requerimientoOrganizacionalService.SeedActivosDesdeCatalogoAsync(
                    Data.CORR_EMPRESA,
                    corrDescriptor,
                    vLOGIN_SISTEMA,
                    vESTACION);

                if (!string.IsNullOrWhiteSpace(seedRequerimientos?.ErrorMessage))
                {
                    seedMessages.Add(seedRequerimientos.ErrorMessage.Trim());
                }

                // Copia riesgos activos del catálogo al descriptor recién creado.
                var seedRiesgos = await _riesgoPuestoService.SeedActivosDesdeCatalogoAsync(
                    Data.CORR_EMPRESA,
                    corrDescriptor,
                    vLOGIN_SISTEMA,
                    vESTACION);

                if (!string.IsNullOrWhiteSpace(seedRiesgos?.ErrorMessage))
                {
                    seedMessages.Add(seedRiesgos.ErrorMessage.Trim());
                }

                // Copia responsabilidades activas del catálogo al descriptor recién creado.
                var seedResponsabilidades = await _responsabilidadCargoService.SeedActivosDesdeCatalogoAsync(
                    Data.CORR_EMPRESA,
                    corrDescriptor,
                    vLOGIN_SISTEMA,
                    vESTACION);

                if (!string.IsNullOrWhiteSpace(seedResponsabilidades?.ErrorMessage))
                {
                    seedMessages.Add(seedResponsabilidades.ErrorMessage.Trim());
                }

                // Qué hace: inicia el flujo en Borrador (igual que BLOQUE 2 del simulador).
                // Cómo: OPERACION=1 GUARDAR crea instancia + bitácora; Solicitar (2) es el siguiente paso.
                var unidadDocumento = Data.CORR_UNIDAD;
                if ((!unidadDocumento.HasValue || unidadDocumento.Value <= 0) &&
                    result.Data is SC_DESCRIPTOR_PUESTOView createdRow &&
                    createdRow.CORR_UNIDAD.HasValue)
                {
                    unidadDocumento = createdRow.CORR_UNIDAD;
                }

                var autorizaBorrador = await _repo.AutorizaAsync(
                    new SC_DESCRIPTOR_PUESTO_AUTORIZAParam
                    {
                        CORR_EMPRESA = Data.CORR_EMPRESA,
                        CORR_DESCRIPTOR_PUESTO = corrDescriptor,
                        CORR_UNIDAD_DOCUMENTO = unidadDocumento,
                        OPERACION = 1,
                        OBSERVACION =
                            "Se creo el descriptor de puesto y se inicio el flujo en Borrador.",
                    },
                    vLOGIN_SISTEMA);

                if (!autorizaBorrador.Result || autorizaBorrador.ErrorCode != 0)
                {
                    result.Result = false;
                    result.ErrorCode = autorizaBorrador.ErrorCode != 0 ? autorizaBorrador.ErrorCode : -1;
                    result.ErrorMessage =
                        "El descriptor se creo, pero no se pudo iniciar el flujo en Borrador: " +
                        (autorizaBorrador.ErrorMessage ?? "error desconocido");
                    result.ErrorSource = autorizaBorrador.ErrorSource;
                    return result;
                }

                // Devuelve la fila ya sincronizada por el SP (estado Borrador en flujo).
                if (autorizaBorrador.Data != null)
                {
                    result.Data = autorizaBorrador.Data;
                    result.RowsAffected = autorizaBorrador.RowsAffected;
                    result.CodeHelper = autorizaBorrador.CodeHelper;
                }

                if (seedMessages.Count > 0)
                {
                    result.ErrorMessage = string.Join(" ", seedMessages);
                }
            }

            return result;
        }

        // Valida y actualiza un descriptor existente en SC_DESCRIPTOR_PUESTO.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Rechaza si CORR_EMPRESA no viene en la sesión.
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            // Valida campos obligatorios (formato, unidad, puesto, fechas, etc.).
            var validation = Validate(Data);
            if (validation != null)
            {
                return validation;
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el descriptor de puesto a actualizar.");
            }

            // Qué hace: si cambia unidad o puesto, recalcula VERSION y valida que no haya otro abierto.
            // Cómo lo hace: lee la fila actual, compara claves y aplica MAX+1 excluyendo este corr.
            var actualResult = await _repo.GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
            });

            if (actualResult.ErrorCode != 0)
            {
                return actualResult;
            }

            var actual = actualResult.Data as SC_DESCRIPTOR_PUESTOView;
            var unidadNueva = Data.CORR_UNIDAD ?? 0;
            var puestoNuevo = Data.CORR_PUESTO ?? 0;
            var unidadActual = actual?.CORR_UNIDAD ?? 0;
            var puestoActual = actual?.CORR_PUESTO ?? 0;
            var cambioUnidadOPuesto = unidadNueva != unidadActual || puestoNuevo != puestoActual;

            if (cambioUnidadOPuesto && Data.CORR_PUESTO.HasValue && Data.CORR_UNIDAD.HasValue && Data.CORR_UNIDAD.Value > 0)
            {
                var exists = await _repo.ExistsDescriptorAbiertoPorPuestoAsync(
                    Data.CORR_EMPRESA,
                    Data.CORR_UNIDAD.Value,
                    Data.CORR_PUESTO.Value,
                    Data.CORR_DESCRIPTOR_PUESTO);

                if (exists)
                {
                    return ValidationError(
                        "Ya existe un descriptor para este puesto en esta unidad que se encuentra en proceso de aprobacion o activo. Solo sera posible crear una nueva version cuando la version actual haya sido activada y posteriormente desactivada.");
                }

                await AsignarSiguienteVersionAsync(Data, Data.CORR_DESCRIPTOR_PUESTO);
            }
            else if (actual?.VERSION.HasValue == true && actual.VERSION.Value > 0)
            {
                // Conserva la VERSION de BD si no cambió la clave unidad+puesto.
                Data.VERSION = actual.VERSION;
            }

            // Recorta textos, normaliza formato y estado antes de escribir en la tabla.
            NormalizeData(Data);
            var result = await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
            if (result.ErrorCode != 0)
            {
                return result;
            }

            return result;
        }

        // Actualiza solo RESPONSABLE desde el editable de Entrenamiento.
        public async Task<CResult> UpdateResponsableAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el descriptor de puesto a actualizar.");
            }

            Data.RESPONSABLE = string.IsNullOrWhiteSpace(Data.RESPONSABLE) ? null : Data.RESPONSABLE.Trim();
            if (!string.IsNullOrWhiteSpace(Data.RESPONSABLE) && Data.RESPONSABLE.Length > 100)
            {
                return ValidationError("El responsable no puede exceder 100 caracteres.");
            }

            return await _repo.UpdateResponsableAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Actualiza solo impacto económico desde la fila virtual de Responsabilidades.
        public async Task<CResult> UpdateImpactoEconomicoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("No se pudo identificar el descriptor de puesto a actualizar.");
            }

            Data.DESCRIPCION_IMPACTO_ECONOMICO = string.IsNullOrWhiteSpace(Data.DESCRIPCION_IMPACTO_ECONOMICO)
                ? null
                : Data.DESCRIPCION_IMPACTO_ECONOMICO.Trim();

            if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION_IMPACTO_ECONOMICO) && Data.DESCRIPCION_IMPACTO_ECONOMICO.Length > 255)
            {
                return ValidationError("La descripcion del impacto economico no puede exceder 255 caracteres.");
            }

            return await _repo.UpdateImpactoEconomicoAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: ejecuta una operación del flujo (Enviar/Aprobar/Observar/Inactivar/Reactivar).
        // Cómo lo hace: valida claves y OPERACION; en REACTIVAR bloquea si hay otro descriptor abierto del puesto;
        //              luego delega al SP AUTORIZA; el repo relee la vista.
        public async Task<CResult> AutorizaAsync(SC_DESCRIPTOR_PUESTO_AUTORIZAParam Data, string vLOGIN_SISTEMA)
        {
            var empresaError = ValidateEmpresaSesion(Data?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (Data.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe indicar el descriptor de puesto.");
            }

            if (Data.OPERACION < 1 || Data.OPERACION > 6)
            {
                return ValidationError("Operacion invalida. Use 1=GUARDAR, 2=ENVIAR, 3=APROBAR, 4=OBSERVAR, 5=INACTIVAR, 6=REACTIVAR.");
            }

            if (string.IsNullOrWhiteSpace(Data.OBSERVACION))
            {
                return ValidationError("El comentario / observacion es obligatorio.");
            }

            if (string.IsNullOrWhiteSpace(vLOGIN_SISTEMA))
            {
                return ValidationError("No se pudo identificar el usuario de sesion.");
            }

            // Qué hace: en Reactivar (6), evita dos descriptores vivos de la misma unidad+puesto (igual que Create).
            // Cómo: lee CORR_UNIDAD y CORR_PUESTO del descriptor actual y busca otro no Inactivo excluyendo el correlativo.
            if (Data.OPERACION == 6)
            {
                var getResult = await GetAsync(new SC_DESCRIPTOR_PUESTOParam
                {
                    CORR_EMPRESA = Data.CORR_EMPRESA,
                    CORR_DESCRIPTOR_PUESTO = Data.CORR_DESCRIPTOR_PUESTO,
                });

                if (getResult?.Data is SC_DESCRIPTOR_PUESTOView descriptor
                    && descriptor.CORR_PUESTO.HasValue
                    && descriptor.CORR_PUESTO.Value > 0
                    && descriptor.CORR_UNIDAD.HasValue
                    && descriptor.CORR_UNIDAD.Value > 0)
                {
                    var exists = await _repo.ExistsDescriptorAbiertoPorPuestoAsync(
                        Data.CORR_EMPRESA,
                        descriptor.CORR_UNIDAD.Value,
                        descriptor.CORR_PUESTO.Value,
                        Data.CORR_DESCRIPTOR_PUESTO);

                    if (exists)
                    {
                        return ValidationError(
                            "Ya existe un descriptor para este puesto en esta unidad que se encuentra en proceso de aprobacion o activo. Solo sera posible reactivar esta version cuando la version actual haya sido activada y posteriormente desactivada.");
                    }
                }
            }

            Data.OBSERVACION = Data.OBSERVACION.Trim();
            return await _repo.AutorizaAsync(Data, vLOGIN_SISTEMA.Trim());
        }

        // Qué hace: indica qué botones de flujo mostrar para el usuario de sesión.
        // Cómo: ejecuta PRAL_DATA_SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJO (destinatario + estado)
        //       y luego aplica permiso U del JWT; sin U el usuario queda en solo consulta.
        public async Task<CResult> GetAccionesFlujoAsync(SC_DESCRIPTOR_PUESTOParam xWhere, string permisoOpcion)
        {
            var empresaError = ValidateEmpresaSesion(xWhere?.CORR_EMPRESA ?? 0);
            if (empresaError != null)
            {
                return empresaError;
            }

            if (xWhere.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return ValidationError("Debe indicar el descriptor de puesto.");
            }

            if (string.IsNullOrWhiteSpace(xWhere.LOGIN_SISTEMA))
            {
                return ValidationError("No se pudo identificar el usuario de sesion.");
            }

            xWhere.LOGIN_SISTEMA = xWhere.LOGIN_SISTEMA.Trim();
            var result = await _repo.GetAccionesFlujoAsync(xWhere);
            if (!result.Result || result.Data == null)
            {
                return result;
            }

            if (result.Data is SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJOView acciones)
            {
                AplicarPermisoCrudpAccionesFlujo(acciones, permisoOpcion);
            }

            return result;
        }

        // Qué hace: arma el PDF Formato corto del descriptor (solo datos SC_DESCRIPTOR_PUESTO por ahora).
        // Cómo: SP de impresión → SC_REPO → SelectionHiring/PostScDescriptorPuestoFormatoCortoImpr.
        public async Task<Stream> GetPDFFormatoCortoAsync(SC_DESCRIPTOR_PUESTOParam xWhere, string loginSistema)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "@CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "@CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            var dataResult = await _repo.GetDescriptorFormatoCortoImprAsync(p);
            if (!dataResult.Result || dataResult.Data == null)
            {
                throw new InvalidOperationException(
                    string.IsNullOrWhiteSpace(dataResult.ErrorMessage)
                        ? "No se pudo obtener datos para imprimir el descriptor."
                        : dataResult.ErrorMessage);
            }

            return await _repoRpt.GetScDescriptorPuestoFormatoCortoImprAsync(
                (SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPRPayload)dataResult.Data,
                _repoUser.GenerateRptToken(loginSistema));
        }

        // Qué hace: arma el PDF Formato extenso del descriptor (solo generalidades por ahora).
        // Cómo: SP de impresión → SC_REPO → SelectionHiring/PostScDescriptorPuestoFormatoExtensoImpr.
        public async Task<Stream> GetPDFFormatoExtensoAsync(SC_DESCRIPTOR_PUESTOParam xWhere, string loginSistema)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "@CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "@CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            var dataResult = await _repo.GetDescriptorFormatoExtensoImprAsync(p);
            if (!dataResult.Result || dataResult.Data == null)
            {
                throw new InvalidOperationException(
                    string.IsNullOrWhiteSpace(dataResult.ErrorMessage)
                        ? "No se pudo obtener datos para imprimir el descriptor."
                        : dataResult.ErrorMessage);
            }

            return await _repoRpt.GetScDescriptorPuestoFormatoExtensoImprAsync(
                (SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRPayload)dataResult.Data,
                _repoUser.GenerateRptToken(loginSistema));
        }

        // Qué hace: apaga flags PUEDE_* de flujo si el login no tiene permiso U (Update).
        // Cómo: todas las operaciones de Autoriza exigen policy |U; destinatario sin U = solo lectura.
        private static void AplicarPermisoCrudpAccionesFlujo(
            SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJOView acciones,
            string permisoOpcion)
        {
            if (acciones == null)
            {
                return;
            }

            var permiso = permisoOpcion ?? string.Empty;
            if (permiso.Contains('U'))
            {
                return;
            }

            acciones.PUEDE_SOLICITAR = false;
            acciones.PUEDE_APROBAR = false;
            acciones.PUEDE_OBSERVAR = false;
            acciones.PUEDE_INACTIVAR = false;
            acciones.PUEDE_REACTIVAR = false;
        }

	// Valida empresa y elimina el descriptor con sus registros relacionados.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Rechaza si CORR_EMPRESA no viene en la sesión.
            var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
            if (empresaError != null)
            {
                return empresaError;
            }

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        /// <summary>
        /// Lookup sc-requisicion-personal: descriptores por CORR_EMPRESA + CORR_UNIDAD.
        /// Método nuevo; no modifica GetAllAsync / GetAsync existentes.
        /// </summary>
        public async Task<CResult> GetCORR_DESCRIPTOR_PUESTO_SC_REQUISICION_PERSONAL(SC_DESCRIPTOR_PUESTOParam xWhere)
        {
            if (xWhere == null || xWhere.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe seleccionar una unidad para listar los descriptores de puesto.");
            }

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_UNIDAD", Value = xWhere.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetCORR_DESCRIPTOR_PUESTO_SC_REQUISICION_PERSONAL(p);
        }

        // Arma la lista de parámetros SQL con CORR_EMPRESA para filtrar consultas.
        private static List<CParameter> BuildParameters(SC_DESCRIPTOR_PUESTOParam xWhere)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        // Recorta textos, unifica alias de formato (CORTA→CORTO, EXTENSA→EXTENSO) y fija estado BORRADOR por defecto.
        private static void NormalizeData(SC_DESCRIPTOR_PUESTOTable Data)
        {
            Data.OBJETIVO_PUESTO = string.IsNullOrWhiteSpace(Data.OBJETIVO_PUESTO)
                ? null
                : Data.OBJETIVO_PUESTO.Trim();
            Data.NOMBRE_PUESTO = string.IsNullOrWhiteSpace(Data.NOMBRE_PUESTO)
                ? null
                : Data.NOMBRE_PUESTO.Trim();
            Data.NOMBRE_UNIDAD = string.IsNullOrWhiteSpace(Data.NOMBRE_UNIDAD)
                ? null
                : Data.NOMBRE_UNIDAD.Trim();
            Data.DESCRIPCION_IMPACTO_ECONOMICO =
                string.IsNullOrWhiteSpace(Data.DESCRIPCION_IMPACTO_ECONOMICO)
                    ? null
                    : Data.DESCRIPCION_IMPACTO_ECONOMICO.Trim();
            Data.RESPONSABLE = string.IsNullOrWhiteSpace(Data.RESPONSABLE) ? null : Data.RESPONSABLE.Trim();
            // Convierte variantes antiguas del formato al valor canónico.
            Data.FORMATO = NormalizeFormato(Data.FORMATO);
            if (!Data.CORR_ESTADO.HasValue || Data.CORR_ESTADO <= 0)
            {
                Data.CORR_ESTADO = 11; // Borrador (SEG_FLUJO_ESTADO)
            }
            Data.NOMBRE_ESTADO = string.IsNullOrWhiteSpace(Data.NOMBRE_ESTADO)
                ? "Borrador"
                : Data.NOMBRE_ESTADO.Trim();
            // VERSION la asigna AsignarSiguienteVersionAsync (Create / Update con cambio de clave).
            if (!Data.VERSION.HasValue || Data.VERSION.Value <= 0)
            {
                Data.VERSION = 1;
            }
        }

        // Qué hace: fija Data.VERSION = MAX(empresa+unidad+puesto)+1 (o 1 si no hay historial).
        // Cómo lo hace: llama al repositorio; si faltan unidad/puesto, deja VERSION=1.
        private async Task AsignarSiguienteVersionAsync(SC_DESCRIPTOR_PUESTOTable Data, int excludeCorrDescriptor)
        {
            if (!Data.CORR_PUESTO.HasValue || !Data.CORR_UNIDAD.HasValue
                || Data.CORR_UNIDAD.Value <= 0 || Data.CORR_PUESTO.Value <= 0)
            {
                Data.VERSION = 1;
                return;
            }

            Data.VERSION = await _repo.GetNextVersionPorUnidadPuestoAsync(
                Data.CORR_EMPRESA,
                Data.CORR_UNIDAD.Value,
                Data.CORR_PUESTO.Value,
                excludeCorrDescriptor);
        }

        // Revisa campos obligatorios y longitudes antes de guardar el descriptor.
        private static CResult Validate(SC_DESCRIPTOR_PUESTOTable Data)
        {
            if (Data == null)
            {
                return ValidationError("No se recibieron datos del descriptor de puesto.");
            }

            if (string.IsNullOrWhiteSpace(Data.FORMATO))
            {
                return ValidationError("Debe seleccionar el tipo de formato del descriptor.");
            }

            if (!Data.CORR_UNIDAD.HasValue || Data.CORR_UNIDAD <= 0)
            {
                return ValidationError("Debe seleccionar el area (unidad).");
            }

            if (!Data.CORR_PUESTO.HasValue || Data.CORR_PUESTO <= 0)
            {
                return ValidationError("Debe seleccionar el titulo del puesto.");
            }

            if (!Data.CORR_PUESTO_REPORTA.HasValue || Data.CORR_PUESTO_REPORTA <= 0)
            {
                return ValidationError("Debe seleccionar a quien reporta (jefe de la unidad).");
            }

            if (!Data.FECHA_EMISION.HasValue)
            {
                return ValidationError("Debe ingresar la fecha de emision.");
            }

            if (!string.IsNullOrWhiteSpace(Data.OBJETIVO_PUESTO) && Data.OBJETIVO_PUESTO.Trim().Length > 255)
            {
                return ValidationError("El objetivo del puesto no puede superar 255 caracteres.");
            }

            return null;
        }

        // Traduce alias de formato (CORTA/EXTENSA) al valor estándar (CORTO/EXTENSO).
        private static string NormalizeFormato(string formato)
        {
            if (string.IsNullOrWhiteSpace(formato))
            {
                return formato;
            }

            var value = formato.Trim().ToUpperInvariant();
            return value switch
            {
                "CORTA" => "CORTO",
                "EXTENSA" => "EXTENSO",
                _ => value,
            };
        }

        // Rechaza la operación si CORR_EMPRESA no es válida (sesión sin empresa).
        private static CResult ValidateEmpresaSesion(int corrEmpresa)
        {
            if (corrEmpresa <= 0)
            {
                return ValidationError("No se pudo identificar la empresa de la sesion.");
            }

            return null;
        }

        // Devuelve un CResult con ErrorCode 4101 y el mensaje de validación.
        private static CResult ValidationError(string message)
        {
            return new CResult
            {
                Result = false,
                ErrorCode = 4101,
                ErrorMessage = message,
                ErrorSource = "[SC_DESCRIPTOR_PUESTOService]",
            };
        }
    }
}
