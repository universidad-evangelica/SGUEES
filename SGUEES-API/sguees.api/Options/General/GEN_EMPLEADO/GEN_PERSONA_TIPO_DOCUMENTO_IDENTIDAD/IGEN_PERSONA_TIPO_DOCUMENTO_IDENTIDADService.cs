// Qué hace: contrato del servicio de documentos de identidad (tab Documentos de empleado).
// Cómo lo hace: GetAll merge + SaveAll con lista Table (estándar Param/Table/View).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADService
	{
		Task<CResult> GetAllAsync(GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADParam xWhere, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
