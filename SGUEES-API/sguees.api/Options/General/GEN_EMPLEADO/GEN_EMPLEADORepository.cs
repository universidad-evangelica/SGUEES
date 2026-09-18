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
	// Qué hace: acceso a datos de empleados vía V_GEN_EMPLEADO.
	// Cómo lo hace: GetAll/Get contra la vista; Create/Update/Delete quedan bloqueados (fase browse).
	public class GEN_EMPLEADORepository : BaseRepository<GEN_EMPLEADOTable>, IGEN_EMPLEADORepository
	{
		private const string _ViewName = "V_GEN_EMPLEADO";

		public GEN_EMPLEADORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		// Qué hace: lista filas de la vista según filtros.
		// Cómo lo hace: GetDataReader sobre V_GEN_EMPLEADO y mapea a GEN_EMPLEADOView.
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

		// Qué hace: obtiene un empleado.
		// Cómo lo hace: misma vista, FirstOrDefault del reader.
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
				objResultado.RowsAffected = response != null ? 1 : 0;
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
			ErrorMessage = $"GEN_EMPLEADO es solo lectura en esta fase; {operation} no está soportado.",
			ErrorSource = "[GEN_EMPLEADORepository]",
		};
	}
}
