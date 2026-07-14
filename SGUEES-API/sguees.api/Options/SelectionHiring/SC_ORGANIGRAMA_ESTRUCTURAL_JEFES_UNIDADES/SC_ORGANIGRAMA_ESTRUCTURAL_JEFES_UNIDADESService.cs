using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESService : ISC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESService
    {
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESRepository _repo;

        public SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESService(ISC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESRepository repo)
        {
            _repo = repo;
        }

        public async Task<CResult> GetByUnidadAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA", Value=xWhere.CORR_EMPRESA, DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_UNIDAD", Value=xWhere.CORR_UNIDAD, DbType=System.Data.DbType.Int32},
            };


            if (xWhere.ACTIVO == 1)
            {
                p.Add(new CParameter() { ParameterName = "ACTIVO", Value = 1, DbType = System.Data.DbType.Boolean });
            }

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetEmpleadosByUnidadAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam xWhere)
        {
            // 1. Obtener empleados de la unidad destino (vista simple, sin cambios)
            var pEmpleados = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_UNIDAD_EMPLEADO", Value=xWhere.CORR_UNIDAD_DESTINO, DbType=System.Data.DbType.Int32},
            };

            var resultado = await _repo.GetEmpleadosDisponiblesAsync(pEmpleados);

            if (!resultado.Result || resultado.Data == null)
                return resultado;

            var empleados = (List<GEN_EMPLEADO_DISPONIBLEView>)resultado.Data;

            // 2. Obtener los CORR_EMPLEADO de jefes activos de la unidad origen
            var pJefes = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA", Value=xWhere.CORR_EMPRESA, DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_UNIDAD", Value=xWhere.CORR_UNIDAD_ORIGEN, DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="ACTIVO", Value=1, DbType=System.Data.DbType.Boolean},
            };

            var resultadoJefes = await _repo.GetAllAsync(pJefes);
            var idsExcluidos = new HashSet<int>();

            if (resultadoJefes.Result && resultadoJefes.Data != null)
            {
                var jefes = (List<SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESView>)resultadoJefes.Data;
                foreach (var j in jefes)
                {
                    idsExcluidos.Add(j.CORR_EMPLEADO);
                }
            }

            // 3. Filtrar en memoria
            var empleadosFiltrados = empleados
                .Where(e => !idsExcluidos.Contains(e.CORR_EMPLEADO))
                .ToList();

            return new CResult
            {
                Data = empleadosFiltrados,
                Result = true,
                RowsAffected = empleadosFiltrados.Count,
                CodeHelper = 0,
                ErrorCode = 0,
                ErrorMessage = "",
                ErrorSource = ""
            };
        }
        public async Task<CResult> GetAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA", Value=xWhere.CORR_EMPRESA, DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_JEFE", Value=xWhere.CORR_JEFE, DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Validar que el empleado no sea ya jefe de la misma unidad
            var checkParam = new SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam
            {
                CORR_EMPRESA = Data.CORR_EMPRESA,
                CORR_UNIDAD = Data.CORR_UNIDAD
            };
            var jefesActuales = await GetByUnidadAsync(checkParam);
            if (jefesActuales.Result && jefesActuales.Data != null)
            {
                var jefes = (List<SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESView>)jefesActuales.Data;
                foreach (var j in jefes)
                {
                    if (j.CORR_EMPLEADO == Data.CORR_EMPLEADO && j.ACTIVO)
                    {
                        return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El empleado ya está asignado como jefe de esta unidad" };
                    }
                }
            }

            // Validar fechas
            if (Data.FECHA_INICIO.Date < DateTime.Today)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La fecha de inicio no puede ser anterior a hoy" };

            if (Data.FECHA_FIN.HasValue && Data.FECHA_FIN.Value.Date <= Data.FECHA_INICIO.Date)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La fecha de fin debe ser mayor a la fecha de inicio" };

            Data.ACTIVO = true;
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Validar fechas
            if (Data.FECHA_INICIO.Date < DateTime.Today)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La fecha de inicio no puede ser anterior a hoy" };

            if (Data.FECHA_FIN.HasValue && Data.FECHA_FIN.Value.Date <= Data.FECHA_INICIO.Date)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La fecha de fin debe ser mayor a la fecha de inicio" };

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}