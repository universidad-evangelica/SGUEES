using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_EMPLEADORepository : BaseRepository<GEN_EMPLEADOTable>, IGEN_EMPLEADORepository
	{
		private const string _ViewName = "V_GEN_EMPLEADO";

		public GEN_EMPLEADORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<GEN_EMPLEADOView>().FromDataReader(reader).ToList();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
			}
			catch (Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
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
				var response = new List<GEN_EMPLEADOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
			}
			catch (Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public Task<CResult> CreateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> Task.FromResult(ReadOnlyError(nameof(CreateAsync)));

		public Task<CResult> UpdateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> Task.FromResult(ReadOnlyError(nameof(UpdateAsync)));

		public Task<CResult> DeleteAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> Task.FromResult(ReadOnlyError(nameof(DeleteAsync)));

		private static CResult ReadOnlyError(string operation) => new()
		{
			Result = false,
			ErrorCode = 4050,
			ErrorMessage = $"GEN_EMPLEADO es un catálogo de solo lectura; {operation} no está soportado.",
			ErrorSource = "[GEN_EMPLEADORepository]",
		};
	}
}
