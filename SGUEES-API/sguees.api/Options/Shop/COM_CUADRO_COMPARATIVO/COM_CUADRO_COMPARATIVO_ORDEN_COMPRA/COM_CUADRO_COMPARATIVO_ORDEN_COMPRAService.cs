using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class COM_CUADRO_COMPARATIVO_ORDEN_COMPRAService: ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRAService
	{
		private readonly ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository _repo;
		private readonly ICOM_REPORepository _repoRepo;
		private readonly ISEG_USUARIOService _repoUser;
		
		public COM_CUADRO_COMPARATIVO_ORDEN_COMPRAService(ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository repo,
			ICOM_REPORepository repoRepo,
			ISEG_USUARIOService repoUser)
		{
			_repo = repo;
			_repoRepo = repoRepo;
			_repoUser = repoUser;
		}
		
		public async Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="NUMERO_ORDEN",Value=xWhere.NUMERO_ORDEN,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PROVEEDOR",Value=xWhere.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		public async Task<Stream> GetPDFAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam xWhere)
		{
			
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="NUMERO_ORDEN",Value=xWhere.NUMERO_ORDEN,DbType=System.Data.DbType.Int32},
			};

				var vRespuestaCuadroComparativoData = await _repo.GetComCuadroComparativoOrdenImpr(p);

				if (vRespuestaCuadroComparativoData.Result)
				{
					return await _repoRepo.GetComCuadroComparativoOrdenCompraImprAsync((List<COM_ORDEN_COMPRA_IMPRView>)vRespuestaCuadroComparativoData.Data, _repoUser.GenerateRptToken("Admin"));
				}

			return null;
		}
	}
}
