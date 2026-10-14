// Qué hace: contrato del servicio de domicilios (tab Direcciones).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PERSONA_DOMICILIOService
	{
		Task<CResult> GetAllAsync(GEN_PERSONA_DOMICILIOParam xWhere, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_DOMICILIOTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
