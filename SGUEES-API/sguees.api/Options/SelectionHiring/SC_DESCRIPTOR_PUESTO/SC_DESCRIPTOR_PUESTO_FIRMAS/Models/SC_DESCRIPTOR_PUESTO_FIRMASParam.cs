// Qué hace: filtros para listar las firmas de un descriptor.
// Cómo lo hace: empresa de sesión y correlativo del descriptor.
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_DESCRIPTOR_PUESTO_FIRMASParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
	}
}
