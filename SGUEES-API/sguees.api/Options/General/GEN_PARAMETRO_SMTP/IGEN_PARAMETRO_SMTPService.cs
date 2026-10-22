// Qué hace: define el contrato de servicios de negocio para parámetros SMTP.
// Cómo lo hace: declara métodos asíncronos para operaciones CRUD de GEN_PARAMETRO_SMTP.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PARAMETRO_SMTPService
	{
		Task<CResult> GetAllAsync(GEN_PARAMETRO_SMTPParam xWhere);
		Task<CResult> GetAsync(GEN_PARAMETRO_SMTPParam xWhere);
		Task<CResult> CreateAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_PARAMETRO_SMTPTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
