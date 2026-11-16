// Qué hace: contrato de negocio para administrar contratos por empleado en gen-empleado.
// Cómo lo hace: declara consulta, asignación en borrador, edición/regeneración, emisión inmutable, finalización, anulación y gestión de archivo firmado.
using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using sguees.api.Options.General.GEN_EMPLEADO.GEN_EMPLEADO_CONTRATO;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_EMPLEADO_CONTRATOService
	{
		Task<CResult> GetAllAsync(GEN_EMPLEADO_CONTRATOParam xWhere);
		Task<CResult> GetAsync(GEN_EMPLEADO_CONTRATOParam xWhere);
		Task<CResult> GetPlantillasActivasAsync(int corrEmpresa);
		Task<CResult> PreviewAsync(GEN_EMPLEADO_CONTRATOAccionParam Data);
		Task<CResult> AsignarBorradorAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActualizarBorradorAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> EmitirAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> FinalizarAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AnularAsync(GEN_EMPLEADO_CONTRATOAccionParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> SubirDocumentoFirmadoAsync(
			int corrEmpresa,
			int corrEmpleadoContrato,
			IFormFile archivo,
			EmpleadoContratoStorage storage,
			string vLOGIN_SISTEMA,
			string vESTACION);
		Task<(Stream Stream, string FileName)> GetDocumentoFirmadoAsync(
			GEN_EMPLEADO_CONTRATOParam xWhere,
			EmpleadoContratoStorage storage);
		Task<CResult> DeleteBorradorAsync(GEN_EMPLEADO_CONTRATOParam Data, EmpleadoContratoStorage storage);
	}
}

