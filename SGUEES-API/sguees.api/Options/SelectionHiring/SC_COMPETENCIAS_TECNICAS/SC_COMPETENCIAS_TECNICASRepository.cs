// Qué hace: persistencia SQL del catálogo competencias técnicas.
// Cómo: ejecuta CRUD y consultas jerárquicas sobre la tabla SC_COMPETENCIAS_TECNICAS y la vista V_SC_COMPETENCIAS_TECNICAS.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Qué hace: repositorio de competencias técnicas.
    // Cómo: ejecuta GetAllAsync, GetAsync, CreateAsync, UpdateAsync, DeleteAsync, ActivarInactivarAsync y consultas auxiliares sobre SQL Server.
    public class SC_COMPETENCIAS_TECNICASRepository : BaseRepository<SC_COMPETENCIAS_TECNICASTable>, ISC_COMPETENCIAS_TECNICASRepository
    {
        private const string _TableName = "SC_COMPETENCIAS_TECNICAS";
        private const string _ViewName = "V_SC_COMPETENCIAS_TECNICAS";
        private const string _CampoPk = "CORR_COMPETENCIAS_TECNICAS";
        private const string _CampoEstado = "ESTADO_COMPETENCIAS_TECNICAS";
        private const bool _UsaEmpresa = true;

        public SC_COMPETENCIAS_TECNICASRepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: lee el listado desde la vista filtrado por empresa.
        // Cómo: llama a GetDataReader sobre V_SC_COMPETENCIAS_TECNICAS con CORR_EMPRESA y ordena por CORR_COMPETENCIAS_TECNICAS.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var dbWhere = xWhere
                    .Where(x => x.ParameterName == "CORR_EMPRESA")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_COMPETENCIAS_TECNICAS)
                    .ToList();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response.Count;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: lee un registro por llave desde la vista.
        // Cómo: llama a GetDataReader sobre V_SC_COMPETENCIAS_TECNICAS con los filtros recibidos y devuelve el primer registro.
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: inserta el registro en la tabla.
        // Cómo: llama a Insert sobre SC_COMPETENCIAS_TECNICAS con los parámetros del modelo y devuelve la vista del registro creado.
        public async Task<CResult> CreateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = Data.CORR_COMPETENCIAS_TECNICAS_PADRE, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_COMPETENCIAS_TECNICAS", Value = Data.CODIGO_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_TECNICAS", Value = Data.NOMBRE_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NIVEL", Value = Data.NIVEL, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_COMPETENCIAS_TECNICAS", Value = Data.ESTADO_COMPETENCIAS_TECNICAS ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "CORR_COMPETENCIAS_TECNICAS", pWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                var duplicateKey = IsDuplicateKeyError(e);
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = duplicateKey ? 2627 : -1;
                objResultado.ErrorMessage = duplicateKey
                    ? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
                    : e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: actualiza el registro en la tabla.
        // Cómo: llama a Update sobre SC_COMPETENCIAS_TECNICAS con los parámetros del modelo y las claves de pWhere.
        public async Task<CResult> UpdateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = Data.CORR_COMPETENCIAS_TECNICAS_PADRE, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_COMPETENCIAS_TECNICAS", Value = Data.CODIGO_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_TECNICAS", Value = Data.NOMBRE_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NIVEL", Value = Data.NIVEL, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_COMPETENCIAS_TECNICAS", Value = Data.ESTADO_COMPETENCIAS_TECNICAS ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? Data.CORR_COMPETENCIAS_TECNICAS;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: elimina el registro de la tabla.
        // Cómo: llama a Delete sobre SC_COMPETENCIAS_TECNICAS con CORR_EMPRESA y CORR_COMPETENCIAS_TECNICAS; traduce errores de integridad a mensaje controlado.
        public async Task<CResult> DeleteAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_COMPETENCIAS_TECNICAS;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = "No se puede eliminar la competencia porque tiene registros asociados en otras tablas.";
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: comprueba si otra competencia de la empresa utiliza el mismo código.
        // Cómo: ejecuta una consulta SQL sobre V_SC_COMPETENCIAS_TECNICAS filtrando por CORR_EMPRESA, CODIGO y excludeCorr.
        public async Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(codigo))
            {
                return false;
            }

            const string sql = @"SELECT TOP 1 1 AS FOUND
                FROM V_SC_COMPETENCIAS_TECNICAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND UPPER(LTRIM(RTRIM(CODIGO_COMPETENCIAS_TECNICAS))) = UPPER(LTRIM(RTRIM(@CODIGO)))
                AND (@EXCLUDE_CORR <= 0 OR CORR_COMPETENCIAS_TECNICAS <> @EXCLUDE_CORR)";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO", Value = codigo.Trim(), DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorr, DbType = System.Data.DbType.Int32 },
                });

                var exists = reader.Read();
                reader.Close();
                return exists;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        // Qué hace: recupera candidatos padre por nivel y estado.
        // Cómo: ejecuta una consulta SQL sobre V_SC_COMPETENCIAS_TECNICAS filtrando por CORR_EMPRESA, NIVEL y opcionalmente ESTADO.
        public async Task<List<SC_COMPETENCIAS_TECNICASView>> GetPadresByNivelAsync(int corrEmpresa, string nivel, bool? soloActivos)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(nivel))
            {
                return new List<SC_COMPETENCIAS_TECNICASView>();
            }

            const string sql = @"SELECT
                    CORR_COMPETENCIAS_TECNICAS,
                    CODIGO_COMPETENCIAS_TECNICAS,
                    NOMBRE_COMPETENCIAS_TECNICAS,
                    DESCRIPCION,
                    NIVEL,
                    ESTADO_COMPETENCIAS_TECNICAS
                FROM V_SC_COMPETENCIAS_TECNICAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND UPPER(LTRIM(RTRIM(NIVEL))) = UPPER(LTRIM(RTRIM(@NIVEL)))
                AND (@FILTRAR_ESTADO = 0 OR ESTADO_COMPETENCIAS_TECNICAS = @ESTADO)
                ORDER BY CODIGO_COMPETENCIAS_TECNICAS, CORR_COMPETENCIAS_TECNICAS";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "NIVEL", Value = nivel.Trim(), DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FILTRAR_ESTADO", Value = soloActivos.HasValue ? 1 : 0, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ESTADO", Value = soloActivos ?? false, DbType = System.Data.DbType.Boolean },
                });

                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).ToList();
                reader.Close();
                return response;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        // Qué hace: une los tres niveles activos para construir el catálogo del descriptor.
        // Cómo: ejecuta un JOIN SQL entre V_SC_COMPETENCIAS_TECNICAS de niveles 1, 2 y 3 filtrando por CORR_EMPRESA y estado activo.
        public async Task<List<SC_COMPETENCIAS_TECNICASView>> GetCatalogoNivel3DescriptorAsync(int corrEmpresa)
        {
            if (corrEmpresa <= 0)
            {
                return new List<SC_COMPETENCIAS_TECNICASView>();
            }

            const string sql = @"SELECT
                    H.CORR_EMPRESA,
                    H.CORR_COMPETENCIAS_TECNICAS,
                    H.CORR_COMPETENCIAS_TECNICAS_PADRE,
                    H.CODIGO_COMPETENCIAS_TECNICAS,
                    H.NOMBRE_COMPETENCIAS_TECNICAS,
                    H.DESCRIPCION,
                    H.NIVEL,
                    H.ESTADO_COMPETENCIAS_TECNICAS,
                    N2.CODIGO_COMPETENCIAS_TECNICAS AS CODIGO_PADRE,
                    N2.NOMBRE_COMPETENCIAS_TECNICAS AS NOMBRE_PADRE,
                    N2.DESCRIPCION AS DESCRIPCION_PADRE,
                    N2.NIVEL AS NIVEL_PADRE,
                    N1.CODIGO_COMPETENCIAS_TECNICAS AS CODIGO_NIV1,
                    N1.NOMBRE_COMPETENCIAS_TECNICAS AS NOMBRE_NIV1
                FROM V_SC_COMPETENCIAS_TECNICAS H
                INNER JOIN V_SC_COMPETENCIAS_TECNICAS N2
                    ON N2.CORR_EMPRESA = H.CORR_EMPRESA
                   AND N2.CORR_COMPETENCIAS_TECNICAS = H.CORR_COMPETENCIAS_TECNICAS_PADRE
                INNER JOIN V_SC_COMPETENCIAS_TECNICAS N1
                    ON N1.CORR_EMPRESA = N2.CORR_EMPRESA
                   AND N1.CORR_COMPETENCIAS_TECNICAS = N2.CORR_COMPETENCIAS_TECNICAS_PADRE
                WHERE H.CORR_EMPRESA = @CORR_EMPRESA
                  AND UPPER(LTRIM(RTRIM(H.NIVEL))) = 'NIV3'
                  AND UPPER(LTRIM(RTRIM(N2.NIVEL))) = 'NIV2'
                  AND UPPER(LTRIM(RTRIM(N1.NIVEL))) = 'NIV1'
                  AND ISNULL(H.ESTADO_COMPETENCIAS_TECNICAS, 1) = 1
                  AND ISNULL(N2.ESTADO_COMPETENCIAS_TECNICAS, 1) = 1
                  AND ISNULL(N1.ESTADO_COMPETENCIAS_TECNICAS, 1) = 1
                ORDER BY
                    N1.CODIGO_COMPETENCIAS_TECNICAS,
                    N1.CORR_COMPETENCIAS_TECNICAS,
                    N2.CODIGO_COMPETENCIAS_TECNICAS,
                    N2.CORR_COMPETENCIAS_TECNICAS,
                    H.CODIGO_COMPETENCIAS_TECNICAS,
                    H.CORR_COMPETENCIAS_TECNICAS";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                });

                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).ToList();
                reader.Close();
                return response;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        // Qué hace: recupera códigos hermanos para calcular el siguiente sufijo de nivel 3.
        // Cómo: ejecuta una consulta SQL sobre V_SC_COMPETENCIAS_TECNICAS filtrando por CORR_EMPRESA, CORR_PADRE y prefijo del código padre.
        public async Task<List<string>> GetSiblingCodigosLevel3Async(int corrEmpresa, int corrPadre, string parentCodigoPrefix)
        {
            if (corrEmpresa <= 0 || corrPadre <= 0 || string.IsNullOrWhiteSpace(parentCodigoPrefix))
            {
                return new List<string>();
            }

            const string sql = @"SELECT CODIGO_COMPETENCIAS_TECNICAS
                FROM V_SC_COMPETENCIAS_TECNICAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND CORR_COMPETENCIAS_TECNICAS_PADRE = @CORR_PADRE
                AND UPPER(LTRIM(RTRIM(NIVEL))) = 'NIV3'
                AND CODIGO_COMPETENCIAS_TECNICAS LIKE @CODIGO_PREFIX + '%'";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PADRE", Value = corrPadre, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_PREFIX", Value = parentCodigoPrefix.Trim(), DbType = System.Data.DbType.String },
                });

                var codigos = new List<string>();
                while (reader.Read())
                {
                    codigos.Add(reader["CODIGO_COMPETENCIAS_TECNICAS"]?.ToString() ?? string.Empty);
                }

                reader.Close();
                return codigos;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        // Qué hace: determina si una competencia conserva nodos hijos asociados.
        // Cómo: ejecuta una consulta SQL sobre V_SC_COMPETENCIAS_TECNICAS filtrando por CORR_EMPRESA y CORR_COMPETENCIAS_TECNICAS_PADRE.
        public async Task<bool> HasChildrenAsync(int corrEmpresa, int corrCompetencia)
        {
            if (corrEmpresa <= 0 || corrCompetencia <= 0)
            {
                return false;
            }

            const string sql = @"SELECT TOP 1 1 AS FOUND
                FROM V_SC_COMPETENCIAS_TECNICAS
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND CORR_COMPETENCIAS_TECNICAS_PADRE = @CORR_COMPETENCIAS_TECNICAS";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = corrCompetencia, DbType = System.Data.DbType.Int32 },
                });

                var exists = reader.Read();
                reader.Close();
                return exists;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        // Qué hace: invierte el estado activo/inactivo del registro.
        // Cómo: ejecuta PRAL_MTTO_CATALOGO_ESTADO_BIT y, si no hay error, relee el registro con GetDataReader sobre V_SC_COMPETENCIAS_TECNICAS.
        public async Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
                };

                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

                if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
                {
                    var xWhere = new List<CParameter>
                    {
                        new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                        new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                    };

                    var readerGet = await objData.GetDataReader(_ViewName, xWhere);
                    var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(readerGet).FirstOrDefault();

                    readerGet.Close();

                    objResultado.Data = response;
                    objResultado.Result = true;
                    objResultado.RowsAffected = 1;
                    objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? Data.CORR_COMPETENCIAS_TECNICAS;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = string.Empty;
                    objResultado.ErrorSource = string.Empty;
                }
                else
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper = Data.CORR_COMPETENCIAS_TECNICAS;
                    objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
                    objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
                    objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
                }
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = Data.CORR_COMPETENCIAS_TECNICAS;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: detecta errores de clave duplicada de SQL Server.
        // Cómo: busca en el mensaje de excepción textos como duplicate key, PRIMARY KEY o UNIQUE KEY.
        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}
