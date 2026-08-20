using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_REQUISICION_PERSONALService : ISC_REQUISICION_PERSONALService
    {
        private readonly ISC_REQUISICION_PERSONALRepository _repo;
        public SC_REQUISICION_PERSONALService(ISC_REQUISICION_PERSONALRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SC_REQUISICION_PERSONALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				//Quiero filtrar por ACTIVOs nada mas
				//new CParameter() {ParameterName="ACTIVO",Value=true,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsync(p);
        }

        /// <summary>
        /// Requisiciones disponibles para vincular desde solicitud de empleo.
        /// Por ahora trae todas; agregar filtros de estado aquí cuando el negocio lo defina.
        /// </summary>
        public async Task<CResult> GetAllForSolicitudEmpleoAsync(SC_REQUISICION_PERSONALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                // Ejemplo futuro — solo requisiciones aprobadas/publicadas:
                // new CParameter() { ParameterName = "CORR_ESTADO_REQUISICION", Value = 5, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SC_REQUISICION_PERSONALParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_REQUISICION_PERSONAL",Value=xWhere.CORR_REQUISICION_PERSONAL,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        //fUNCION PARA TRAER BITACORA DE SEG_FLUJO_BITACORA
        public async Task<CResult> GetAllAsyncBitacoraByCORR_REQUISICION(SC_REQUISICION_PERSONAL_BITACORAParam xWhere)
        {
            var p = new List<CParameter>
            {
                //new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=xWhere.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_DOCUMENTO",Value=xWhere.CORR_REQUISICION_PERSONAL,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsyncBitacoraByCORR_REQUISICION(p);
        }

    }
}
