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
    public class ACA_PROSPECTO_ESTUDIORepository : BaseRepository<ACA_PROSPECTO_ESTUDIOTable>, IACA_PROSPECTO_ESTUDIORepository
    {
        private const string _TableName = "ACA_PROSPECTO_ESTUDIO";
        private const string _ViewName = "V_ACA_PROSPECTO_ESTUDIO";

        public ACA_PROSPECTO_ESTUDIORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: estudios previos del prospecto.
        // Cómo lo hace: lee V_ACA_PROSPECTO_ESTUDIO ordenado por ORDEN_SECCION, CORR_PROSPECTO_ESTUDIO.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "ORDEN_SECCION, CORR_PROSPECTO_ESTUDIO");
                var response = new List<ACA_PROSPECTO_ESTUDIOView>().FromDataReader(reader).ToList();

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
                var response = new List<ACA_PROSPECTO_ESTUDIOView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: crea un estudio del prospecto.
        // Cómo lo hace: CORR_PROSPECTO_ESTUDIO es IDENTITY, así que inserta con ExecCmd (objData.Insert
        //               calcula MAX+1 y no aplica). Antes verifica que la sección esté libre, porque la
        //               tabla tiene un índice único por persona + nivel + graduado UEES, y en el bloque
        //               de graduado UEES toma el grado académico de la carrera elegida.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var existente = await BuscarSeccionAsync(Data.CORR_PROSPECTO_PERSONA, Data.NIVEL_ESTUDIO, Data.GRADUADO_UEES);
                if (existente != null)
                    throw new System.Exception($"El prospecto ya tiene registrado el estudio de {existente.SECCION_TEXTO}; modifíquelo en lugar de crear otro.");

                if (Data.GRADUADO_UEES)
                    Data.CORR_GRADO_ACADEMICO = await GradoDeCarreraAsync(Data.CORR_CARRERA);

                await objData.ExecCmd(System.Data.CommandType.Text, _SqlInsertEstudio, true, ParametrosEstudio(Data, true));

                var response = await BuscarSeccionAsync(Data.CORR_PROSPECTO_PERSONA, Data.NIVEL_ESTUDIO, Data.GRADUADO_UEES);

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_PROSPECTO_ESTUDIO ?? 0;
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

        // Qué hace: actualiza un estudio del prospecto y relee la fila de la vista.
        // Cómo lo hace: objData.Update por CORR_PROSPECTO_ESTUDIO; en graduado UEES vuelve a derivar el
        //               grado académico de la carrera, por si la cambiaron.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                if (Data.GRADUADO_UEES)
                    Data.CORR_GRADO_ACADEMICO = await GradoDeCarreraAsync(Data.CORR_CARRERA);

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_ESTUDIO",Value=Data.CORR_PROSPECTO_ESTUDIO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, ParametrosEstudio(Data, false), pWhere);
                var response = new List<ACA_PROSPECTO_ESTUDIOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_ESTUDIO;
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

        // Qué hace: elimina un estudio del prospecto (al apagar el interruptor de su sección).
        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_ESTUDIO",Value=Data.CORR_PROSPECTO_ESTUDIO,DbType=System.Data.DbType.Int32},
                };

                await objData.Delete(_TableName, pWhere);

                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_ESTUDIO;
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

        // Qué hace: devuelve el estudio de una sección (media, universitarios o graduado UEES).
        // Cómo lo hace: la vista ya clasifica la sección; aquí se filtra por persona y se elige la fila
        //               que coincide con el nivel y la bandera de graduado UEES.
        private async Task<ACA_PROSPECTO_ESTUDIOView> BuscarSeccionAsync(int corrPersona, string nivel, bool graduadoUees)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var filas = new List<ACA_PROSPECTO_ESTUDIOView>().FromDataReader(reader).ToList();
            reader.Close();
            objData.objConnection.Close();

            return filas.FirstOrDefault(e => e.NIVEL_ESTUDIO == nivel && e.GRADUADO_UEES == graduadoUees);
        }

        // Qué hace: grado académico de una carrera UEES (el portal lo deriva igual).
        private async Task<int?> GradoDeCarreraAsync(int? corrCarrera)
        {
            if (!(corrCarrera > 0)) return null;

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_CARRERA",Value=corrCarrera,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader("ACA_CARRERAS", p);
            var carrera = new List<ACA_CARRERASView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            return carrera?.CORR_GRADO_ACADEMICO;
        }

        // Qué hace: columnas del estudio para insertar o actualizar.
        // Cómo lo hace: en el alta agrega persona y auditoría de creación; en la modificación, la de cambio.
        private static List<CParameter> ParametrosEstudio(ACA_PROSPECTO_ESTUDIOTable Data, bool esAlta)
        {
            var p = new List<CParameter>();

            if (esAlta)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PROSPECTO_PERSONA", Value = Data.CORR_PROSPECTO_PERSONA, DbType = System.Data.DbType.Int32 });
                p.Add(new CParameter() { ParameterName = "NIVEL_ESTUDIO", Value = Data.NIVEL_ESTUDIO, DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "GRADUADO_UEES", Value = Data.GRADUADO_UEES, DbType = System.Data.DbType.Boolean });
            }

            p.Add(new CParameter() { ParameterName = "NOMBRE_INSTITUCION", Value = Data.NOMBRE_INSTITUCION ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "TIPO_EDUCACION", Value = Data.TIPO_EDUCACION ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "TITULO_OBTENIDO", Value = Data.TITULO_OBTENIDO ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "CARRERA_TEXTO", Value = Data.CARRERA_TEXTO ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "NIVEL_CURSADO", Value = Data.NIVEL_CURSADO ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "CORR_CARRERA", Value = Data.CORR_CARRERA ?? (object)DBNull.Value, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "CORR_GRADO_ACADEMICO", Value = Data.CORR_GRADO_ACADEMICO ?? (object)DBNull.Value, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "ANIO_TITULACION", Value = Data.ANIO_TITULACION ?? (object)DBNull.Value, DbType = System.Data.DbType.Int16 });
            p.Add(new CParameter() { ParameterName = "FECHA_GRADUACION", Value = Data.FECHA_GRADUACION ?? (object)DBNull.Value, DbType = System.Data.DbType.Date });
            p.Add(new CParameter() { ParameterName = "CUOTA", Value = Data.CUOTA ?? (object)DBNull.Value, DbType = System.Data.DbType.Decimal });
            p.Add(new CParameter() { ParameterName = "QUIEN_PAGO_CUOTA", Value = Data.QUIEN_PAGO_CUOTA ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "CORR_PAIS", Value = Data.CORR_PAIS ?? (object)DBNull.Value, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "CORR_DEPTO", Value = Data.CORR_DEPTO ?? (object)DBNull.Value, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = Data.CORR_MUNICIPIO ?? (object)DBNull.Value, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "GRADUADO", Value = Data.GRADUADO, DbType = System.Data.DbType.Boolean });

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

        private const string _SqlInsertEstudio =
            "INSERT INTO ACA_PROSPECTO_ESTUDIO (CORR_PROSPECTO_PERSONA, NIVEL_ESTUDIO, GRADUADO_UEES, NOMBRE_INSTITUCION, TIPO_EDUCACION, " +
            "TITULO_OBTENIDO, CARRERA_TEXTO, NIVEL_CURSADO, CORR_CARRERA, CORR_GRADO_ACADEMICO, ANIO_TITULACION, FECHA_GRADUACION, CUOTA, " +
            "QUIEN_PAGO_CUOTA, CORR_PAIS, CORR_DEPTO, CORR_MUNICIPIO, GRADUADO, USUARIO_CREA, ESTACION_CREA, FECHA_CREA) " +
            "VALUES (@CORR_PROSPECTO_PERSONA, @NIVEL_ESTUDIO, @GRADUADO_UEES, @NOMBRE_INSTITUCION, @TIPO_EDUCACION, " +
            "@TITULO_OBTENIDO, @CARRERA_TEXTO, @NIVEL_CURSADO, @CORR_CARRERA, @CORR_GRADO_ACADEMICO, @ANIO_TITULACION, @FECHA_GRADUACION, @CUOTA, " +
            "@QUIEN_PAGO_CUOTA, @CORR_PAIS, @CORR_DEPTO, @CORR_MUNICIPIO, @GRADUADO, @USUARIO_CREA, @ESTACION_CREA, @FECHA_CREA)";
    }
}
