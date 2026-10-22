// Qué hace: arma el lookup de períodos de Documentos por período.
// Cómo: filtra V_ACA_PERIODOS_MTTO por la empresa de la sesión.
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class ACA_PERIODOS_ACADEMICOSDocumentoService : IACA_PERIODOS_ACADEMICOSDocumentoService
	{
		private readonly IACA_PERIODOS_ACADEMICOSDocumentoRepository _repo;

		public ACA_PERIODOS_ACADEMICOSDocumentoService(IACA_PERIODOS_ACADEMICOSDocumentoRepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista los períodos que se pueden marcar.
		// Cómo: pasa CORR_EMPRESA al repositorio.
		public async Task<CResult> GetPeriodosAsync(int corrEmpresa) =>
			await _repo.GetPeriodosAsync(new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
			});
	}
}
