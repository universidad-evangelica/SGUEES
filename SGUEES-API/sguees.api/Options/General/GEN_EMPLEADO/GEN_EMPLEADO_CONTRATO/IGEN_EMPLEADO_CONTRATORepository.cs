// Qué hace: contrato de repositorio para contratos asignados a empleados (GEN_EMPLEADO_CONTRATO).
// Cómo lo hace: define consultas de contratos, plantillas activas, contexto de parámetros, transiciones de estado y adjunto firmado.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_EMPLEADO_CONTRATORepository
	{
		Task<CResult> GetAllAsync(int corrEmpresa, int corrEmpleado, string login);
		Task<CResult> GetAsync(int corrEmpresa, int corrEmpleadoContrato, string login);
		Task<CResult> GetPlantillasActivasAsync(int corrEmpresa, string login);
		Task<bool> PuedeVerEmpleadoAsync(int corrEmpresa, int corrEmpleado, string login);
		Task<bool> PuedeVerContratoAsync(int corrEmpresa, int corrEmpleadoContrato, string login);
		Task<bool> PuedeUsarPlantillaVersionAsync(int corrEmpresa, int corrPlantillaVersion, string login);
		// Qué hace: define el contrato del repositorio de contratos de empleados.
		// Cómo lo hace: incluye fechaReferencia en GetContextoGeneracionAsync para resolver el firmante de Rectoría según vigencia.
		Task<ContratoContextoData> GetContextoGeneracionAsync(
			int corrEmpresa,
			int corrEmpleado,
			int corrPlantillaVersion,
			int? corrUnidad,
			int? corrPuesto,
			int? corrMovimiento,
	DateTime? fechaReferencia = null);
		Task<CResult> CreateBorradorAsync(GEN_EMPLEADO_CONTRATOTable Data);
		Task<CResult> UpdateBorradorAsync(GEN_EMPLEADO_CONTRATOTable Data);
		Task<CResult> CambiarEstadoAsync(
			int corrEmpresa,
			int corrEmpleadoContrato,
			int estadoDestino,
			int? estadoRequerido,
			string motivoAnulacion,
			string login,
			string estacion);
		Task<CResult> ActualizarArchivoFirmadoAsync(
			int corrEmpresa,
			int corrEmpleadoContrato,
			string nombreArchivo,
			string rutaArchivo,
			string login,
			string estacion);
		Task<CResult> DeleteBorradorAsync(int corrEmpresa, int corrEmpleadoContrato);
		// Qué hace: verifica si el empleado ya tiene un contrato activo para el mismo puesto.
		// Cómo lo hace: cuenta filas en BORRADOR o VIGENTE para ese CORR_EMPLEADO + CORR_PUESTO.
		Task<bool> ExisteContratoActivoParaPuestoAsync(int corrEmpresa, int corrEmpleado, int corrPuesto);
	}

	// Qué hace: agrupa los datos crudos de BD necesarios para interpolar los {{PARAMETROS}} de una plantilla de contrato.
	// Cómo lo hace: reúne versión de plantilla, empresa, sucursal, rectoría, empleado/persona y puesto en un solo objeto.
	public class ContratoContextoData
	{
		public bool PlantillaEncontrada { get; set; }
		public bool VersionActiva { get; set; }
		public bool EmpleadoEncontrado { get; set; }
		public string CuerpoPlantilla { get; set; }
		public string NombrePlantilla { get; set; }
		public string NombreTipoContratacionPlantilla { get; set; }
		public string EmpresaNombreLargo { get; set; }
		public string EmpresaNombre { get; set; }
		public string EmpresaNit { get; set; }
		public string EmpresaDireccionLargo { get; set; }
		public string EmpresaDireccion { get; set; }
		public string EmpresaRepresentante { get; set; }
		public string EmpresaMunicipio { get; set; }
		public string SucursalNombre { get; set; }
		public string RectorNombre { get; set; }
		public string RectorPuesto { get; set; }
		public string RectorDui { get; set; }
		public int? RectorEdad { get; set; }
		public string RectorEstadoCivil { get; set; }
		public string RectorProfesion { get; set; }
		public string RectorDomicilio { get; set; }
		public string CodigoEmpleado { get; set; }
		public string EmpleadoNombreCompleto { get; set; }
		public string EmpleadoDui { get; set; }
		public string EmpleadoNit { get; set; }
		public int? EmpleadoEdad { get; set; }
		public string EmpleadoEstadoCivil { get; set; }
		public string EmpleadoNacionalidad { get; set; }
		public string EmpleadoProfesion { get; set; }
		public string EmpleadoDireccion { get; set; }
		public string EmpleadoMunicipio { get; set; }
		public string EmpleadoDepto { get; set; }
		public string EmpleadoDistrito { get; set; }
		public string EmpleadoCorreo { get; set; }
		public string EmpleadoTelefono { get; set; }
		public System.DateTime? EmpleadoFechaIngreso { get; set; }
		public string NombrePuesto { get; set; }
		public string MisionPuesto { get; set; }
		public string NombreUnidad { get; set; }
		public string NombreUnidadPadre { get; set; }
		public string TipoContratacionPuesto { get; set; }
		public string ModalidadTrabajo { get; set; }
		public decimal? SalarioMensual { get; set; }
		public string HorarioLaboral { get; set; }
		public System.DateTime? PuestoFechaIngreso { get; set; }
		public System.DateTime? PuestoFechaFin { get; set; }
		public System.DateTime? MovimientoFechaFinalizacion { get; set; }
	}
}

