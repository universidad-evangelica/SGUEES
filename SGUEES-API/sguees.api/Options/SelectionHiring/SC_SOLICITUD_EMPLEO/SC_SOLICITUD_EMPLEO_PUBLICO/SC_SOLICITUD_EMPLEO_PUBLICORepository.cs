using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    public class SC_SOLICITUD_EMPLEO_PUBLICORepository
        : BaseRepository<SC_SOLICITUD_EMPLEO_TOKENTable>, ISC_SOLICITUD_EMPLEO_PUBLICORepository
    {
        public SC_SOLICITUD_EMPLEO_PUBLICORepository(IConfiguration config)
            : base(
                config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetSolicitudAsync(List<CParameter> xWhere)
        {
            CResult resultado = new();
            try
            {
                var reader = await objData.GetDataReader("V_SC_SOLICITUD_EMPLEO", xWhere);
                var response = new List<SC_SOLICITUD_EMPLEOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();

                resultado.Data = response;
                resultado.Result = response != null;
                resultado.RowsAffected = response == null ? 0 : 1;
                resultado.ErrorCode = response == null ? -1 : 0;
                resultado.ErrorMessage = response == null ? "La solicitud de empleo no existe." : "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> GetAllTokenAsync(List<CParameter> xWhere)
        {
            CResult resultado = new();
            try
            {
                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_DATA_SC_SOLICITUD_EMPLEO_TOKEN",
                    xWhere);
                var response = new List<SC_SOLICITUD_EMPLEO_TOKENView>().FromDataReader(reader).ToList();
                reader.Close();

                resultado.Data = response;
                resultado.Result = true;
                resultado.RowsAffected = response.Count;
                resultado.ErrorCode = 0;
                resultado.ErrorMessage = "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> GenerarTokenAsync(SC_SOLICITUD_EMPLEO_TOKENTable data)
        {
            CResult resultado = new();
            try
            {
                var parametros = new List<CParameter>
                {
                    new() { ParameterName = "@CORR_EMPRESA", Value = data.CORR_EMPRESA, DbType = DbType.Int32 },
                    new() { ParameterName = "@CORR_SOLICITUD_EMPLEO", Value = data.CORR_SOLICITUD_EMPLEO, DbType = DbType.Int32 },
                    new() { ParameterName = "@TOKEN_HASH", Value = data.TOKEN_HASH, DbType = DbType.String },
                    new() { ParameterName = "@FECHA_GENERACION", Value = data.FECHA_GENERACION, DbType = DbType.DateTime },
                    new() { ParameterName = "@FECHA_EXPIRACION", Value = data.FECHA_EXPIRACION, DbType = DbType.DateTime },
                    new() { ParameterName = "@CORREO_DESTINO", Value = data.CORREO_DESTINO, DbType = DbType.String },
                };

                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_MTTO_SC_SOLICITUD_EMPLEO_TOKEN_GENERAR",
                    parametros);
                var response = new List<SC_SOLICITUD_EMPLEO_TOKENView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();

                resultado.Data = response;
                resultado.Result = response != null;
                resultado.RowsAffected = response == null ? 0 : 1;
                resultado.CodeHelper = response?.CORR_TOKEN ?? 0;
                resultado.ErrorCode = response == null ? -1 : 0;
                resultado.ErrorMessage = response == null ? "No fue posible generar el token." : "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> ActualizarEstadoTokenAsync(
            int corrEmpresa,
            int corrToken,
            string estadoToken)
        {
            CResult resultado = new();
            try
            {
                var parametros = new List<CParameter>
                {
                    new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
                    new() { ParameterName = "@CORR_TOKEN", Value = corrToken, DbType = DbType.Int32 },
                    new() { ParameterName = "@ESTADO_TOKEN", Value = estadoToken, DbType = DbType.String },
                };

                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_MTTO_SC_SOLICITUD_EMPLEO_TOKEN_ESTADO",
                    parametros);
                var response = new List<SC_SOLICITUD_EMPLEO_TOKENView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();

                resultado.Data = response;
                resultado.Result = response != null;
                resultado.RowsAffected = response == null ? 0 : 1;
                resultado.CodeHelper = response?.CORR_TOKEN ?? 0;
                resultado.ErrorCode = response == null ? -1 : 0;
                resultado.ErrorMessage = response == null ? "No fue posible actualizar el token." : "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> ValidarTokenAsync(string tokenHash)
        {
            CResult resultado = new();
            try
            {
                var parametros = new List<CParameter>
                {
                    new() { ParameterName = "@TOKEN_HASH", Value = tokenHash, DbType = DbType.String },
                };

                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_DATA_SC_SOLICITUD_EMPLEO_PUBLICO_VALIDAR",
                    parametros);
                var response = new List<SC_SOLICITUD_EMPLEO_PUBLICOView>().FromDataReader(reader).FirstOrDefault()
                    ?? new SC_SOLICITUD_EMPLEO_PUBLICOView { VALIDO = false };
                reader.Close();

                resultado.Data = response;
                resultado.Result = true;
                resultado.RowsAffected = response.VALIDO ? 1 : 0;
                resultado.ErrorCode = 0;
                resultado.ErrorMessage = response.VALIDO
                    ? ""
                    : "El enlace es inválido, expiró o ya fue utilizado.";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> CompletarAsync(
            string tokenHash,
            SC_SOLICITUD_EMPLEO_COMPLETARParam data)
        {
            CResult resultado = new();
            try
            {
                var parametros = new List<CParameter>
                {
                    new() { ParameterName = "@TOKEN_HASH", Value = tokenHash, DbType = DbType.String },
                    new() { ParameterName = "@NOMBRE1", Value = ToDbValue(data.NOMBRE1), DbType = DbType.String },
                    new() { ParameterName = "@NOMBRE2", Value = ToDbValue(data.NOMBRE2), DbType = DbType.String },
                    new() { ParameterName = "@APELLIDO1", Value = ToDbValue(data.APELLIDO1), DbType = DbType.String },
                    new() { ParameterName = "@APELLIDO2", Value = ToDbValue(data.APELLIDO2), DbType = DbType.String },
                    new() { ParameterName = "@FECHA_NACIMIENTO", Value = data.FECHA_NACIMIENTO, DbType = DbType.Date },
                    new() { ParameterName = "@EDAD", Value = data.EDAD, DbType = DbType.Int32 },
                    new() { ParameterName = "@ESTADO_CIVIL", Value = ToDbValue(data.ESTADO_CIVIL), DbType = DbType.String },
                    new() { ParameterName = "@NACIONALIDAD", Value = ToDbValue(data.NACIONALIDAD), DbType = DbType.String },
                    new() { ParameterName = "@CORREO", Value = ToDbValue(data.CORREO), DbType = DbType.String },
                    new() { ParameterName = "@CELULAR", Value = ToDbValue(data.CELULAR), DbType = DbType.String },
                    new() { ParameterName = "@TELEFONO", Value = ToDbValue(data.TELEFONO), DbType = DbType.String },
                    new() { ParameterName = "@DIRECCION", Value = ToDbValue(data.DIRECCION), DbType = DbType.String },
                    new() { ParameterName = "@DUI", Value = ToDbValue(data.DUI), DbType = DbType.String },
                    new() { ParameterName = "@PASAPORTE", Value = ToDbValue(data.PASAPORTE), DbType = DbType.String },
                    new() { ParameterName = "@ISSS", Value = ToDbValue(data.ISSS), DbType = DbType.String },
                    new() { ParameterName = "@AFP", Value = ToDbValue(data.AFP), DbType = DbType.String },
                    new() { ParameterName = "@NOMBRE_AFP", Value = ToDbValue(data.NOMBRE_AFP), DbType = DbType.String },
                    new() { ParameterName = "@LICENCIA", Value = ToDbValue(data.LICENCIA), DbType = DbType.String },
                    new() { ParameterName = "@PLAZA_SOLICITADA", Value = ToDbValue(data.PLAZA_SOLICITADA), DbType = DbType.String },
                    new() { ParameterName = "@PRETENSION_SALARIAL", Value = data.PRETENSION_SALARIAL, DbType = DbType.Int32 },
                    new() { ParameterName = "@DISPONIBILIDAD", Value = ToDbValue(data.DISPONIBILIDAD), DbType = DbType.String },
                    new() { ParameterName = "@RELIGION", Value = ToDbValue(data.RELIGION), DbType = DbType.String },
                    new() { ParameterName = "@IGLESIA", Value = ToDbValue(data.IGLESIA), DbType = DbType.String },
                    new() { ParameterName = "@DIRECCION_IGLESIA", Value = ToDbValue(data.DIRECCION_IGLESIA), DbType = DbType.String },
                    new() { ParameterName = "@ES_CONTRIBUYENTE_CCF", Value = data.ES_CONTRIBUYENTE_CCF, DbType = DbType.Boolean },
                    new() { ParameterName = "@ES_JUBILADO", Value = data.ES_JUBILADO, DbType = DbType.Boolean },
                    new() { ParameterName = "@POSEE_DISCAPACIDAD", Value = data.POSEE_DISCAPACIDAD, DbType = DbType.Boolean },
                    new() { ParameterName = "@TIPO_DISCAPACIDAD", Value = ToDbValue(data.TIPO_DISCAPACIDAD), DbType = DbType.String },
                    new() { ParameterName = "@EMERGENCIA_NOMBRE", Value = ToDbValue(data.EMERGENCIA_NOMBRE), DbType = DbType.String },
                    new() { ParameterName = "@EMERGENCIA_PARENTESCO", Value = ToDbValue(data.EMERGENCIA_PARENTESCO), DbType = DbType.String },
                    new() { ParameterName = "@EMERGENCIA_TELEFONO", Value = ToDbValue(data.EMERGENCIA_TELEFONO), DbType = DbType.String },
                    new() { ParameterName = "@TIENE_FAMILIARES_UEES", Value = data.TIENE_FAMILIARES_UEES, DbType = DbType.Boolean },
                    new() { ParameterName = "@DECLARA_VERDAD", Value = data.DECLARA_VERDAD, DbType = DbType.Boolean },
                    new() { ParameterName = "@AUTORIZA_VERIFICACION", Value = data.AUTORIZA_VERIFICACION, DbType = DbType.Boolean },
                    new() { ParameterName = "@FECHA_DECLARACION", Value = data.FECHA_DECLARACION, DbType = DbType.DateTime },
                    new() { ParameterName = "@FIRMA_ELECTRONICA", Value = ToDbValue(data.FIRMA_ELECTRONICA), DbType = DbType.String },
                    new() { ParameterName = "@FAMILIARES_DIRECTOS_XML", Value = ToFamiliaresXml(data.FAMILIARES_DIRECTOS), DbType = DbType.String },
                    new() { ParameterName = "@HIJOS_XML", Value = ToHijosXml(data.HIJOS), DbType = DbType.String },
                    new() { ParameterName = "@ESTUDIOS_XML", Value = ToEstudiosXml(data.ESTUDIOS), DbType = DbType.String },
                    new() { ParameterName = "@IDIOMAS_XML", Value = ToIdiomasXml(data.IDIOMAS), DbType = DbType.String },
                    new() { ParameterName = "@COMPETENCIAS_XML", Value = ToCompetenciasXml(data.COMPETENCIAS), DbType = DbType.String },
                    new() { ParameterName = "@EXPERIENCIAS_XML", Value = ToExperienciasXml(data.EXPERIENCIAS), DbType = DbType.String },
                    new() { ParameterName = "@FAMILIARES_UEES_XML", Value = ToFamiliaresUeesXml(data.FAMILIARES_UEES), DbType = DbType.String },
                };

                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_MTTO_SC_SOLICITUD_EMPLEO_PUBLICO_COMPLETAR",
                    parametros);
                var response = new List<SC_SOLICITUD_EMPLEO_COMPLETARView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();

                resultado.Data = response;
                resultado.Result = response?.COMPLETADO == true;
                resultado.RowsAffected = response?.COMPLETADO == true ? 1 : 0;
                resultado.CodeHelper = response?.CORR_PERSONA_DATOS ?? 0;
                resultado.ErrorCode = response?.COMPLETADO == true ? 0 : -1;
                resultado.ErrorMessage = response?.COMPLETADO == true
                    ? ""
                    : "No fue posible completar la solicitud de empleo.";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<int> ObtenerCorrEmpresaPorTokenHashAsync(string tokenHash)
        {
            try
            {
                var reader = await objData.GetDataReader(
                    "SC_SOLICITUD_EMPLEO_TOKEN",
                    new List<CParameter>
                    {
                        new() { ParameterName = "TOKEN_HASH", Value = tokenHash, DbType = DbType.String },
                    });
                var token = new List<SC_SOLICITUD_EMPLEO_TOKENView>().FromDataReader(reader).FirstOrDefault();
                reader?.Close();
                return token?.CORR_EMPRESA ?? 0;
            }
            catch
            {
                return 0;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        public async Task<CResult> ActualizarFotoUrlAsync(int corrPersonaDatos, int corrEmpresa, string fotoUrl)
        {
            CResult resultado = new();
            try
            {
                var p = new List<CParameter>
                {
                    new() { ParameterName = "FOTO_URL", Value = fotoUrl, DbType = DbType.String },
                };
                var pWhere = new List<CParameter>
                {
                    new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
                    new() { ParameterName = "CORR_PERSONA_DATOS", Value = corrPersonaDatos, DbType = DbType.Int32 },
                };

                var reader = await objData.Update("SC_PERSONA_DATOS", p, pWhere);
                reader?.Close();

                resultado.Result = true;
                resultado.RowsAffected = 1;
                resultado.ErrorCode = 0;
                resultado.ErrorMessage = "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        private static object ToDbValue(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value;
        }

        /// <summary>
        /// SGUEES usa compatibility_level 100: el SP parsea colecciones con XML (.nodes), no OPENJSON.
        /// Formato: &lt;rows&gt;&lt;row ATTR="..." /&gt;&lt;/rows&gt;
        /// </summary>
        private static string ToFamiliaresXml(IEnumerable<SC_PERSONA_FAMILIARTable> items)
        {
            return BuildRowsXml(items, (row, x) =>
            {
                SetAttr(row, "TIPO", x.TIPO);
                SetAttr(row, "NOMBRE", x.NOMBRE);
                SetAttr(row, "DOMICILIO", x.DOMICILIO);
                SetAttr(row, "FECHA_NACIMIENTO", x.FECHA_NACIMIENTO);
                SetAttr(row, "OCUPACION", x.OCUPACION);
            });
        }

        private static string ToHijosXml(IEnumerable<SC_PERSONA_HIJOSTable> items)
        {
            return BuildRowsXml(items, (row, x) =>
            {
                SetAttr(row, "NOMBRE", x.NOMBRE);
                SetAttr(row, "EDAD", x.EDAD);
                SetAttr(row, "SEXO", x.SEXO);
                SetAttr(row, "FECHA_NACIMIENTO", x.FECHA_NACIMIENTO);
            });
        }

        private static string ToEstudiosXml(IEnumerable<SC_PERSONA_ESTUDIOTable> items)
        {
            return BuildRowsXml(items, (row, x) =>
            {
                SetAttr(row, "NIVEL", x.NIVEL);
                SetAttr(row, "INSTITUCION", x.INSTITUCION);
                SetAttr(row, "DESDE", x.DESDE);
                SetAttr(row, "HASTA", x.HASTA);
                SetAttr(row, "TITULO", x.TITULO);
            });
        }

        private static string ToIdiomasXml(IEnumerable<SC_PERSONA_IDIOMASTable> items)
        {
            return BuildRowsXml(items, (row, x) =>
            {
                SetAttr(row, "IDIOMA", x.IDIOMA);
                SetAttr(row, "NIVEL", x.NIVEL);
            });
        }

        private static string ToCompetenciasXml(IEnumerable<SC_PERSONA_COMPETENCIAS_TECNICASTable> items)
        {
            return BuildRowsXml(items, (row, x) =>
            {
                SetAttr(row, "HERRAMIENTA", x.HERRAMIENTA);
                SetAttr(row, "NIVEL", x.NIVEL);
            });
        }

        private static string ToExperienciasXml(IEnumerable<SC_PERSONA_EXPERIENCIA_LABORALTable> items)
        {
            return BuildRowsXml(items, (row, x) =>
            {
                SetAttr(row, "EMPRESA", x.EMPRESA);
                SetAttr(row, "TELEFONO", x.TELEFONO);
                SetAttr(row, "CARGO", x.CARGO);
                SetAttr(row, "JEFE_INMEDIATO", x.JEFE_INMEDIATO);
                SetAttr(row, "FECHA_INICIO", x.FECHA_INICIO);
                SetAttr(row, "FECHA_FIN", x.FECHA_FIN);
                SetAttr(row, "SALARIO_INICIAL", x.SALARIO_INICIAL);
                SetAttr(row, "SALARIO_FINAL", x.SALARIO_FINAL);
                SetAttr(row, "MOTIVO_SALIDA", x.MOTIVO_SALIDA);
            });
        }

        private static string ToFamiliaresUeesXml(IEnumerable<SC_PERSONA_FAMILIAR_UEESTable> items)
        {
            return BuildRowsXml(items, (row, x) =>
            {
                SetAttr(row, "NOMBRE", x.NOMBRE);
                SetAttr(row, "PARENTESCO", x.PARENTESCO);
                SetAttr(row, "UNIDAD", x.UNIDAD);
                SetAttr(row, "TELEFONO", x.TELEFONO);
            });
        }

        private static string BuildRowsXml<T>(IEnumerable<T> items, Action<XElement, T> map)
        {
            var root = new XElement("rows");
            foreach (var item in items ?? Enumerable.Empty<T>())
            {
                if (item == null)
                {
                    continue;
                }

                var row = new XElement("row");
                map(row, item);
                if (row.HasAttributes)
                {
                    root.Add(row);
                }
            }

            return root.ToString(SaveOptions.DisableFormatting);
        }

        private static void SetAttr(XElement row, string name, string value)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                row.SetAttributeValue(name, value.Trim());
            }
        }

        private static void SetAttr(XElement row, string name, int? value)
        {
            if (value.HasValue)
            {
                row.SetAttributeValue(name, value.Value.ToString(CultureInfo.InvariantCulture));
            }
        }

        private static void SetAttr(XElement row, string name, decimal? value)
        {
            if (value.HasValue)
            {
                row.SetAttributeValue(name, value.Value.ToString(CultureInfo.InvariantCulture));
            }
        }

        private static void SetAttr(XElement row, string name, DateTime? value)
        {
            if (value.HasValue)
            {
                row.SetAttributeValue(name, value.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
            }
        }

        private static void SetError(CResult resultado, Exception error)
        {
            resultado.Data = null;
            resultado.Result = false;
            resultado.RowsAffected = 0;
            resultado.CodeHelper = 0;
            resultado.ErrorCode = -1;
            resultado.ErrorMessage = error.Message;
            resultado.ErrorSource = error.Source ?? "";
        }
    }
}
