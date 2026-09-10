using eFramework.Data;

namespace SGUEES.Models
{
	/// <summary>Entidad mínima para BaseRepository (bandeja actores solo lectura + acciones delegadas).</summary>
	public class SC_BANDEJA_ACTORESTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
	}
}
