using eFramework.Data;

namespace SGUEES.Models
{
	/// <summary>Entidad mínima para BaseRepository (bandeja solo lectura).</summary>
	public class SC_BANDEJA_THTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
	}
}
