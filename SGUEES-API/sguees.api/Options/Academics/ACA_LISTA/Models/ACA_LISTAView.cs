namespace sguees.Models
{
	// Qué hace: fila Key/Value de listas fijas del módulo Académico.
	// Cómo lo hace: mismo contrato que SC_LISTA / GEN_LISTA para getLookUp del SPA.
	public class ACA_LISTAView
	{
		public object Key { get; set; }
		public string Value { get; set; }
	}
}
