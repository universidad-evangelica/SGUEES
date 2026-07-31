using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class SC_PERSONA_DATOSRepository : BaseRepository<SC_PERSONA_DATOSTable>, ISC_PERSONA_DATOSRepository
	{
		private const string _TableName = "SC_PERSONA_DATOS";

		public SC_PERSONA_DATOSRepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SC_PERSONA_DATOSView>().FromDataReader(reader).ToList();

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
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SC_PERSONA_DATOSView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
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
				objResultado.ErrorSource = $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CreateAsync(SC_PERSONA_DATOSTable Data, string vUSERNAME_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
				};
				p.AddRange(BuildWriteParameters(Data));

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_PERSONA_DATOS", pWhere);
				var response = new List<SC_PERSONA_DATOSView>().FromDataReader(reader).FirstOrDefault();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_PERSONA_DATOS ?? 0;
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

		public async Task<CResult> UpdateAsync(SC_PERSONA_DATOSTable Data, string vUSERNAME_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildWriteParameters(Data);

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_PERSONA_DATOSView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_PERSONA_DATOS ?? 0;
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

		public async Task<CResult> DeleteAsync(SC_PERSONA_DATOSTable Data, string vUSERNAME_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_PERSONA_DATOS;
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

		private static List<CParameter> BuildWriteParameters(SC_PERSONA_DATOSTable Data)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "NOMBRE1", Value = ToDbValue(Data.NOMBRE1), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "NOMBRE2", Value = ToDbValue(Data.NOMBRE2), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "APELLIDO1", Value = ToDbValue(Data.APELLIDO1), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "APELLIDO2", Value = ToDbValue(Data.APELLIDO2), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_NACIMIENTO", Value = Data.FECHA_NACIMIENTO, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "EDAD", Value = Data.EDAD, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ESTADO_CIVIL", Value = ToDbValue(Data.ESTADO_CIVIL), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "NACIONALIDAD", Value = ToDbValue(Data.NACIONALIDAD), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CORREO", Value = ToDbValue(Data.CORREO), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CELULAR", Value = ToDbValue(Data.CELULAR), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "TELEFONO", Value = ToDbValue(Data.TELEFONO), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "DIRECCION", Value = ToDbValue(Data.DIRECCION), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "DUI", Value = ToDbValue(Data.DUI), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "PASAPORTE", Value = ToDbValue(Data.PASAPORTE), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ISSS", Value = ToDbValue(Data.ISSS), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "AFP", Value = ToDbValue(Data.AFP), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "NOMBRE_AFP", Value = ToDbValue(Data.NOMBRE_AFP), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "LICENCIA", Value = ToDbValue(Data.LICENCIA), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "PLAZA_SOLICITADA", Value = ToDbValue(Data.PLAZA_SOLICITADA), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "PRETENSION_SALARIAL", Value = Data.PRETENSION_SALARIAL, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "DISPONIBILIDAD", Value = ToDbValue(Data.DISPONIBILIDAD), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "RELIGION", Value = ToDbValue(Data.RELIGION), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "IGLESIA", Value = ToDbValue(Data.IGLESIA), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "DIRECCION_IGLESIA", Value = ToDbValue(Data.DIRECCION_IGLESIA), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ES_CONTRIBUYENTE_CCF", Value = Data.ES_CONTRIBUYENTE_CCF, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "ES_JUBILADO", Value = Data.ES_JUBILADO, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "POSEE_DISCAPACIDAD", Value = Data.POSEE_DISCAPACIDAD, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "TIPO_DISCAPACIDAD", Value = ToDbValue(Data.TIPO_DISCAPACIDAD), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "EMERGENCIA_NOMBRE", Value = ToDbValue(Data.EMERGENCIA_NOMBRE), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "EMERGENCIA_PARENTESCO", Value = ToDbValue(Data.EMERGENCIA_PARENTESCO), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "EMERGENCIA_TELEFONO", Value = ToDbValue(Data.EMERGENCIA_TELEFONO), DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "TIENE_FAMILIARES_UEES", Value = Data.TIENE_FAMILIARES_UEES, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "DECLARA_VERDAD", Value = Data.DECLARA_VERDAD, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "AUTORIZA_VERIFICACION", Value = Data.AUTORIZA_VERIFICACION, DbType = System.Data.DbType.Boolean },
				new CParameter() { ParameterName = "FECHA_DECLARACION", Value = Data.FECHA_DECLARACION, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "FIRMA_ELECTRONICA", Value = ToDbValue(Data.FIRMA_ELECTRONICA), DbType = System.Data.DbType.String },
			};
		}

		private static object ToDbValue(string value)
		{
			return string.IsNullOrWhiteSpace(value) ? System.DBNull.Value : value;
		}
	}
}
