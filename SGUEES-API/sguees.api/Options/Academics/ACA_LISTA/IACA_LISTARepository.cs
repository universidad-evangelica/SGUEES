using eFramework.Core;

namespace sguees.Repositories
{
	// Qué hace: contrato de listas fijas de Académico (sin tabla).
	public interface IACA_LISTARepository
	{
		CResult GetFORMA_INGRESO();
		CResult GetTIPO_EDUCACION();
		CResult GetTIPO_CONTACTO();
	}
}
