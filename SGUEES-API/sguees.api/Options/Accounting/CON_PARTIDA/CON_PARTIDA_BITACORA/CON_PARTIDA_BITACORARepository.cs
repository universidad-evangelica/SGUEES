using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	// Qué hace: consulta la bitácora de partidas contables.
	// Cómo lo hace: lee V_CON_PARTIDA_BITACORA filtrada por la llave de la partida.
	public class CON_PARTIDA_BITACORARepository : BaseRepository<CON_PARTIDA_BITACORATable>, ICON_PARTIDA_BITACORARepository
	{
		private const string _TableName = "CON_PARTIDA_BITACORA";

		public CON_PARTIDA_BITACORARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_PARTIDA_BITACORAView>().FromDataReader(reader).ToList();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true;
				objResultado.RowsAffected = response.Count; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_PARTIDA_BITACORAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}
	}
}
