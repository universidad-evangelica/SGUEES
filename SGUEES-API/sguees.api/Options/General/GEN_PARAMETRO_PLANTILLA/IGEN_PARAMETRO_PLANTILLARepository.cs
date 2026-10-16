// Qué hace: contrato de repositorio para la gestión de plantillas de correo y sus catálogos vinculados.
// Cómo lo hace: define métodos asíncronos para consulta de módulos, opciones y parámetros según permisos.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PARAMETRO_PLANTILLARepository : IRepository<GEN_PARAMETRO_PLANTILLATable>
	{
		Task<CResult> GetModulosAsync(string loginSistema = "");
		Task<CResult> GetOpcionesPorModuloAsync(string codigoSistema, string loginSistema = "");
		Task<CResult> GetParametrosDisponiblesAsync(string codigoOpcion, string codigoSistema);
	}
}
