using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public class ACA_PROSPECTO_CONTACTORepository : BaseRepository<ACA_PROSPECTO_CONTACTOTable>, IACA_PROSPECTO_CONTACTORepository
    {
        private const string _TableName = "ACA_PROSPECTO_CONTACTO";
        private const string _ViewName = "V_ACA_PROSPECTO_CONTACTO";

        public ACA_PROSPECTO_CONTACTORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: correos y teléfonos del prospecto.
        // Cómo lo hace: lee V_ACA_PROSPECTO_CONTACTO ordenado por ES_PRINCIPAL DESC, ES_CORREO DESC, CORR_PROSPECTO_CONTACTO.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "ES_PRINCIPAL DESC, ES_CORREO DESC, CORR_PROSPECTO_CONTACTO");
                var response = new List<ACA_PROSPECTO_CONTACTOView>().FromDataReader(reader).ToList();

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
            catch (System.Exception e)
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

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<ACA_PROSPECTO_CONTACTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
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

        // Qué hace: códigos telefónicos de país, leídos del mismo SP que usa el registro del portal.
        // Cómo lo hace: NI_LIST_CATALOGS @Option = 21 devuelve CatalogId, CatalogCode y CatalogName
        //               ("+503 El Salvador") ya ordenados por nombre de país. Mientras el código no
        //               exista en GEN_PAIS, esta es la única fuente y se lee tal cual, sin copiarla.
        public async Task<CResult> GetCODIGO_PAISAsync()
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="@Option",Value=21,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="@Parameter1",Value="",DbType=System.Data.DbType.String},
                };

                var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, "NI_LIST_CATALOGS", p);
                var response = new List<ACA_PROSPECTO_CONTACTO_CODIGO_PAISView>().FromDataReader(reader).ToList();

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
            catch (System.Exception e)
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

        // Qué hace: agrega un contacto del prospecto.
        // Cómo lo hace: CORR_PROSPECTO_CONTACTO es IDENTITY, así que inserta con ExecCmd (objData.Insert
        //               calcula MAX+1 y no aplica). Si es el primero de su tipo queda como principal; si
        //               viene marcado como principal, se lo quita a los demás del mismo tipo. El portal
        //               muestra en el perfil y usa en el token el principal de cada tipo.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var mismoTipo = await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA, Data.ES_CORREO);
                if (mismoTipo.Count == 0)
                {
                    Data.ES_PRINCIPAL = true;
                }

                await objData.ExecCmd(System.Data.CommandType.Text, _SqlInsertContacto, true, ParametrosContacto(Data, true));

                var creado = (await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA, Data.ES_CORREO))
                    .OrderByDescending(c => c.CORR_PROSPECTO_CONTACTO)
                    .FirstOrDefault();

                if (Data.ES_PRINCIPAL && creado != null)
                {
                    await QuitarPrincipalAsync(Data.CORR_PROSPECTO_PERSONA, Data.ES_CORREO, creado.CORR_PROSPECTO_CONTACTO, Data.USUARIO_CREA, Data.ESTACION_CREA);
                }

                objResultado.Data = creado;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = creado?.CORR_PROSPECTO_CONTACTO ?? 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
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

        // Qué hace: actualiza un contacto del prospecto, incluido su tipo (un error de captura no
        //           puede dejar al usuario atrapado).
        // Cómo lo hace: siempre queda un principal por tipo. Si esta fila es la única de su tipo, es
        //               principal. Si cambia de tipo y era la principal del anterior, el más antiguo
        //               del tipo anterior hereda la marca. Si no cambia de tipo, la principal no puede
        //               desmarcarse por aquí (se cambia marcando a otra). Si pasa a principal, se lo
        //               quita a las demás de su tipo.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var actual = await LeerPorLlaveAsync(Data.CORR_PROSPECTO_CONTACTO);
                if (actual == null)
                    throw new System.Exception("El contacto ya no existe.");

                bool cambiaTipo = actual.ES_CORREO != Data.ES_CORREO;
                var otrosDelNuevoTipo = (await LeerPorPersonaAsync(actual.CORR_PROSPECTO_PERSONA, Data.ES_CORREO))
                    .Where(c => c.CORR_PROSPECTO_CONTACTO != Data.CORR_PROSPECTO_CONTACTO)
                    .ToList();

                if (otrosDelNuevoTipo.Count == 0)
                {
                    Data.ES_PRINCIPAL = true;
                }
                else if (!cambiaTipo && actual.ES_PRINCIPAL && !Data.ES_PRINCIPAL)
                {
                    throw new System.Exception("Este es el contacto principal de su tipo: para cambiarlo, marque otro como principal.");
                }

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_CONTACTO",Value=Data.CORR_PROSPECTO_CONTACTO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, ParametrosContacto(Data, false), pWhere);
                var response = new List<ACA_PROSPECTO_CONTACTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;
                objData.objConnection.Close();

                if (Data.ES_PRINCIPAL)
                {
                    await QuitarPrincipalAsync(actual.CORR_PROSPECTO_PERSONA, Data.ES_CORREO, Data.CORR_PROSPECTO_CONTACTO, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
                }

                if (cambiaTipo && actual.ES_PRINCIPAL)
                {
                    // El tipo anterior se quedó sin principal: hereda el más antiguo que quede.
                    var heredero = (await LeerPorPersonaAsync(actual.CORR_PROSPECTO_PERSONA, actual.ES_CORREO))
                        .OrderBy(c => c.CORR_PROSPECTO_CONTACTO)
                        .FirstOrDefault();
                    if (heredero != null)
                    {
                        await MarcarPrincipalAsync(heredero.CORR_PROSPECTO_CONTACTO, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
                    }
                }

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_CONTACTO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
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

        // Qué hace: elimina un contacto del prospecto.
        // Cómo lo hace: el último correo o teléfono no se elimina (el portal los usa en el perfil y en
        //               el token). Si se elimina un principal y quedan otros de su tipo, el más antiguo
        //               hereda la marca: nunca queda un tipo sin principal.
        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var actual = await LeerPorLlaveAsync(Data.CORR_PROSPECTO_CONTACTO);
                ACA_PROSPECTO_CONTACTOView heredero = null;
                if (actual != null)
                {
                    var otros = (await LeerPorPersonaAsync(actual.CORR_PROSPECTO_PERSONA, actual.ES_CORREO))
                        .Where(c => c.CORR_PROSPECTO_CONTACTO != actual.CORR_PROSPECTO_CONTACTO)
                        .OrderBy(c => c.CORR_PROSPECTO_CONTACTO)
                        .ToList();
                    if (otros.Count == 0)
                        throw new System.Exception(actual.ES_CORREO
                            ? "Es el único correo del prospecto: agregue otro antes de eliminarlo."
                            : "Es el único teléfono del prospecto: agregue otro antes de eliminarlo.");
                    if (actual.ES_PRINCIPAL)
                        heredero = otros.First();
                }

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_CONTACTO",Value=Data.CORR_PROSPECTO_CONTACTO,DbType=System.Data.DbType.Int32},
                };

                await objData.Delete(_TableName, pWhere);

                if (heredero != null)
                {
                    await MarcarPrincipalAsync(heredero.CORR_PROSPECTO_CONTACTO, vLOGIN_SISTEMA, vESTACION);
                }

                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_CONTACTO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
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

        // Qué hace: contactos de una persona de un tipo (correos o teléfonos), leídos de la vista.
        private async Task<List<ACA_PROSPECTO_CONTACTOView>> LeerPorPersonaAsync(int corrPersona, bool esCorreo)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var filas = new List<ACA_PROSPECTO_CONTACTOView>().FromDataReader(reader).Where(c => c.ES_CORREO == esCorreo).ToList();
            reader.Close();
            objData.objConnection.Close();

            return filas;
        }

        private async Task<ACA_PROSPECTO_CONTACTOView> LeerPorLlaveAsync(int corrContacto)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_CONTACTO",Value=corrContacto,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var fila = new List<ACA_PROSPECTO_CONTACTOView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            return fila;
        }

        // Qué hace: deja un único principal por tipo (teléfono o correo) para la persona.
        private async Task QuitarPrincipalAsync(int corrPersona, bool esCorreo, int corrContacto, string usuario, string estacion)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="ES_CORREO",Value=esCorreo,DbType=System.Data.DbType.Boolean},
                new CParameter() {ParameterName="CORR_PROSPECTO_CONTACTO",Value=corrContacto,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="USUARIO_ACTU",Value=usuario ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="ESTACION_ACTU",Value=estacion ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="FECHA_ACTU",Value=DateTime.Now,DbType=System.Data.DbType.DateTime},
            };

            await objData.ExecCmd(System.Data.CommandType.Text, _SqlQuitarPrincipal, true, p);
            objData.objConnection.Close();
        }

        // Qué hace: deja como principal el contacto indicado (herencia al cambiar de tipo o eliminar).
        private async Task MarcarPrincipalAsync(int corrContacto, string usuario, string estacion)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="ES_PRINCIPAL",Value=true,DbType=System.Data.DbType.Boolean},
                new CParameter() {ParameterName="USUARIO_ACTU",Value=usuario ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="ESTACION_ACTU",Value=estacion ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="FECHA_ACTU",Value=DateTime.Now,DbType=System.Data.DbType.DateTime},
            };
            var pWhere = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_CONTACTO",Value=corrContacto,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.Update(_TableName, p, pWhere);
            reader.Close();
            objData.objConnection.Close();
        }

        // Qué hace: columnas del contacto para insertar o actualizar (el tipo también se actualiza).
        private static List<CParameter> ParametrosContacto(ACA_PROSPECTO_CONTACTOTable Data, bool esAlta)
        {
            var p = new List<CParameter>();

            if (esAlta)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PROSPECTO_PERSONA", Value = Data.CORR_PROSPECTO_PERSONA, DbType = System.Data.DbType.Int32 });
            }

            p.Add(new CParameter() { ParameterName = "ES_TELEFONO", Value = Data.ES_TELEFONO, DbType = System.Data.DbType.Boolean });
            p.Add(new CParameter() { ParameterName = "ES_CORREO", Value = Data.ES_CORREO, DbType = System.Data.DbType.Boolean });
            p.Add(new CParameter() { ParameterName = "CONTACTO", Value = Data.CONTACTO, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "ES_PRINCIPAL", Value = Data.ES_PRINCIPAL, DbType = System.Data.DbType.Boolean });
            p.Add(new CParameter() { ParameterName = "ES_TRABAJO", Value = Data.ES_TRABAJO, DbType = System.Data.DbType.Boolean });

            if (esAlta)
            {
                p.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA ?? "", DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA ?? "", DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
            }
            else
            {
                p.Add(new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
            }

            return p;
        }

        private const string _SqlInsertContacto =
            "INSERT INTO ACA_PROSPECTO_CONTACTO (CORR_PROSPECTO_PERSONA, CONTACTO, ES_PRINCIPAL, ES_TRABAJO, ES_TELEFONO, ES_CORREO, " +
            "USUARIO_CREA, ESTACION_CREA, FECHA_CREA) " +
            "VALUES (@CORR_PROSPECTO_PERSONA, @CONTACTO, @ES_PRINCIPAL, @ES_TRABAJO, @ES_TELEFONO, @ES_CORREO, " +
            "@USUARIO_CREA, @ESTACION_CREA, @FECHA_CREA)";

        private const string _SqlQuitarPrincipal =
            "UPDATE ACA_PROSPECTO_CONTACTO SET ES_PRINCIPAL = 0, USUARIO_ACTU = @USUARIO_ACTU, ESTACION_ACTU = @ESTACION_ACTU, FECHA_ACTU = @FECHA_ACTU " +
            "WHERE CORR_PROSPECTO_PERSONA = @CORR_PROSPECTO_PERSONA AND ES_CORREO = @ES_CORREO " +
            "AND CORR_PROSPECTO_CONTACTO <> @CORR_PROSPECTO_CONTACTO AND ES_PRINCIPAL = 1";
    }
}
