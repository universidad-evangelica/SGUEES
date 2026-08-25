using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_EXPEDIENTE_CANDIDATORepository : IRepository<SC_EXPEDIENTE_CANDIDATOTable>
	{
		Task<CResult> GetEstadoAsociacionAsync(int corrEmpresa, int corrSolicitudEmpleo);
		Task<CResult> AsociarSolicitudAsync(int corrEmpresa, int corrSolicitudEmpleo, bool crearExpediente, string login, string estacion);
	}
}
