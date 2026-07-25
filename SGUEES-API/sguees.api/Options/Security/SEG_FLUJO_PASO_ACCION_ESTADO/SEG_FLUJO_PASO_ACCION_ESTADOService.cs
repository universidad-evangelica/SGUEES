using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SEG_FLUJO_PASO_ACCION_ESTADOService : ISEG_FLUJO_PASO_ACCION_ESTADOService
    {
        private readonly ISEG_FLUJO_PASO_ACCION_ESTADORepository _repo;

        public SEG_FLUJO_PASO_ACCION_ESTADOService(ISEG_FLUJO_PASO_ACCION_ESTADORepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_PASO_ACCION_ESTADOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_FLUJO_PROCESO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=xWhere.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_PASO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_PASO",Value=xWhere.CORR_PASO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_ACCION != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ACCION",Value=xWhere.CORR_ACCION,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_ESTADO_DESTINO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ESTADO_DESTINO",Value=xWhere.CORR_ESTADO_DESTINO,DbType=System.Data.DbType.Int32});
            }

            // Nuevos filtros por nombre (opcional)
            if (!string.IsNullOrEmpty(xWhere.NOMBRE_ESTADO))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_ESTADO",Value=xWhere.NOMBRE_ESTADO,DbType=System.Data.DbType.String});
            }

            if (!string.IsNullOrEmpty(xWhere.TIPO_MOVIMIENTO))
            {
                p.Add(new CParameter() {ParameterName="TIPO_MOVIMIENTO",Value=xWhere.TIPO_MOVIMIENTO,DbType=System.Data.DbType.String});
            }

            if (!string.IsNullOrEmpty(xWhere.TIPO_NOTIFICACION))
            {
                p.Add(new CParameter() {ParameterName="TIPO_NOTIFICACION",Value=xWhere.TIPO_NOTIFICACION,DbType=System.Data.DbType.String});
            }

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_PASO_ACCION_ESTADOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=xWhere.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PASO",Value=xWhere.CORR_PASO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_ACCION",Value=xWhere.CORR_ACCION,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_PASO_ACCION_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_PASO_ACCION_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_PASO_ACCION_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}