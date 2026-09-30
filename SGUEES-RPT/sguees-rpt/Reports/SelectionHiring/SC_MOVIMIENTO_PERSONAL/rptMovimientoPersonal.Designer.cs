using System.ComponentModel;
using System.Drawing;
using DevExpress.XtraPrinting;
using DevExpress.XtraReports.UI;

namespace sgueesRpt.Reports.SelectionHiring.SC_MOVIMIENTO_PERSONAL
{
	partial class rptMovimientoPersonal
	{
		private IContainer components = null;

		private TopMarginBand topMarginBand1;
		private BottomMarginBand bottomMarginBand1;
		private DetailBand detailBand1;
		private XRLabel lblFechaElaboracion;

		private XRLabel lblBoxPermanente;
		private XRLabel lblChkPermanente;
		private XRLabel lblTxtPermanente;
		private XRLabel lblBoxEventual;
		private XRLabel lblChkEventual;
		private XRLabel lblTxtEventual;
		private XRLabel lblBoxAscenso;
		private XRLabel lblChkAscenso;
		private XRLabel lblTxtAscenso;
		private XRLabel lblBoxTraslado;
		private XRLabel lblChkTraslado;
		private XRLabel lblTxtTraslado;

		private XRLabel lblNombrePref;
		private XRLabel lblNombre;
		private XRLabel lblIdPref;
		private XRLabel lblNumeroId;
		private XRLabel lblIngresoPref;
		private XRLabel lblFechaIngreso;
		private XRLabel lblFinPref;
		private XRLabel lblFechaFinalizacion;

		private XRLabel lblColActual;
		private XRLabel lblColPropuesta;

		private XRLabel lblCargoActPref;
		private XRLabel lblCargoAct;
		private XRLabel lblCargoPropPref;
		private XRLabel lblCargoProp;
		private XRLabel lblGerenciaActPref;
		private XRLabel lblGerenciaAct;
		private XRLabel lblGerenciaPropPref;
		private XRLabel lblGerenciaProp;
		private XRLabel lblDeptoActPref;
		private XRLabel lblDeptoAct;
		private XRLabel lblDeptoPropPref;
		private XRLabel lblDeptoProp;
		private XRLabel lblSalarioActPref;
		private XRLabel lblSalarioAct;
		private XRLabel lblSalarioPropPref;
		private XRLabel lblSalarioProp;
		private XRLabel lblModalidadActPref;
		private XRLabel lblModalidadAct;
		private XRLabel lblModalidadPropPref;
		private XRLabel lblModalidadProp;
		private XRLabel lblHorarioActPref;
		private XRLabel lblHorarioAct;
		private XRLabel lblHorarioPropPref;
		private XRLabel lblHorarioProp;

		private XRLabel lblJustificacionPref;
		private XRLabel lblJustificacion;

		private XRLabel lblAprobaciones;
		private XRLabel lblJefePref;
		private XRLabel lblJefeFirma;
		private XRLabel lblJefeFecha;
		private XRLabel lblDecanoPref;
		private XRLabel lblDecanoFirma;
		private XRLabel lblDecanoFecha;
		private XRLabel lblVraPref;
		private XRLabel lblVraFirma;
		private XRLabel lblVraFecha;

		private XRLabel lblFechaEfectivaPref;
		private XRLabel lblFechaEfectiva;

		protected override void Dispose(bool disposing)
		{
			if (disposing && (components != null))
			{
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		private void InitializeComponent()
		{
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(rptMovimientoPersonal));
            DevExpress.XtraReports.UI.XRWatermark xrWatermark1 = new DevExpress.XtraReports.UI.XRWatermark();
            this.topMarginBand1 = new DevExpress.XtraReports.UI.TopMarginBand();
            this.bottomMarginBand1 = new DevExpress.XtraReports.UI.BottomMarginBand();
            this.detailBand1 = new DevExpress.XtraReports.UI.DetailBand();
            this.lblFechaElaboracion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxPermanente = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkPermanente = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtPermanente = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxEventual = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkEventual = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtEventual = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxAscenso = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkAscenso = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtAscenso = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxTraslado = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkTraslado = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtTraslado = new DevExpress.XtraReports.UI.XRLabel();
            this.lblNombrePref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblNombre = new DevExpress.XtraReports.UI.XRLabel();
            this.lblIdPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblNumeroId = new DevExpress.XtraReports.UI.XRLabel();
            this.lblIngresoPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblFechaIngreso = new DevExpress.XtraReports.UI.XRLabel();
            this.lblFinPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblFechaFinalizacion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblColActual = new DevExpress.XtraReports.UI.XRLabel();
            this.lblColPropuesta = new DevExpress.XtraReports.UI.XRLabel();
            this.lblCargoActPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblCargoAct = new DevExpress.XtraReports.UI.XRLabel();
            this.lblCargoPropPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblCargoProp = new DevExpress.XtraReports.UI.XRLabel();
            this.lblGerenciaActPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblGerenciaAct = new DevExpress.XtraReports.UI.XRLabel();
            this.lblGerenciaPropPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblGerenciaProp = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDeptoActPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDeptoAct = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDeptoPropPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDeptoProp = new DevExpress.XtraReports.UI.XRLabel();
            this.lblSalarioActPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblSalarioAct = new DevExpress.XtraReports.UI.XRLabel();
            this.lblSalarioPropPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblSalarioProp = new DevExpress.XtraReports.UI.XRLabel();
            this.lblModalidadActPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblModalidadAct = new DevExpress.XtraReports.UI.XRLabel();
            this.lblModalidadPropPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblModalidadProp = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHorarioActPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHorarioAct = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHorarioPropPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHorarioProp = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJustificacionPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJustificacion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblAprobaciones = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJefePref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJefeFirma = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJefeFecha = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDecanoPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDecanoFirma = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDecanoFecha = new DevExpress.XtraReports.UI.XRLabel();
            this.lblVraPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblVraFirma = new DevExpress.XtraReports.UI.XRLabel();
            this.lblVraFecha = new DevExpress.XtraReports.UI.XRLabel();
            this.lblFechaEfectivaPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblFechaEfectiva = new DevExpress.XtraReports.UI.XRLabel();
            this.PageHeader = new DevExpress.XtraReports.UI.PageHeaderBand();
            this.xrLabel1 = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHdrReq = new DevExpress.XtraReports.UI.XRLabel();
            this.xrPictureBox1 = new DevExpress.XtraReports.UI.XRPictureBox();
            this.lineHdr = new DevExpress.XtraReports.UI.XRLine();
            this.PageFooter = new DevExpress.XtraReports.UI.PageFooterBand();
            this.lblFechaElabPref = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabel2 = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabel3 = new DevExpress.XtraReports.UI.XRLabel();
            ((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
            // 
            // topMarginBand1
            // 
            this.topMarginBand1.HeightF = 20F;
            this.topMarginBand1.Name = "topMarginBand1";
            // 
            // bottomMarginBand1
            // 
            this.bottomMarginBand1.HeightF = 20F;
            this.bottomMarginBand1.Name = "bottomMarginBand1";
            // 
            // detailBand1
            // 
            this.detailBand1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.lblFechaElabPref,
            this.lblFechaElaboracion,
            this.lblBoxPermanente,
            this.lblChkPermanente,
            this.lblTxtPermanente,
            this.lblBoxEventual,
            this.lblChkEventual,
            this.lblTxtEventual,
            this.lblBoxAscenso,
            this.lblChkAscenso,
            this.lblTxtAscenso,
            this.lblBoxTraslado,
            this.lblChkTraslado,
            this.lblTxtTraslado,
            this.lblNombrePref,
            this.lblNombre,
            this.lblIdPref,
            this.lblNumeroId,
            this.lblIngresoPref,
            this.lblFechaIngreso,
            this.lblFinPref,
            this.lblFechaFinalizacion,
            this.lblColActual,
            this.lblColPropuesta,
            this.lblCargoActPref,
            this.lblCargoAct,
            this.lblCargoPropPref,
            this.lblCargoProp,
            this.lblGerenciaActPref,
            this.lblGerenciaAct,
            this.lblGerenciaPropPref,
            this.lblGerenciaProp,
            this.lblDeptoActPref,
            this.lblDeptoAct,
            this.lblDeptoPropPref,
            this.lblDeptoProp,
            this.lblSalarioActPref,
            this.lblSalarioAct,
            this.lblSalarioPropPref,
            this.lblSalarioProp,
            this.lblModalidadActPref,
            this.lblModalidadAct,
            this.lblModalidadPropPref,
            this.lblModalidadProp,
            this.lblHorarioActPref,
            this.lblHorarioAct,
            this.lblHorarioPropPref,
            this.lblHorarioProp,
            this.lblJustificacionPref,
            this.lblJustificacion,
            this.lblAprobaciones,
            this.lblJefePref,
            this.lblJefeFirma,
            this.lblJefeFecha,
            this.lblDecanoPref,
            this.lblDecanoFirma,
            this.lblDecanoFecha,
            this.lblVraPref,
            this.lblVraFirma,
            this.lblVraFecha,
            this.lblFechaEfectivaPref,
            this.lblFechaEfectiva});
            this.detailBand1.HeightF = 566.8751F;
            this.detailBand1.Name = "detailBand1";
            // 
            // lblFechaElaboracion
            // 
            this.lblFechaElaboracion.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblFechaElaboracion.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[FECHA_ELABORACION]")});
            this.lblFechaElaboracion.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblFechaElaboracion.LocationFloat = new DevExpress.Utils.PointFloat(640F, 0F);
            this.lblFechaElaboracion.Name = "lblFechaElaboracion";
            this.lblFechaElaboracion.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblFechaElaboracion.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            this.lblFechaElaboracion.TextFormatString = "{0:dd/MM/yyyy}";
            // 
            // lblBoxPermanente
            // 
            this.lblBoxPermanente.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxPermanente.LocationFloat = new DevExpress.Utils.PointFloat(84F, 32F);
            this.lblBoxPermanente.Name = "lblBoxPermanente";
            this.lblBoxPermanente.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxPermanente.StylePriority.UseTextAlignment = false;
            this.lblBoxPermanente.Text = " ";
            this.lblBoxPermanente.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // lblChkPermanente
            // 
            this.lblChkPermanente.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkPermanente.LocationFloat = new DevExpress.Utils.PointFloat(84F, 30F);
            this.lblChkPermanente.Name = "lblChkPermanente";
            this.lblChkPermanente.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkPermanente.StylePriority.UseTextAlignment = false;
            this.lblChkPermanente.Text = " ";
            this.lblChkPermanente.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtPermanente
            // 
            this.lblTxtPermanente.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblTxtPermanente.LocationFloat = new DevExpress.Utils.PointFloat(102F, 28F);
            this.lblTxtPermanente.Name = "lblTxtPermanente";
            this.lblTxtPermanente.SizeF = new System.Drawing.SizeF(150F, 18F);
            this.lblTxtPermanente.StylePriority.UseTextAlignment = false;
            this.lblTxtPermanente.Text = "CONTRATACIÓN PERMANENTE";
            this.lblTxtPermanente.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblBoxEventual
            // 
            this.lblBoxEventual.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxEventual.LocationFloat = new DevExpress.Utils.PointFloat(262F, 32F);
            this.lblBoxEventual.Name = "lblBoxEventual";
            this.lblBoxEventual.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxEventual.StylePriority.UseTextAlignment = false;
            this.lblBoxEventual.Text = " ";
            this.lblBoxEventual.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // lblChkEventual
            // 
            this.lblChkEventual.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkEventual.LocationFloat = new DevExpress.Utils.PointFloat(262F, 30F);
            this.lblChkEventual.Name = "lblChkEventual";
            this.lblChkEventual.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkEventual.StylePriority.UseTextAlignment = false;
            this.lblChkEventual.Text = " ";
            this.lblChkEventual.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtEventual
            // 
            this.lblTxtEventual.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblTxtEventual.LocationFloat = new DevExpress.Utils.PointFloat(280F, 28F);
            this.lblTxtEventual.Name = "lblTxtEventual";
            this.lblTxtEventual.SizeF = new System.Drawing.SizeF(150F, 18F);
            this.lblTxtEventual.StylePriority.UseTextAlignment = false;
            this.lblTxtEventual.Text = "CONTRATACIÓN EVENTUAL";
            this.lblTxtEventual.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblBoxAscenso
            // 
            this.lblBoxAscenso.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxAscenso.LocationFloat = new DevExpress.Utils.PointFloat(442F, 32F);
            this.lblBoxAscenso.Name = "lblBoxAscenso";
            this.lblBoxAscenso.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxAscenso.StylePriority.UseTextAlignment = false;
            this.lblBoxAscenso.Text = " ";
            this.lblBoxAscenso.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // lblChkAscenso
            // 
            this.lblChkAscenso.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkAscenso.LocationFloat = new DevExpress.Utils.PointFloat(442F, 30F);
            this.lblChkAscenso.Name = "lblChkAscenso";
            this.lblChkAscenso.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkAscenso.StylePriority.UseTextAlignment = false;
            this.lblChkAscenso.Text = " ";
            this.lblChkAscenso.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtAscenso
            // 
            this.lblTxtAscenso.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblTxtAscenso.LocationFloat = new DevExpress.Utils.PointFloat(460F, 28F);
            this.lblTxtAscenso.Name = "lblTxtAscenso";
            this.lblTxtAscenso.SizeF = new System.Drawing.SizeF(90F, 18F);
            this.lblTxtAscenso.StylePriority.UseTextAlignment = false;
            this.lblTxtAscenso.Text = "ASCENSO";
            this.lblTxtAscenso.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblBoxTraslado
            // 
            this.lblBoxTraslado.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxTraslado.LocationFloat = new DevExpress.Utils.PointFloat(572F, 32F);
            this.lblBoxTraslado.Name = "lblBoxTraslado";
            this.lblBoxTraslado.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxTraslado.StylePriority.UseTextAlignment = false;
            this.lblBoxTraslado.Text = " ";
            this.lblBoxTraslado.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // lblChkTraslado
            // 
            this.lblChkTraslado.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkTraslado.LocationFloat = new DevExpress.Utils.PointFloat(572F, 30F);
            this.lblChkTraslado.Name = "lblChkTraslado";
            this.lblChkTraslado.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkTraslado.StylePriority.UseTextAlignment = false;
            this.lblChkTraslado.Text = " ";
            this.lblChkTraslado.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtTraslado
            // 
            this.lblTxtTraslado.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblTxtTraslado.LocationFloat = new DevExpress.Utils.PointFloat(590F, 28F);
            this.lblTxtTraslado.Name = "lblTxtTraslado";
            this.lblTxtTraslado.SizeF = new System.Drawing.SizeF(90F, 18F);
            this.lblTxtTraslado.StylePriority.UseTextAlignment = false;
            this.lblTxtTraslado.Text = "TRASLADO";
            this.lblTxtTraslado.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblNombrePref
            // 
            this.lblNombrePref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblNombrePref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 60F);
            this.lblNombrePref.Name = "lblNombrePref";
            this.lblNombrePref.SizeF = new System.Drawing.SizeF(140F, 18F);
            this.lblNombrePref.Text = "NOMBRE COMPLETO:";
            // 
            // lblNombre
            // 
            this.lblNombre.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblNombre.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_COMPLETO]")});
            this.lblNombre.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblNombre.LocationFloat = new DevExpress.Utils.PointFloat(151.0002F, 60.00001F);
            this.lblNombre.Name = "lblNombre";
            this.lblNombre.SizeF = new System.Drawing.SizeF(608.9999F, 18F);
            // 
            // lblIdPref
            // 
            this.lblIdPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblIdPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 84F);
            this.lblIdPref.Name = "lblIdPref";
            this.lblIdPref.SizeF = new System.Drawing.SizeF(110F, 18F);
            this.lblIdPref.Text = "NÚMERO DE ID:";
            // 
            // lblNumeroId
            // 
            this.lblNumeroId.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblNumeroId.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NUMERO_ID]")});
            this.lblNumeroId.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblNumeroId.LocationFloat = new DevExpress.Utils.PointFloat(121.0002F, 84.00002F);
            this.lblNumeroId.Name = "lblNumeroId";
            this.lblNumeroId.SizeF = new System.Drawing.SizeF(229.9998F, 18F);
            // 
            // lblIngresoPref
            // 
            this.lblIngresoPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblIngresoPref.LocationFloat = new DevExpress.Utils.PointFloat(390F, 84F);
            this.lblIngresoPref.Name = "lblIngresoPref";
            this.lblIngresoPref.SizeF = new System.Drawing.SizeF(210F, 18F);
            this.lblIngresoPref.Text = "FECHA DE INGRESO PROPUESTA:";
            // 
            // lblFechaIngreso
            // 
            this.lblFechaIngreso.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblFechaIngreso.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[FECHA_INGRESO_PROPUESTA]")});
            this.lblFechaIngreso.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblFechaIngreso.LocationFloat = new DevExpress.Utils.PointFloat(600F, 84F);
            this.lblFechaIngreso.Name = "lblFechaIngreso";
            this.lblFechaIngreso.SizeF = new System.Drawing.SizeF(160F, 18F);
            this.lblFechaIngreso.TextFormatString = "{0:dd/MM/yyyy}";
            // 
            // lblFinPref
            // 
            this.lblFinPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblFinPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 108F);
            this.lblFinPref.Name = "lblFinPref";
            this.lblFinPref.SizeF = new System.Drawing.SizeF(280F, 18F);
            this.lblFinPref.Text = "FECHA DE FINALIZACIÓN (puesto eventual):";
            // 
            // lblFechaFinalizacion
            // 
            this.lblFechaFinalizacion.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblFechaFinalizacion.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[FECHA_FINALIZACION]")});
            this.lblFechaFinalizacion.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblFechaFinalizacion.LocationFloat = new DevExpress.Utils.PointFloat(291F, 108F);
            this.lblFechaFinalizacion.Name = "lblFechaFinalizacion";
            this.lblFechaFinalizacion.SizeF = new System.Drawing.SizeF(160F, 18F);
            this.lblFechaFinalizacion.TextFormatString = "{0:dd/MM/yyyy}";
            // 
            // lblColActual
            // 
            this.lblColActual.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblColActual.LocationFloat = new DevExpress.Utils.PointFloat(11F, 138F);
            this.lblColActual.Name = "lblColActual";
            this.lblColActual.SizeF = new System.Drawing.SizeF(340F, 18F);
            this.lblColActual.Text = "CONTRATACIÓN O POSICIÓN ACTUAL";
            // 
            // lblColPropuesta
            // 
            this.lblColPropuesta.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblColPropuesta.LocationFloat = new DevExpress.Utils.PointFloat(420F, 138F);
            this.lblColPropuesta.Name = "lblColPropuesta";
            this.lblColPropuesta.SizeF = new System.Drawing.SizeF(340F, 18F);
            this.lblColPropuesta.Text = "POSICIÓN PROPUESTA";
            // 
            // lblCargoActPref
            // 
            this.lblCargoActPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblCargoActPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 162F);
            this.lblCargoActPref.Name = "lblCargoActPref";
            this.lblCargoActPref.SizeF = new System.Drawing.SizeF(55F, 18F);
            this.lblCargoActPref.Text = "CARGO:";
            // 
            // lblCargoAct
            // 
            this.lblCargoAct.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblCargoAct.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_PUESTO_ACTUAL]")});
            this.lblCargoAct.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblCargoAct.LocationFloat = new DevExpress.Utils.PointFloat(66F, 162F);
            this.lblCargoAct.Name = "lblCargoAct";
            this.lblCargoAct.SizeF = new System.Drawing.SizeF(285F, 18F);
            // 
            // lblCargoPropPref
            // 
            this.lblCargoPropPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblCargoPropPref.LocationFloat = new DevExpress.Utils.PointFloat(420F, 162F);
            this.lblCargoPropPref.Name = "lblCargoPropPref";
            this.lblCargoPropPref.SizeF = new System.Drawing.SizeF(55F, 18F);
            this.lblCargoPropPref.Text = "CARGO:";
            // 
            // lblCargoProp
            // 
            this.lblCargoProp.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblCargoProp.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_PUESTO_PROPUESTO]")});
            this.lblCargoProp.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblCargoProp.LocationFloat = new DevExpress.Utils.PointFloat(475F, 162F);
            this.lblCargoProp.Name = "lblCargoProp";
            this.lblCargoProp.SizeF = new System.Drawing.SizeF(285F, 18F);
            // 
            // lblGerenciaActPref
            // 
            this.lblGerenciaActPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblGerenciaActPref.LocationFloat = new DevExpress.Utils.PointFloat(11.00006F, 186F);
            this.lblGerenciaActPref.Name = "lblGerenciaActPref";
            this.lblGerenciaActPref.SizeF = new System.Drawing.SizeF(223.9583F, 18F);
            this.lblGerenciaActPref.Text = "GERENCIA/VICERRECTORÍA/FACULTAD:";
            // 
            // lblGerenciaAct
            // 
            this.lblGerenciaAct.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblGerenciaAct.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[GERENCIA_ACTUAL]")});
            this.lblGerenciaAct.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblGerenciaAct.LocationFloat = new DevExpress.Utils.PointFloat(11F, 204F);
            this.lblGerenciaAct.Name = "lblGerenciaAct";
            this.lblGerenciaAct.SizeF = new System.Drawing.SizeF(340F, 18F);
            // 
            // lblGerenciaPropPref
            // 
            this.lblGerenciaPropPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblGerenciaPropPref.LocationFloat = new DevExpress.Utils.PointFloat(420F, 186F);
            this.lblGerenciaPropPref.Name = "lblGerenciaPropPref";
            this.lblGerenciaPropPref.SizeF = new System.Drawing.SizeF(220F, 18F);
            this.lblGerenciaPropPref.Text = "GERENCIA/VICERRECTORÍA/FACULTAD:";
            // 
            // lblGerenciaProp
            // 
            this.lblGerenciaProp.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblGerenciaProp.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[GERENCIA_PROPUESTA]")});
            this.lblGerenciaProp.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblGerenciaProp.LocationFloat = new DevExpress.Utils.PointFloat(420F, 204F);
            this.lblGerenciaProp.Name = "lblGerenciaProp";
            this.lblGerenciaProp.SizeF = new System.Drawing.SizeF(340F, 18F);
            // 
            // lblDeptoActPref
            // 
            this.lblDeptoActPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblDeptoActPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 228F);
            this.lblDeptoActPref.Name = "lblDeptoActPref";
            this.lblDeptoActPref.SizeF = new System.Drawing.SizeF(100F, 18F);
            this.lblDeptoActPref.Text = "DEPARTAMENTO:";
            // 
            // lblDeptoAct
            // 
            this.lblDeptoAct.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblDeptoAct.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_UNIDAD_ACTUAL]")});
            this.lblDeptoAct.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblDeptoAct.LocationFloat = new DevExpress.Utils.PointFloat(111F, 228F);
            this.lblDeptoAct.Name = "lblDeptoAct";
            this.lblDeptoAct.SizeF = new System.Drawing.SizeF(240F, 18F);
            // 
            // lblDeptoPropPref
            // 
            this.lblDeptoPropPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblDeptoPropPref.LocationFloat = new DevExpress.Utils.PointFloat(420F, 228F);
            this.lblDeptoPropPref.Name = "lblDeptoPropPref";
            this.lblDeptoPropPref.SizeF = new System.Drawing.SizeF(100F, 18F);
            this.lblDeptoPropPref.Text = "DEPARTAMENTO:";
            // 
            // lblDeptoProp
            // 
            this.lblDeptoProp.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblDeptoProp.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_UNIDAD_PROPUESTA]")});
            this.lblDeptoProp.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblDeptoProp.LocationFloat = new DevExpress.Utils.PointFloat(520F, 228F);
            this.lblDeptoProp.Name = "lblDeptoProp";
            this.lblDeptoProp.SizeF = new System.Drawing.SizeF(240F, 18F);
            // 
            // lblSalarioActPref
            // 
            this.lblSalarioActPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblSalarioActPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 252F);
            this.lblSalarioActPref.Name = "lblSalarioActPref";
            this.lblSalarioActPref.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblSalarioActPref.Text = "SALARIO MENSUAL:";
            // 
            // lblSalarioAct
            // 
            this.lblSalarioAct.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblSalarioAct.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[SALARIO_ACTUAL]")});
            this.lblSalarioAct.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblSalarioAct.LocationFloat = new DevExpress.Utils.PointFloat(131F, 252F);
            this.lblSalarioAct.Name = "lblSalarioAct";
            this.lblSalarioAct.SizeF = new System.Drawing.SizeF(220F, 18F);
            this.lblSalarioAct.TextFormatString = "{0:n2}";
            // 
            // lblSalarioPropPref
            // 
            this.lblSalarioPropPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblSalarioPropPref.LocationFloat = new DevExpress.Utils.PointFloat(420F, 252F);
            this.lblSalarioPropPref.Name = "lblSalarioPropPref";
            this.lblSalarioPropPref.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblSalarioPropPref.Text = "SALARIO MENSUAL:";
            // 
            // lblSalarioProp
            // 
            this.lblSalarioProp.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblSalarioProp.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[SALARIO_PROPUESTO]")});
            this.lblSalarioProp.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblSalarioProp.LocationFloat = new DevExpress.Utils.PointFloat(540F, 252F);
            this.lblSalarioProp.Name = "lblSalarioProp";
            this.lblSalarioProp.SizeF = new System.Drawing.SizeF(220F, 18F);
            this.lblSalarioProp.TextFormatString = "{0:n2}";
            // 
            // lblModalidadActPref
            // 
            this.lblModalidadActPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblModalidadActPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 276F);
            this.lblModalidadActPref.Name = "lblModalidadActPref";
            this.lblModalidadActPref.SizeF = new System.Drawing.SizeF(150F, 18F);
            this.lblModalidadActPref.Text = "MODALIDAD DE TRABAJO:";
            // 
            // lblModalidadAct
            // 
            this.lblModalidadAct.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblModalidadAct.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_MODALIDAD_ACTUAL]")});
            this.lblModalidadAct.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblModalidadAct.LocationFloat = new DevExpress.Utils.PointFloat(161F, 276F);
            this.lblModalidadAct.Name = "lblModalidadAct";
            this.lblModalidadAct.SizeF = new System.Drawing.SizeF(190F, 18F);
            // 
            // lblModalidadPropPref
            // 
            this.lblModalidadPropPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblModalidadPropPref.LocationFloat = new DevExpress.Utils.PointFloat(420F, 276F);
            this.lblModalidadPropPref.Name = "lblModalidadPropPref";
            this.lblModalidadPropPref.SizeF = new System.Drawing.SizeF(150F, 18F);
            this.lblModalidadPropPref.Text = "MODALIDAD DE TRABAJO:";
            // 
            // lblModalidadProp
            // 
            this.lblModalidadProp.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblModalidadProp.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_MODALIDAD_PROPUESTA]")});
            this.lblModalidadProp.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblModalidadProp.LocationFloat = new DevExpress.Utils.PointFloat(570F, 276F);
            this.lblModalidadProp.Name = "lblModalidadProp";
            this.lblModalidadProp.SizeF = new System.Drawing.SizeF(190F, 18F);
            // 
            // lblHorarioActPref
            // 
            this.lblHorarioActPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblHorarioActPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 300F);
            this.lblHorarioActPref.Name = "lblHorarioActPref";
            this.lblHorarioActPref.SizeF = new System.Drawing.SizeF(140F, 18F);
            this.lblHorarioActPref.Text = "HORARIO DE TRABAJO:";
            // 
            // lblHorarioAct
            // 
            this.lblHorarioAct.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblHorarioAct.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[HORARIO_ACTUAL]")});
            this.lblHorarioAct.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblHorarioAct.LocationFloat = new DevExpress.Utils.PointFloat(151F, 300F);
            this.lblHorarioAct.Name = "lblHorarioAct";
            this.lblHorarioAct.SizeF = new System.Drawing.SizeF(200F, 18F);
            // 
            // lblHorarioPropPref
            // 
            this.lblHorarioPropPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblHorarioPropPref.LocationFloat = new DevExpress.Utils.PointFloat(420F, 300F);
            this.lblHorarioPropPref.Name = "lblHorarioPropPref";
            this.lblHorarioPropPref.SizeF = new System.Drawing.SizeF(140F, 18F);
            this.lblHorarioPropPref.Text = "HORARIO DE TRABAJO:";
            // 
            // lblHorarioProp
            // 
            this.lblHorarioProp.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblHorarioProp.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[HORARIO_PROPUESTO]")});
            this.lblHorarioProp.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.lblHorarioProp.LocationFloat = new DevExpress.Utils.PointFloat(560F, 300F);
            this.lblHorarioProp.Name = "lblHorarioProp";
            this.lblHorarioProp.SizeF = new System.Drawing.SizeF(200F, 18F);
            // 
            // lblJustificacionPref
            // 
            this.lblJustificacionPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblJustificacionPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 332F);
            this.lblJustificacionPref.Name = "lblJustificacionPref";
            this.lblJustificacionPref.SizeF = new System.Drawing.SizeF(140F, 18F);
            this.lblJustificacionPref.Text = "JUSTIFICACIÓN:";
            // 
            // lblJustificacion
            // 
            this.lblJustificacion.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblJustificacion.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[JUSTIFICACION]")});
            this.lblJustificacion.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblJustificacion.LocationFloat = new DevExpress.Utils.PointFloat(11.00006F, 352.0001F);
            this.lblJustificacion.Multiline = true;
            this.lblJustificacion.Name = "lblJustificacion";
            this.lblJustificacion.SizeF = new System.Drawing.SizeF(749.0001F, 55.99997F);
            // 
            // lblAprobaciones
            // 
            this.lblAprobaciones.Font = new DevExpress.Drawing.DXFont("Arial", 10F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblAprobaciones.LocationFloat = new DevExpress.Utils.PointFloat(11F, 420F);
            this.lblAprobaciones.Name = "lblAprobaciones";
            this.lblAprobaciones.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblAprobaciones.Text = "APROBACIONES";
            // 
            // lblJefePref
            // 
            this.lblJefePref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblJefePref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 446F);
            this.lblJefePref.Name = "lblJefePref";
            this.lblJefePref.SizeF = new System.Drawing.SizeF(160F, 18F);
            this.lblJefePref.Text = "JEFE INMEDIATO:";
            // 
            // lblJefeFirma
            // 
            this.lblJefeFirma.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblJefeFirma.LocationFloat = new DevExpress.Utils.PointFloat(171.0002F, 446F);
            this.lblJefeFirma.Name = "lblJefeFirma";
            this.lblJefeFirma.SizeF = new System.Drawing.SizeF(230F, 18F);
            this.lblJefeFirma.Text = "Firma";
            // 
            // lblJefeFecha
            // 
            this.lblJefeFecha.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblJefeFecha.LocationFloat = new DevExpress.Utils.PointFloat(441.8027F, 446F);
            this.lblJefeFecha.Name = "lblJefeFecha";
            this.lblJefeFecha.SizeF = new System.Drawing.SizeF(318.1974F, 18F);
            this.lblJefeFecha.Text = "Fecha";
            // 
            // lblDecanoPref
            // 
            this.lblDecanoPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblDecanoPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 472F);
            this.lblDecanoPref.Name = "lblDecanoPref";
            this.lblDecanoPref.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblDecanoPref.Text = "DECANO, DIRECTOR, GERENTE:";
            // 
            // lblDecanoFirma
            // 
            this.lblDecanoFirma.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblDecanoFirma.LocationFloat = new DevExpress.Utils.PointFloat(211.0001F, 472F);
            this.lblDecanoFirma.Name = "lblDecanoFirma";
            this.lblDecanoFirma.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblDecanoFirma.Text = "Firma";
            // 
            // lblDecanoFecha
            // 
            this.lblDecanoFecha.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblDecanoFecha.LocationFloat = new DevExpress.Utils.PointFloat(451.8028F, 472F);
            this.lblDecanoFecha.Name = "lblDecanoFecha";
            this.lblDecanoFecha.SizeF = new System.Drawing.SizeF(308.1973F, 18F);
            this.lblDecanoFecha.Text = "Fecha";
            // 
            // lblVraPref
            // 
            this.lblVraPref.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblVraPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 498F);
            this.lblVraPref.Name = "lblVraPref";
            this.lblVraPref.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblVraPref.Text = "VRA / VRITE / VRIV / GG / DIGGEI:";
            // 
            // lblVraFirma
            // 
            this.lblVraFirma.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblVraFirma.LocationFloat = new DevExpress.Utils.PointFloat(211.0001F, 498F);
            this.lblVraFirma.Name = "lblVraFirma";
            this.lblVraFirma.SizeF = new System.Drawing.SizeF(200F, 17.99997F);
            this.lblVraFirma.Text = "Firma";
            // 
            // lblVraFecha
            // 
            this.lblVraFecha.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblVraFecha.LocationFloat = new DevExpress.Utils.PointFloat(451.8028F, 498F);
            this.lblVraFecha.Name = "lblVraFecha";
            this.lblVraFecha.SizeF = new System.Drawing.SizeF(308.1973F, 17.99997F);
            this.lblVraFecha.Text = "Fecha";
            // 
            // lblFechaEfectivaPref
            // 
            this.lblFechaEfectivaPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblFechaEfectivaPref.LocationFloat = new DevExpress.Utils.PointFloat(11F, 532F);
            this.lblFechaEfectivaPref.Name = "lblFechaEfectivaPref";
            this.lblFechaEfectivaPref.SizeF = new System.Drawing.SizeF(240F, 18F);
            this.lblFechaEfectivaPref.Text = "FECHA EFECTIVA DE MOVIMIENTO:";
            // 
            // lblFechaEfectiva
            // 
            this.lblFechaEfectiva.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblFechaEfectiva.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[FECHA_EFECTIVA]")});
            this.lblFechaEfectiva.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblFechaEfectiva.LocationFloat = new DevExpress.Utils.PointFloat(251F, 532F);
            this.lblFechaEfectiva.Name = "lblFechaEfectiva";
            this.lblFechaEfectiva.SizeF = new System.Drawing.SizeF(160F, 18F);
            this.lblFechaEfectiva.TextFormatString = "{0:dd/MM/yyyy}";
            // 
            // PageHeader
            // 
            this.PageHeader.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabel1,
            this.lblHdrReq,
            this.xrPictureBox1,
            this.lineHdr});
            this.PageHeader.HeightF = 94.99998F;
            this.PageHeader.Name = "PageHeader";
            // 
            // xrLabel1
            // 
            this.xrLabel1.BackColor = System.Drawing.Color.Gold;
            this.xrLabel1.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.xrLabel1.Font = new DevExpress.Drawing.DXFont("Arial", 11F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabel1.LocationFloat = new DevExpress.Utils.PointFloat(441.8027F, 0F);
            this.xrLabel1.Name = "xrLabel1";
            this.xrLabel1.Padding = new DevExpress.XtraPrinting.PaddingInfo(4, 4, 0, 0, 100F);
            this.xrLabel1.SizeF = new System.Drawing.SizeF(328.1973F, 90F);
            this.xrLabel1.StylePriority.UseBackColor = false;
            this.xrLabel1.Text = "Movimiento de Personal";
            this.xrLabel1.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblHdrReq
            // 
            this.lblHdrReq.BackColor = System.Drawing.Color.Gold;
            this.lblHdrReq.Borders = ((DevExpress.XtraPrinting.BorderSide)((DevExpress.XtraPrinting.BorderSide.Top | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblHdrReq.Font = new DevExpress.Drawing.DXFont("Arial", 11F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblHdrReq.LocationFloat = new DevExpress.Utils.PointFloat(89.9999F, 0F);
            this.lblHdrReq.Name = "lblHdrReq";
            this.lblHdrReq.Padding = new DevExpress.XtraPrinting.PaddingInfo(4, 4, 0, 0, 100F);
            this.lblHdrReq.SizeF = new System.Drawing.SizeF(351.8028F, 90F);
            this.lblHdrReq.StylePriority.UseBackColor = false;
            this.lblHdrReq.StylePriority.UseBorders = false;
            this.lblHdrReq.Text = "DEPARTAMENTO DE TALENTO HUMANO";
            this.lblHdrReq.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // xrPictureBox1
            // 
            this.xrPictureBox1.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.xrPictureBox1.ImageSource = new DevExpress.XtraPrinting.Drawing.ImageSource("img", resources.GetString("xrPictureBox1.ImageSource"));
            this.xrPictureBox1.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
            this.xrPictureBox1.Name = "xrPictureBox1";
            this.xrPictureBox1.SizeF = new System.Drawing.SizeF(89.9999F, 89.99999F);
            this.xrPictureBox1.Sizing = DevExpress.XtraPrinting.ImageSizeMode.ZoomImage;
            this.xrPictureBox1.StylePriority.UseBorders = false;
            // 
            // lineHdr
            // 
            this.lineHdr.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(0)))), ((int)(((byte)(51)))), ((int)(((byte)(102)))));
            this.lineHdr.LineWidth = 3F;
            this.lineHdr.LocationFloat = new DevExpress.Utils.PointFloat(0F, 89.99998F);
            this.lineHdr.Name = "lineHdr";
            this.lineHdr.SizeF = new System.Drawing.SizeF(770.0001F, 5F);
            // 
            // PageFooter
            // 
            this.PageFooter.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabel2,
            this.xrLabel3});
            this.PageFooter.HeightF = 38.95829F;
            this.PageFooter.Name = "PageFooter";
            // 
            // lblFechaElabPref
            // 
            this.lblFechaElabPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblFechaElabPref.LocationFloat = new DevExpress.Utils.PointFloat(480F, 0F);
            this.lblFechaElabPref.Name = "lblFechaElabPref";
            this.lblFechaElabPref.SizeF = new System.Drawing.SizeF(160F, 18F);
            this.lblFechaElabPref.Text = "FECHA DE ELABORACIÓN:";
            this.lblFechaElabPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // xrLabel2
            // 
            this.xrLabel2.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabel2.LocationFloat = new DevExpress.Utils.PointFloat(11.00006F, 0F);
            this.xrLabel2.Name = "xrLabel2";
            this.xrLabel2.SizeF = new System.Drawing.SizeF(749.0001F, 18F);
            this.xrLabel2.Text = "Talento Humano";
            this.xrLabel2.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // xrLabel3
            // 
            this.xrLabel3.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.xrLabel3.LocationFloat = new DevExpress.Utils.PointFloat(11.00006F, 18F);
            this.xrLabel3.Name = "xrLabel3";
            this.xrLabel3.SizeF = new System.Drawing.SizeF(749.0001F, 18F);
            this.xrLabel3.Text = "Universidad Evangelica de El Salvador";
            this.xrLabel3.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // rptMovimientoPersonal
            // 
            this.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.topMarginBand1,
            this.detailBand1,
            this.bottomMarginBand1,
            this.PageHeader,
            this.PageFooter});
            this.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.Margins = new DevExpress.Drawing.DXMargins(40F, 40F, 20F, 20F);
            this.Version = "24.2";
            xrWatermark1.Id = "Watermark1";
            this.Watermarks.AddRange(new DevExpress.XtraPrinting.Drawing.Watermark[] {
            xrWatermark1});
            ((System.ComponentModel.ISupportInitialize)(this)).EndInit();

		}

        private PageHeaderBand PageHeader;
        private XRLabel xrLabel1;
        private XRLabel lblHdrReq;
        private XRPictureBox xrPictureBox1;
        private XRLine lineHdr;
        private XRLabel lblFechaElabPref;
        private PageFooterBand PageFooter;
        private XRLabel xrLabel2;
        private XRLabel xrLabel3;
    }
}
