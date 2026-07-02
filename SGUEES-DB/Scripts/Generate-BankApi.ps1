# Genera API Banking desde plantilla CON_TIPO_CENTRO_COSTO
$apiRoot = "c:\Desarrollo GIT\SGUEES\SGUEES-API\sguees.api\Options\Banking"
$tplRoot = "c:\Desarrollo GIT\SGUEES\SGUEES-API\sguees.api\Options\Accounting\CON_TIPO_CENTRO_COSTO"

function New-BankApi {
    param(
        [string]$Name,
        [string]$KeyField,
        [string]$RoutePath,
        [hashtable]$TableProps,
        [hashtable]$ViewExtraProps = @{},
        [string[]]$InsertFields,
        [string[]]$UpdateFields
    )

    $dir = Join-Path $apiRoot $Name
    New-Item -ItemType Directory -Force -Path (Join-Path $dir 'Models') | Out-Null

    $tablePropsText = ($TableProps.GetEnumerator() | ForEach-Object { "		public $($_.Value) $($_.Key) { get; set; }" }) -join "`n"
    $viewExtra = ($ViewExtraProps.GetEnumerator() | ForEach-Object { "		public $($_.Value) $($_.Key) { get; set; }" }) -join "`n"
    $keyType = if ($KeyField -eq 'CORR_BANCO') { 'int' } else { 'int' }

    @"
using eFramework.Data;

namespace sguees.Models
{
	public class ${Name}Param : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public $keyType $KeyField { get; set; }
	}
}
"@ | Set-Content (Join-Path $dir "Models\${Name}Param.cs") -Encoding UTF8

    @"
using eFramework.Data;

namespace sguees.Models
{
	public class ${Name}Table : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
$tablePropsText
	}
}
"@ | Set-Content (Join-Path $dir "Models\${Name}Table.cs") -Encoding UTF8

    $viewBase = ($TableProps.Keys | Where-Object { $_ -ne 'USUARIO_CREA' -and $_ -ne 'FECHA_CREA' -and $_ -ne 'ESTACION_CREA' -and $_ -ne 'USUARIO_ACTU' -and $_ -ne 'FECHA_ACTU' -and $_ -ne 'ESTACION_ACTU' } | ForEach-Object {
        $t = $TableProps[$_]
        "		public $t $_ { get; set; }"
    }) -join "`n"

    @"
namespace sguees.Models
{
	public class ${Name}View
	{
		public int CORR_EMPRESA { get; set; }
$viewBase
$viewExtra
	}
}
"@ | Set-Content (Join-Path $dir "Models\${Name}View.cs") -Encoding UTF8

    $insParams = ($InsertFields | ForEach-Object {
        $parts = $_ -split '\|'
        $field = $parts[0]; $dbType = $parts[1]
        "					new CParameter() {ParameterName=`"$field`",Value=Data.$field,DbType=System.Data.DbType.$dbType},"
    }) -join "`n"

    $updParams = ($UpdateFields | ForEach-Object {
        $parts = $_ -split '\|'
        $field = $parts[0]; $dbType = $parts[1]
        "					new CParameter() {ParameterName=`"$field`",Value=Data.$field,DbType=System.Data.DbType.$dbType},"
    }) -join "`n"

    $keyDbType = if ($KeyField -eq 'CORR_BANCO') { 'Int32' } else { 'Int32' }
    $keyDir = if ($Name -eq 'GEN_BANCO') { ', ParameterDirection.InputOutput' } else { '' }

    @"
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class ${Name}Repository : BaseRepository<${Name}Table>, I${Name}Repository
	{
		private const string _TableName = "$Name";

		public ${Name}Repository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<${Name}View>().FromDataReader(reader).ToList();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true;
				objResultado.RowsAffected = response.Count; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<${Name}View>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
$insParams
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "$KeyField", pWhere);
				var response = new List<${Name}View>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.$KeyField ?? 0;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
$updParams
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="$KeyField",Value=Data.$KeyField,DbType=System.Data.DbType.$keyDbType},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<${Name}View>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="$KeyField",Value=Data.$KeyField,DbType=System.Data.DbType.$keyDbType},
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}
	}
}
"@ | Set-Content (Join-Path $dir "${Name}Repository.cs") -Encoding UTF8

    @"
using eFramework.Data;
using sguees.Models;
namespace sguees.Repositories
{
	public interface I${Name}Repository : IRepository<${Name}Table> { }
}
"@ | Set-Content (Join-Path $dir "I${Name}Repository.cs") -Encoding UTF8

    @"
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public interface I${Name}Service
	{
		Task<CResult> GetAllAsync(${Name}Param xWhere);
		Task<CResult> GetAsync(${Name}Param xWhere);
		Task<CResult> CreateAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
"@ | Set-Content (Join-Path $dir "I${Name}Service.cs") -Encoding UTF8

    @"
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class ${Name}Service : I${Name}Service
	{
		private readonly I${Name}Repository _repo;
		public ${Name}Service(I${Name}Repository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(${Name}Param xWhere)
		{
			var p = new List<CParameter> { new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 } };
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(${Name}Param xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "$KeyField", Value = xWhere.$KeyField, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(${Name}Table Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
"@ | Set-Content (Join-Path $dir "${Name}Service.cs") -Encoding UTF8

    $auditOnPost = if ($Name -eq 'GEN_BANCO') { @"
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = System.DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
"@ } else { '' }

    $auditOnPut = if ($Name -eq 'GEN_BANCO') { @"
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value;
			Data.FECHA_ACTU = System.DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
"@ } else { '' }

    @"
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class ${Name}Controller : ControllerBase
	{
		private readonly I${Name}Service _service;
		public ${Name}Controller(I${Name}Service service) { _service = service ?? throw new ArgumentNullException(nameof(service)); }

		[HttpGet("GetAll")]
		[Authorize(Policy = "/$RoutePath|R")]
		public async Task<CResult> GetAll([FromQuery] ${Name}Param Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/$RoutePath|R")]
		public async Task<CResult> Get([FromQuery] ${Name}Param Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/$RoutePath|C")]
		public async Task<IActionResult> Post(${Name}Table Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
$auditOnPost
			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/$RoutePath|U")]
		public async Task<IActionResult> Put(${Name}Table Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
$auditOnPut
			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/$RoutePath|D")]
		public async Task<IActionResult> Delete([FromQuery] ${Name}Table Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
"@ | Set-Content (Join-Path $dir "${Name}Controller.cs") -Encoding UTF8
}

# New-BankApi -Name 'BAN_LINEA_TRABAJO_CONCILIACION' ... (ya generado manualmente)

New-BankApi -Name 'GEN_BANCO' -KeyField 'CORR_BANCO' -RoutePath 'gen-banco' `
  -TableProps @{
    CORR_BANCO='int'; NOMBRE_BANCO='string'; NOMBRE_BANCO_CORTO='string'; CLASE_BANCO='string'
    CODIGO_TRANSACION_UNI='string'; USUARIO_CREA='string'; FECHA_CREA='DateTime'; ESTACION_CREA='string'
    USUARIO_ACTU='string'; FECHA_ACTU='DateTime'; ESTACION_ACTU='string'
  } `
  -ViewExtraProps @{ NOMBRE_CLASE_BANCO='string' } `
  -InsertFields @(
    'CORR_BANCO|Int32','NOMBRE_BANCO|String','NOMBRE_BANCO_CORTO|String','CLASE_BANCO|String','CODIGO_TRANSACION_UNI|String'
    'USUARIO_CREA|String','FECHA_CREA|DateTime','ESTACION_CREA|String','USUARIO_ACTU|String','FECHA_ACTU|DateTime','ESTACION_ACTU|String'
  ) `
  -UpdateFields @(
    'NOMBRE_BANCO|String','NOMBRE_BANCO_CORTO|String','CLASE_BANCO|String','CODIGO_TRANSACION_UNI|String'
    'USUARIO_ACTU|String','FECHA_ACTU|DateTime','ESTACION_ACTU|String'
  )

New-BankApi -Name 'BAN_TIPO_CHEQUE' -KeyField 'CORR_TIPO_CHEQUE' -RoutePath 'ban-tipo-cheque' `
  -TableProps @{
    CORR_TIPO_CHEQUE='int'; NOMBRE_TIPO_CHEQUE='string'; CUENTA_CONTABLE='string'
    CLASE_TIPO_CHEQUE='string'; CONTABILIZAR_LUEGO_DE_IMPRIMIR='bool'
  } `
  -ViewExtraProps @{ NOMBRE_CLASE_TIPO_CHEQUE='string' } `
  -InsertFields @(
    'CORR_TIPO_CHEQUE|Int32','NOMBRE_TIPO_CHEQUE|String','CUENTA_CONTABLE|String','CLASE_TIPO_CHEQUE|String','CONTABILIZAR_LUEGO_DE_IMPRIMIR|Boolean'
  ) `
  -UpdateFields @(
    'NOMBRE_TIPO_CHEQUE|String','CUENTA_CONTABLE|String','CLASE_TIPO_CHEQUE|String','CONTABILIZAR_LUEGO_DE_IMPRIMIR|Boolean'
  )

New-BankApi -Name 'BAN_TIPO_MOVI_BANCARIO' -KeyField 'CORR_TIPO_MOVIMIENTO' -RoutePath 'ban-tipo-movi-bancario' `
  -TableProps @{
    CORR_TIPO_MOVIMIENTO='int'; NOMBRE_TIPO_MOVIMIENTO='string'; NOMBRE_TIPO_CORTO='string'
    CORR_LINEA='int'; CORR_CLASE_PARTIDA='int'; USA_CHEQUE_PROPIO='bool'; SUMA_RESTA='int'
    CLASE_MOVIMIENTO='string'; CUENTA_CONTABLE_GASTO='string'; NOMBRE_REPORTE='string'
  } `
  -ViewExtraProps @{
    NOMBRE_LINEA_TRABAJO='string'; NOMBRE_CLASE_PARTIDA='string'; NOMBRE_SUMA_RESTA='string'; NOMBRE_CLASE_MOVIMIENTO='string'
  } `
  -InsertFields @(
    'CORR_TIPO_MOVIMIENTO|Int32','NOMBRE_TIPO_MOVIMIENTO|String','NOMBRE_TIPO_CORTO|String','CORR_LINEA|Int32','CORR_CLASE_PARTIDA|Int32'
    'USA_CHEQUE_PROPIO|Boolean','SUMA_RESTA|Int32','CLASE_MOVIMIENTO|String','CUENTA_CONTABLE_GASTO|String','NOMBRE_REPORTE|String'
  ) `
  -UpdateFields @(
    'NOMBRE_TIPO_MOVIMIENTO|String','NOMBRE_TIPO_CORTO|String','CORR_LINEA|Int32','CORR_CLASE_PARTIDA|Int32'
    'USA_CHEQUE_PROPIO|Boolean','SUMA_RESTA|Int32','CLASE_MOVIMIENTO|String','CUENTA_CONTABLE_GASTO|String','NOMBRE_REPORTE|String'
  )

New-BankApi -Name 'BAN_CUENTA_BANCARIA' -KeyField 'CORR_CUENTA_BANCO' -RoutePath 'ban-cuenta-bancaria' `
  -TableProps @{
    CORR_CUENTA_BANCO='int'; NUMERO_CUENTA_BANCO='string'; CORR_BANCO='int'; CUENTA_CONTABLE='string'
    NOMBRE_REPORTE='string'; TIPO_CUENTA_BANCO='string'; CORR_CENTRO_COSTO='int?'; CORR_MONEDA='int'
    CODIGO_EMPRESARIAL='string'; CODIGO_EMPRESARIAL_PROV='string'; NO_PERMITE_MODIFICAR='bool'
    VALIDAR_SALDO='bool?'; PAGA_PLANILLA='bool?'; VALIDA_FECHA='bool?'; NOMBRE_CUENTA='string'
    NO_PERMITE_CHEQUES='bool?'; ESTADO_CUENTA='string'; USA_TRANSACIONES_UNI='bool?'; CLASE_CHEQUE='string'
  } `
  -ViewExtraProps @{
    NOMBRE_CUENTA_BANCO='string'; NOMBRE_BANCO='string'; NOMBRE_BANCO_CORTO='string'
    NOMBRE_TIPO_CUENTA_BANCO='string'; NOMBRE_CENTRO='string'; NOMBRE_MONEDA='string'
    NOMBRE_EMPRESA='string'; NOMBRE_ESTADO_CUENTA='string'; CLASE_BANCO='string'
    CODIGO_TRANSACION_UNI='string'; NOMBRE_CLASE_CHEQUE='string'
  } `
  -InsertFields @(
    'CORR_CUENTA_BANCO|Int32','NUMERO_CUENTA_BANCO|String','CORR_BANCO|Int32','CUENTA_CONTABLE|String','NOMBRE_REPORTE|String'
    'TIPO_CUENTA_BANCO|String','CORR_CENTRO_COSTO|Int32','CORR_MONEDA|Int32','CODIGO_EMPRESARIAL|String','CODIGO_EMPRESARIAL_PROV|String'
    'NO_PERMITE_MODIFICAR|Boolean','VALIDAR_SALDO|Boolean','PAGA_PLANILLA|Boolean','VALIDA_FECHA|Boolean','NOMBRE_CUENTA|String'
    'NO_PERMITE_CHEQUES|Boolean','ESTADO_CUENTA|String','USA_TRANSACIONES_UNI|Boolean','CLASE_CHEQUE|String'
  ) `
  -UpdateFields @(
    'NUMERO_CUENTA_BANCO|String','CORR_BANCO|Int32','CUENTA_CONTABLE|String','NOMBRE_REPORTE|String','TIPO_CUENTA_BANCO|String'
    'CORR_CENTRO_COSTO|Int32','CORR_MONEDA|Int32','CODIGO_EMPRESARIAL|String','CODIGO_EMPRESARIAL_PROV|String'
    'NO_PERMITE_MODIFICAR|Boolean','VALIDAR_SALDO|Boolean','PAGA_PLANILLA|Boolean','VALIDA_FECHA|Boolean','NOMBRE_CUENTA|String'
    'NO_PERMITE_CHEQUES|Boolean','ESTADO_CUENTA|String','USA_TRANSACIONES_UNI|Boolean','CLASE_CHEQUE|String'
  )

Write-Host 'Banking APIs generated'
