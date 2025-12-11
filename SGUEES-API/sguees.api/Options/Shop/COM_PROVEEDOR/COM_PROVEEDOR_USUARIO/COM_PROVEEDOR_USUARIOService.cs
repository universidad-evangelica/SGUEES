using System.Collections.Generic;
using System.Threading.Tasks;
using sguees.Models;
using eFramework.Core;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_PROVEEDOR_USUARIOService: ICOM_PROVEEDOR_USUARIOService
	{
		private readonly ICOM_PROVEEDOR_USUARIORepository _repo;
		private readonly ISEG_USUARIORepository _repoUsuario;
		
		public COM_PROVEEDOR_USUARIOService(ICOM_PROVEEDOR_USUARIORepository repo,
																				ISEG_USUARIORepository repoUsuario)
		{
			_repo = repo;
			_repoUsuario = repoUsuario;
		}
		
		public async Task<CResult> GetAllAsync(COM_PROVEEDOR_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_PROVEEDOR",Value=xWhere.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_PROVEEDOR_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_PROVEEDOR",Value=xWhere.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="LOGIN_SISTEMA",Value=xWhere.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vDataUsuario = new SEG_USUARIOTable 
			{
				LOGIN_SISTEMA = Data.LOGIN_SISTEMA,
				CORR_EMPRESA = Data.CORR_EMPRESA,
				NOMBRE_USUARIO = Data.NOMBRE_USUARIO,
				CORREO_ELECTRONICO = Data.CORREO_ELECTRONICO,
				TIPO_USUARIO = 6,
				ESTADO_USUARIO = Data.ESTADO_USUARIO,
				IDIOMA = "",
				USUARIO_CREA = Data.USUARIO_CREA,
				FECHA_CREA = Data.FECHA_CREA,
				ESTACION_CREA = Data.ESTACION_CREA,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU
			};
			var vResultado = await _repoUsuario.CreateAsync(vDataUsuario, vLOGIN_SISTEMA, vESTACION);

			if (vResultado.Result) {
				vResultado = await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
			}

			return vResultado;
		}
		
		public async Task<CResult> UpdateAsync(COM_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vDataUsuario = new SEG_USUARIOTable 
			{
				LOGIN_SISTEMA = Data.LOGIN_SISTEMA,
				NOMBRE_USUARIO = Data.NOMBRE_USUARIO,
				CORREO_ELECTRONICO = Data.CORREO_ELECTRONICO,
				TIPO_USUARIO = 6,
				ESTADO_USUARIO = Data.ESTADO_USUARIO,
				IDIOMA = "",
				USUARIO_CREA = Data.USUARIO_CREA,
				FECHA_CREA = Data.FECHA_CREA,
				ESTACION_CREA = Data.ESTACION_CREA,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU
			};
			var vResultado = await _repoUsuario.UpdateAsync(vDataUsuario, vLOGIN_SISTEMA, vESTACION);

			if (vResultado.Result) {
				vResultado = await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
			}

			return vResultado;
		}
		
		public async Task<CResult> DeleteAsync(COM_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vDataUsuario = new SEG_USUARIOTable 
			{
				LOGIN_SISTEMA = Data.LOGIN_SISTEMA,
				NOMBRE_USUARIO = Data.NOMBRE_USUARIO,
				CORREO_ELECTRONICO = Data.CORREO_ELECTRONICO,
				TIPO_USUARIO = 6,
				ESTADO_USUARIO = Data.ESTADO_USUARIO,
				IDIOMA = "",
				USUARIO_CREA = Data.USUARIO_CREA,
				FECHA_CREA = Data.FECHA_CREA,
				ESTACION_CREA = Data.ESTACION_CREA,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU
			};
			var vResultado = await _repoUsuario.DeleteAsync(vDataUsuario, vLOGIN_SISTEMA, vESTACION);

			if (vResultado.Result) {
				vResultado = await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
			}

			return vResultado;
			
		}

		public async Task<CResult> CambioClave(SEG_USUARIO_LOGINParam xWhere, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoUsuario.CambioClave(xWhere, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
