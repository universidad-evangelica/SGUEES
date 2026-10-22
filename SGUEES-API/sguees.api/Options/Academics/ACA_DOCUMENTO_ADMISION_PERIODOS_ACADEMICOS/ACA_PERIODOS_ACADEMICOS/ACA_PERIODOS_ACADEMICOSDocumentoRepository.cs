// Qué hace: lee los períodos académicos de la empresa para el popup de documentos.
// Cómo: consulta V_ACA_PERIODOS_MTTO y los ordena por año, número y sede.
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
	public class ACA_PERIODOS_ACADEMICOSDocumentoRepository
		: BaseRepository<ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable>, IACA_PERIODOS_ACADEMICOSDocumentoRepository
	{
		private const string _ViewPeriodos = "V_ACA_PERIODOS_MTTO";

		public ACA_PERIODOS_ACADEMICOSDocumentoRepository(IConfiguration config)
			: base(config.GetConnectionString("defaultConnection"), config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: lista los períodos de la empresa.
		// Cómo: filtra la vista por CORR_EMPRESA.
		public async Task<CResult> GetPeriodosAsync(List<CParameter> xWhere)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewPeriodos, xWhere);
				var response = new List<ACA_PERIODO_ACADEMICO_DOCUMENTOItem>().FromDataReader(reader)
					.OrderByDescending(x => x.ANIO)
					.ThenBy(x => x.NUMERO_PERIODO)
					.ThenBy(x => x.NOMBRE_SEDE)
					.ToList();
				reader.Close();
				result.Data = response;
				result.Result = true;
				result.RowsAffected = response.Count;
				result.ErrorCode = 0;
				result.ErrorMessage = string.Empty;
				result.ErrorSource = string.Empty;
			}
			catch (Exception e)
			{
				result.Result = false;
				result.Data = null;
				result.ErrorCode = 1000;
				result.ErrorMessage = e.Message;
				result.ErrorSource = e.Source;
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}
	}
}
