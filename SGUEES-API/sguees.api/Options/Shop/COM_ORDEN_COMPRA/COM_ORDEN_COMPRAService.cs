using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_ORDEN_COMPRAService: ICOM_ORDEN_COMPRAService
	{
		private readonly ICOM_ORDEN_COMPRARepository _repo;
		private readonly ICOM_REPORepository _repoRepo;
		private readonly ISEG_USUARIOService _repoUser;
		
		public COM_ORDEN_COMPRAService(ICOM_ORDEN_COMPRARepository repo,
			ICOM_REPORepository repoRepo,
			ISEG_USUARIOService repoUser)
		{
			_repo = repo;
			_repoRepo = repoRepo;
			_repoUser = repoUser;
		}
		
		public async Task<CResult> GetAllAsync(COM_ORDEN_COMPRAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="@TIPO_CONSULTA",Value=1,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="@CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="@LOGIN_SISTEMA",Value=xWhere.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
				new CParameter() {ParameterName="@FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.Date},
				new CParameter() {ParameterName="@FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.Date},
				new CParameter() {ParameterName="@OPCION_CONSULTA",Value=xWhere.OPCION_CONSULTA,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_ORDEN_COMPRAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="NUMERO_ORDEN_COMPRA",Value=xWhere.NUMERO_ORDEN_COMPRA,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		public async Task<Stream> GetPDFAsync(COM_ORDEN_COMPRAParam xWhere)
		{
			
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="NUMERO_ORDEN",Value=xWhere.NUMERO_ORDEN_COMPRA,DbType=System.Data.DbType.Int32},
			};

				var vRespuestaCuadroComparativoData = await _repo.GetOrdenCompraImpr(p);

				if (vRespuestaCuadroComparativoData.Result)
				{
					return await _repoRepo.GetComCuadroComparativoOrdenCompraImprAsync((List<COM_ORDEN_COMPRA_IMPRView>)vRespuestaCuadroComparativoData.Data, _repoUser.GenerateRptToken("Admin"));
				}

			return null;
		}
	}
}
