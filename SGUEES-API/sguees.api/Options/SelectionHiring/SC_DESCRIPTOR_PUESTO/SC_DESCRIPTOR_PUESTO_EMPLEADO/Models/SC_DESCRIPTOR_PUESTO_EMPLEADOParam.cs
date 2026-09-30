// Qué hace: filtros de consulta de empleados cargados en el descriptor.
// Cómo lo hace: empresa y descriptor; el empleado solo al consultar una fila.
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_DESCRIPTOR_PUESTO_EMPLEADOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		public int CORR_EMPLEADO { get; set; }
	}
}
