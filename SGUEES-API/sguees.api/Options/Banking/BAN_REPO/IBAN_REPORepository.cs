using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_REPORepository
	{
		Task<Stream> GetBanChequeEmitidosImprAsync(List<BAN_CHEQUE_EMITIDOS_IMPRView> data, string token);
		Task<Stream> GetBanEstadoCuentaImprAsync(List<BAN_ESTADO_CUENTA_IMPRView> data, string token);
		Task<Stream> GetBanEstadoCuentaAcumuladoImprAsync(List<BAN_ESTADO_CUENTA_ACUMULADO_IMPRView> data, string token);
		Task<Stream> GetBanEntregaChequesImprAsync(List<BAN_ENTREGA_CHEQUES_IMPRView> data, string token);
	}
}
