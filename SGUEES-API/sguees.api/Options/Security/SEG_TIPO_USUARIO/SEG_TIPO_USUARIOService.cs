using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class SEG_TIPO_USUARIOService: ISEG_TIPO_USUARIOService
	{
		private readonly ISEG_TIPO_USUARIORepository _repo;
		private readonly ISEG_TIPO_USUARIO_OPCIONRepository _repoOpciones;
		public SEG_TIPO_USUARIOService(ISEG_TIPO_USUARIORepository repo,
										ISEG_TIPO_USUARIO_OPCIONRepository repoOpciones)
		{
			_repo = repo;
			_repoOpciones = repoOpciones;
		}
		
		public async Task<CResult> GetAllAsync(SEG_TIPO_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(SEG_TIPO_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="TIPO_USUARIO",Value=xWhere.TIPO_USUARIO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(SEG_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(SEG_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(SEG_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		#region "Detalle de opciones"
        public async Task<CResult> GetAllSEG_TIPO_USUARIO_OPCION(SEG_TIPO_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "@TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "@TIPO_USUARIO", Value = xWhere.TIPO_USUARIO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "@OPCION_CONSULTA", Value = xWhere.OPCION_CONSULTA, DbType = System.Data.DbType.Int32 }
            };

			return await _repoOpciones.GetAllAsync(p);
		}    
        public async Task<CResult> UpdateSEG_TIPO_USUARIO_OPCIONAsync(SEG_TIPO_USUARIO_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoOpciones.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
        #endregion
	}
}
