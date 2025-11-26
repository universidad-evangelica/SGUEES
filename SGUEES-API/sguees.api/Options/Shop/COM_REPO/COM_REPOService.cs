using System.Text.Json;
using scuees.Models;
using scuees.Repositories;
using eFramework.Core;

namespace scuees.Services
{
    public class COM_REPOService: ICOM_REPOService
    {
        // private readonly ICOM_DOCUMENTORepository _repo;
        private readonly ICOM_REPORepository _repoRepo;
        private readonly ISEG_USUARIOService _repoUser;
		private readonly ICOM_COTIZACIONRepository _repoCotizacion;

        public COM_REPOService(
						// ICOM_DOCUMENTORepository repo,
            ICOM_REPORepository repoRepo,
            ISEG_USUARIOService repoUser,
			ICOM_COTIZACIONRepository repoCotizacion
			)
		{
				// _repo = repo;
			_repoRepo = repoRepo;
			_repoUser = repoUser;
			_repoCotizacion = repoCotizacion;
		}

		// public async Task<Stream> GetRepoSujetoExcluidoAsync(COM_DOCUMENTOParam xWhere)
		// {
		// 	Stream vPDF = null;
		// 	string vPeriodo = "Del "+xWhere.FECHA_INICIAL.ToString("dd/MM/yyyy") + " Al "+xWhere.FECHA_FINAL.ToString("dd/MM/yyyy");
		
		// 	var p = new List<CParameter>
		// 	{
		// 		new() {ParameterName="PERIODO",Value=vPeriodo,DbType=System.Data.DbType.String},
		// 		new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 		new() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.Date},
		// 		new() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.Date},
		// 		new() {ParameterName="ESTADO_DOCUMENTO",Value=xWhere.ESTADO_DOCUMENTO,DbType=System.Data.DbType.String},
		// 	};

		// 	var vRespuestaData = await _repo.GetRepoSujetoExcluidoAsync(p);

		// 	if (vRespuestaData.Result) {
		// 		return await _repoRepo.GetRepoSujetoExcluidoStreamAsync((List<COM_REPO_SUJETO_EXCLUIDOView>)vRespuestaData.Data, _repoUser.GenerateRptToken("Admin"));		
		// 	}

		// 	return vPDF;
		// }
		
		// public async Task<CResult> GetComConsultaSujetoExcluidoAsync(COM_DOCUMENTOParam xWhere)
		// {
		// 	string vPeriodo = "Del "+xWhere.FECHA_INICIAL.ToString("dd/MM/yyyy") + " Al "+xWhere.FECHA_FINAL.ToString("dd/MM/yyyy");
		
		// 	var p = new List<CParameter>
		// 	{
		// 		new() {ParameterName="PERIODO",Value=vPeriodo,DbType=System.Data.DbType.String},
		// 		new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
		// 		new() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.Date},
		// 		new() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.Date},
		// 		new() {ParameterName="ESTADO_DOCUMENTO",Value=xWhere.ESTADO_DOCUMENTO,DbType=System.Data.DbType.String},
		// 	};

		// 	return await _repo.GetRepoSujetoExcluidoAsync(p);
		// }
		public async Task<CResult> GetComCotizacionRepo(COM_COTIZACIONParam xWhere)
		{
			string vPeriodo = "Del "+xWhere.FECHA_INICIAL.ToString("dd/MM/yyyy") + " Al "+xWhere.FECHA_FINAL.ToString("dd/MM/yyyy");
		
			var p = new List<CParameter>
			{
				new() {ParameterName="TIPO_CONSULTA",Value=QueryType.AllRowsAllColumns,DbType=System.Data.DbType.Int32},
				new() {ParameterName="PERIODO",Value=vPeriodo,DbType=System.Data.DbType.String},
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.Date},
				new() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.Date},
				new() {ParameterName="OPCION_CONSULTA",Value=1,DbType=System.Data.DbType.Int32},
			};

			return await _repoCotizacion.GetComCotizacionRepoAsync(p);
		}
  }
}
