using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class SEG_MENU_SISTEMARepository : BaseRepository<SEG_MENU_SISTEMATable>, ISEG_MENU_SISTEMARepository
	{
		private const string _TableName = "SEG_MENU_SISTEMA";

		public SEG_MENU_SISTEMARepository(IConfiguration config) :
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
				var response = new List<SEG_MENU_SISTEMAView>().FromDataReader(reader).ToList();

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
				var response = new List<SEG_MENU_SISTEMAView>().FromDataReader(reader).FirstOrDefault();

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

		public Task<CResult> CreateAsync(SEG_MENU_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return Task.FromResult(OperacionNoSoportada());
		}

		public Task<CResult> UpdateAsync(SEG_MENU_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return Task.FromResult(OperacionNoSoportada());
		}

		public Task<CResult> DeleteAsync(SEG_MENU_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return Task.FromResult(OperacionNoSoportada());
		}

		private static CResult OperacionNoSoportada()
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = -1,
				ErrorMessage = "Operación no soportada para SEG_MENU_SISTEMA.",
				ErrorSource = "[SEG_MENU_SISTEMARepository]",
				RowsAffected = 0
			};
		}
	}
}
