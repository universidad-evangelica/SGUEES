using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
using SGUEES.Models;

namespace sguees.Services
{
	public class SC_SOLICITUD_EMPLEOService: ISC_SOLICITUD_EMPLEOService
	{
		private readonly ISC_SOLICITUD_EMPLEORepository _repo;
		
		public SC_SOLICITUD_EMPLEOService(ISC_SOLICITUD_EMPLEORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(SC_SOLICITUD_EMPLEOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(SC_SOLICITUD_EMPLEOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_SOLICITUD_EMPLEO",Value=xWhere.CORR_SOLICITUD_EMPLEO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActualizarPersonaDatosAsync(
			int corrEmpresa,
			string usuario,
			string estacion,
			SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZARParam data)
		{
			if (data == null)
			{
				return new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "Debe completar los campos requeridos.",
				};
			}

			data.FAMILIARES_DIRECTOS ??= new();
			data.HIJOS ??= new();
			data.ESTUDIOS ??= new();
			data.IDIOMAS ??= new();
			data.COMPETENCIAS ??= new();
			data.EXPERIENCIAS ??= new();
			data.FAMILIARES_UEES ??= new();

			if (!data.TIENE_FAMILIARES_UEES)
			{
				data.FAMILIARES_UEES.Clear();
			}

			if (string.IsNullOrWhiteSpace(data.NOMBRE1) ||
				string.IsNullOrWhiteSpace(data.APELLIDO1) ||
				data.FECHA_NACIMIENTO == default ||
				string.IsNullOrWhiteSpace(data.CORREO) ||
				string.IsNullOrWhiteSpace(data.CELULAR) ||
				string.IsNullOrWhiteSpace(data.DIRECCION) ||
				string.IsNullOrWhiteSpace(data.DUI) ||
				string.IsNullOrWhiteSpace(data.EMERGENCIA_NOMBRE) ||
				string.IsNullOrWhiteSpace(data.EMERGENCIA_TELEFONO))
			{
				return new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "Debe completar los campos requeridos.",
				};
			}

			if (data.POSEE_DISCAPACIDAD && string.IsNullOrWhiteSpace(data.TIPO_DISCAPACIDAD))
			{
				return new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "Debe indicar el tipo de discapacidad.",
				};
			}

			return await _repo.ActualizarPersonaDatosAsync(corrEmpresa, usuario, estacion, data);
		}
	}
}
