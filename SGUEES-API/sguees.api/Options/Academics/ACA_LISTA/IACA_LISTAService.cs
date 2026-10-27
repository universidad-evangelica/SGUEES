using eFramework.Core;

namespace sguees.Services
{
	// Qué hace: servicio de listas fijas del módulo Académico.
	public interface IACA_LISTAService
	{
		CResult GetFORMA_INGRESO();
		CResult GetTIPO_EDUCACION();
		CResult GetTIPO_CONTACTO();
	}
}
