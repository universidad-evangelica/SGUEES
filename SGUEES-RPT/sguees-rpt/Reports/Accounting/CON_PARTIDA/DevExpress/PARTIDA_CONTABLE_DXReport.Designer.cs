using System.ComponentModel;
using System.Drawing;
using DevExpress.XtraPrinting;
using DevExpress.XtraReports.UI;

namespace sgueesRpt.Reports.Accounting.CON_PARTIDA.DxReports
{
	partial class PARTIDA_CONTABLE_DXReport
	{
		private IContainer components = null;

		private TopMarginBand topMarginBand1;
		private BottomMarginBand bottomMarginBand1;
		private GroupHeaderBand groupHeaderPartida;
		private PageHeaderBand pageHeaderBand1;
		private DetailBand detailBand1;
		private GroupFooterBand groupFooterPartida;
		private ReportFooterBand reportFooterBand1;
		private XRLabel xrLabelEmpresa;
		private XRLabel xrLabelTitulo;
		private XRLabel xrLabelPartidaNo;
		private XRLabel xrLabelFechaPrefix;
		private XRLabel xrLabelFecha;
		private XRLabel xrLabelDocumento;
		private XRLabel xrLabelClase;
		private XRLabel xrLabelEstado;
		private XRLabel xrLabelConceptoPrefix;
		private XRLabel xrLabelConcepto;
		private XRLine xrLineGroupHeader;
		private XRLine xrLinePageHeader;
		private XRLabel xrLabelCuenta;
		private XRLabel xrLabelNombreCuenta;
		private XRLabel xrLabelNombreTran;
		private XRLabel xrLabelCargo;
		private XRLabel xrLabelAbono;
		private XRLine xrLineFooterTop;
		private XRLabel xrLabelTotalPrefix;
		private XRLabel xrLabelTotalCargo;
		private XRLabel xrLabelTotalAbono;
		private XRLine xrLineFooterBottom;
		private XRLabel xrLabelDigitadoUser;
		private XRLine xrLineDigitado;
		private XRLabel xrLabelDigitado;
		private XRLine xrLineRevisado;
		private XRLabel xrLabelRevisado;
		private XRLine xrLineAutorizado;
		private XRLabel xrLabelAutorizado;

		protected override void Dispose(bool disposing)
		{
			if (disposing && components != null)
			{
				components.Dispose();
			}

			base.Dispose(disposing);
		}

		private void InitializeComponent()
		{
            DevExpress.XtraReports.UI.XRSummary xrSummary1 = new DevExpress.XtraReports.UI.XRSummary();
            DevExpress.XtraReports.UI.XRSummary xrSummary2 = new DevExpress.XtraReports.UI.XRSummary();
            this.topMarginBand1 = new DevExpress.XtraReports.UI.TopMarginBand();
            this.bottomMarginBand1 = new DevExpress.XtraReports.UI.BottomMarginBand();
            this.groupHeaderPartida = new DevExpress.XtraReports.UI.GroupHeaderBand();
            this.xrLabelEmpresa = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelTitulo = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelPartidaNo = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelFechaPrefix = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelFecha = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelDocumento = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelClase = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelEstado = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelConceptoPrefix = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelConcepto = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLineGroupHeader = new DevExpress.XtraReports.UI.XRLine();
            this.pageHeaderBand1 = new DevExpress.XtraReports.UI.PageHeaderBand();
            this.xrLinePageHeader = new DevExpress.XtraReports.UI.XRLine();
            this.detailBand1 = new DevExpress.XtraReports.UI.DetailBand();
            this.xrLabelCuenta = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelNombreCuenta = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelNombreTran = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelCargo = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelAbono = new DevExpress.XtraReports.UI.XRLabel();
            this.groupFooterPartida = new DevExpress.XtraReports.UI.GroupFooterBand();
            this.xrLineFooterTop = new DevExpress.XtraReports.UI.XRLine();
            this.xrLabelTotalPrefix = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelTotalCargo = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelTotalAbono = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLineFooterBottom = new DevExpress.XtraReports.UI.XRLine();
            this.reportFooterBand1 = new DevExpress.XtraReports.UI.ReportFooterBand();
            this.xrLabelDigitadoUser = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLineDigitado = new DevExpress.XtraReports.UI.XRLine();
            this.xrLabelDigitado = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLineRevisado = new DevExpress.XtraReports.UI.XRLine();
            this.xrLabelRevisado = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLineAutorizado = new DevExpress.XtraReports.UI.XRLine();
            this.xrLabelAutorizado = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelHdrCuenta = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelHdrDetalle = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelHdrCargo = new DevExpress.XtraReports.UI.XRLabel();
            this.xrLabelHdrAbono = new DevExpress.XtraReports.UI.XRLabel();
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
            // groupHeaderPartida
            // 
            this.groupHeaderPartida.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabelHdrAbono,
            this.xrLabelHdrCargo,
            this.xrLabelHdrCuenta,
            this.xrLabelHdrDetalle,
            this.xrLabelEmpresa,
            this.xrLabelTitulo,
            this.xrLabelPartidaNo,
            this.xrLabelFechaPrefix,
            this.xrLabelFecha,
            this.xrLabelDocumento,
            this.xrLabelClase,
            this.xrLabelEstado,
            this.xrLabelConceptoPrefix,
            this.xrLabelConcepto,
            this.xrLineGroupHeader});
            this.groupHeaderPartida.GroupFields.AddRange(new DevExpress.XtraReports.UI.GroupField[] {
            new DevExpress.XtraReports.UI.GroupField("CORR_PARTIDA", DevExpress.XtraReports.UI.XRColumnSortOrder.Ascending)});
            this.groupHeaderPartida.HeightF = 118F;
            this.groupHeaderPartida.Name = "groupHeaderPartida";
            this.groupHeaderPartida.RepeatEveryPage = true;
            // 
            // xrLabelEmpresa
            // 
            this.xrLabelEmpresa.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?NOMBRE_EMPRESA")});
            this.xrLabelEmpresa.Font = new DevExpress.Drawing.DXFont("Arial", 10F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelEmpresa.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
            this.xrLabelEmpresa.Name = "xrLabelEmpresa";
            this.xrLabelEmpresa.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelEmpresa.SizeF = new System.Drawing.SizeF(280F, 18F);
            this.xrLabelEmpresa.Text = "?NOMBRE_EMPRESA";
            // 
            // xrLabelTitulo
            // 
            this.xrLabelTitulo.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?TITULO_REPORTE")});
            this.xrLabelTitulo.Font = new DevExpress.Drawing.DXFont("Arial", 14F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelTitulo.LocationFloat = new DevExpress.Utils.PointFloat(250F, 0F);
            this.xrLabelTitulo.Name = "xrLabelTitulo";
            this.xrLabelTitulo.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelTitulo.SizeF = new System.Drawing.SizeF(250F, 22F);
            this.xrLabelTitulo.Text = "?TITULO_REPORTE";
            this.xrLabelTitulo.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // xrLabelPartidaNo
            // 
            this.xrLabelPartidaNo.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "\'Partida No. \' + [NUMERO_PARTIDA]")});
            this.xrLabelPartidaNo.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelPartidaNo.LocationFloat = new DevExpress.Utils.PointFloat(586F, 0F);
            this.xrLabelPartidaNo.Name = "xrLabelPartidaNo";
            this.xrLabelPartidaNo.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelPartidaNo.SizeF = new System.Drawing.SizeF(164F, 18F);
            this.xrLabelPartidaNo.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            // 
            // xrLabelFechaPrefix
            // 
            this.xrLabelFechaPrefix.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelFechaPrefix.LocationFloat = new DevExpress.Utils.PointFloat(210F, 24F);
            this.xrLabelFechaPrefix.Name = "xrLabelFechaPrefix";
            this.xrLabelFechaPrefix.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelFechaPrefix.SizeF = new System.Drawing.SizeF(40F, 16F);
            this.xrLabelFechaPrefix.Text = "Fecha";
            this.xrLabelFechaPrefix.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            // 
            // xrLabelFecha
            // 
            this.xrLabelFecha.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[FECHA_PARTIDA]")});
            this.xrLabelFecha.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelFecha.LocationFloat = new DevExpress.Utils.PointFloat(250F, 24F);
            this.xrLabelFecha.Name = "xrLabelFecha";
            this.xrLabelFecha.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelFecha.SizeF = new System.Drawing.SizeF(250F, 16F);
            this.xrLabelFecha.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            this.xrLabelFecha.TextFormatString = "{0:d/M/yyyy}";
            // 
            // xrLabelDocumento
            // 
            this.xrLabelDocumento.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "\'Documento No. \' + [NUMERO_DOCUMENTO]")});
            this.xrLabelDocumento.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelDocumento.LocationFloat = new DevExpress.Utils.PointFloat(200F, 40F);
            this.xrLabelDocumento.Name = "xrLabelDocumento";
            this.xrLabelDocumento.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelDocumento.SizeF = new System.Drawing.SizeF(350F, 16F);
            this.xrLabelDocumento.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // xrLabelClase
            // 
            this.xrLabelClase.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "\'Clase : \' + [CLASE_PARTIDA]")});
            this.xrLabelClase.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelClase.LocationFloat = new DevExpress.Utils.PointFloat(502F, 24F);
            this.xrLabelClase.Name = "xrLabelClase";
            this.xrLabelClase.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelClase.SizeF = new System.Drawing.SizeF(164F, 16F);
            this.xrLabelClase.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            // 
            // xrLabelEstado
            // 
            this.xrLabelEstado.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_ESTADO_PARTIDA]")});
            this.xrLabelEstado.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelEstado.LocationFloat = new DevExpress.Utils.PointFloat(502F, 40F);
            this.xrLabelEstado.Name = "xrLabelEstado";
            this.xrLabelEstado.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelEstado.SizeF = new System.Drawing.SizeF(164F, 16F);
            this.xrLabelEstado.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            // 
            // xrLabelConceptoPrefix
            // 
            this.xrLabelConceptoPrefix.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelConceptoPrefix.LocationFloat = new DevExpress.Utils.PointFloat(0F, 62F);
            this.xrLabelConceptoPrefix.Name = "xrLabelConceptoPrefix";
            this.xrLabelConceptoPrefix.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelConceptoPrefix.SizeF = new System.Drawing.SizeF(70F, 16F);
            this.xrLabelConceptoPrefix.Text = "Concepto :";
            // 
            // xrLabelConcepto
            // 
            this.xrLabelConcepto.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_PARTIDA]")});
            this.xrLabelConcepto.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelConcepto.LocationFloat = new DevExpress.Utils.PointFloat(72F, 62F);
            this.xrLabelConcepto.Multiline = true;
            this.xrLabelConcepto.Name = "xrLabelConcepto";
            this.xrLabelConcepto.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelConcepto.SizeF = new System.Drawing.SizeF(678F, 32F);
            // 
            // xrLineGroupHeader
            // 
            this.xrLineGroupHeader.LocationFloat = new DevExpress.Utils.PointFloat(0F, 98F);
            this.xrLineGroupHeader.Name = "xrLineGroupHeader";
            this.xrLineGroupHeader.SizeF = new System.Drawing.SizeF(750F, 2F);
            // 
            // pageHeaderBand1
            // 
            this.pageHeaderBand1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLinePageHeader});
            this.pageHeaderBand1.HeightF = 20.25F;
            this.pageHeaderBand1.Name = "pageHeaderBand1";
            this.pageHeaderBand1.PrintOn = DevExpress.XtraReports.UI.PrintOnPages.NotWithReportHeader;
            // 
            // xrLinePageHeader
            // 
            this.xrLinePageHeader.LocationFloat = new DevExpress.Utils.PointFloat(3.178914E-05F, 9.999995F);
            this.xrLinePageHeader.Name = "xrLinePageHeader";
            this.xrLinePageHeader.SizeF = new System.Drawing.SizeF(750F, 2F);
            // 
            // detailBand1
            // 
            this.detailBand1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabelCuenta,
            this.xrLabelNombreCuenta,
            this.xrLabelNombreTran,
            this.xrLabelCargo,
            this.xrLabelAbono});
            this.detailBand1.HeightF = 38F;
            this.detailBand1.Name = "detailBand1";
            // 
            // xrLabelCuenta
            // 
            this.xrLabelCuenta.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[CUENTA_CONTABLE]")});
            this.xrLabelCuenta.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelCuenta.LocationFloat = new DevExpress.Utils.PointFloat(0F, 2F);
            this.xrLabelCuenta.Name = "xrLabelCuenta";
            this.xrLabelCuenta.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelCuenta.SizeF = new System.Drawing.SizeF(72F, 16F);
            // 
            // xrLabelNombreCuenta
            // 
            this.xrLabelNombreCuenta.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_CUENTA]")});
            this.xrLabelNombreCuenta.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelNombreCuenta.LocationFloat = new DevExpress.Utils.PointFloat(72F, 2F);
            this.xrLabelNombreCuenta.Name = "xrLabelNombreCuenta";
            this.xrLabelNombreCuenta.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelNombreCuenta.SizeF = new System.Drawing.SizeF(430F, 16F);
            // 
            // xrLabelNombreTran
            // 
            this.xrLabelNombreTran.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_TRAN]")});
            this.xrLabelNombreTran.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelNombreTran.LocationFloat = new DevExpress.Utils.PointFloat(72F, 18F);
            this.xrLabelNombreTran.Multiline = true;
            this.xrLabelNombreTran.Name = "xrLabelNombreTran";
            this.xrLabelNombreTran.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelNombreTran.SizeF = new System.Drawing.SizeF(430F, 18F);
            // 
            // xrLabelCargo
            // 
            this.xrLabelCargo.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[MONTO_CARGO]")});
            this.xrLabelCargo.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelCargo.LocationFloat = new DevExpress.Utils.PointFloat(502F, 2F);
            this.xrLabelCargo.Name = "xrLabelCargo";
            this.xrLabelCargo.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelCargo.SizeF = new System.Drawing.SizeF(124F, 16F);
            this.xrLabelCargo.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            this.xrLabelCargo.TextFormatString = "{0:n2}";
            // 
            // xrLabelAbono
            // 
            this.xrLabelAbono.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[MONTO_ABONO]")});
            this.xrLabelAbono.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelAbono.LocationFloat = new DevExpress.Utils.PointFloat(626F, 2F);
            this.xrLabelAbono.Name = "xrLabelAbono";
            this.xrLabelAbono.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelAbono.SizeF = new System.Drawing.SizeF(124F, 16F);
            this.xrLabelAbono.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            this.xrLabelAbono.TextFormatString = "{0:n2}";
            // 
            // groupFooterPartida
            // 
            this.groupFooterPartida.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLineFooterTop,
            this.xrLabelTotalPrefix,
            this.xrLabelTotalCargo,
            this.xrLabelTotalAbono,
            this.xrLineFooterBottom});
            this.groupFooterPartida.HeightF = 36F;
            this.groupFooterPartida.Name = "groupFooterPartida";
            // 
            // xrLineFooterTop
            // 
            this.xrLineFooterTop.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
            this.xrLineFooterTop.Name = "xrLineFooterTop";
            this.xrLineFooterTop.SizeF = new System.Drawing.SizeF(750F, 2F);
            // 
            // xrLabelTotalPrefix
            // 
            this.xrLabelTotalPrefix.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelTotalPrefix.LocationFloat = new DevExpress.Utils.PointFloat(382F, 6F);
            this.xrLabelTotalPrefix.Name = "xrLabelTotalPrefix";
            this.xrLabelTotalPrefix.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelTotalPrefix.SizeF = new System.Drawing.SizeF(110F, 18F);
            this.xrLabelTotalPrefix.Text = "Total Partida :";
            this.xrLabelTotalPrefix.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            // 
            // xrLabelTotalCargo
            // 
            this.xrLabelTotalCargo.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "sumSum([MONTO_CARGO])")});
            this.xrLabelTotalCargo.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelTotalCargo.LocationFloat = new DevExpress.Utils.PointFloat(502F, 6F);
            this.xrLabelTotalCargo.Name = "xrLabelTotalCargo";
            this.xrLabelTotalCargo.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelTotalCargo.SizeF = new System.Drawing.SizeF(124F, 18F);
            this.xrLabelTotalCargo.StylePriority.UseTextAlignment = false;
            xrSummary1.FormatString = "{0:n2}";
            xrSummary1.Running = DevExpress.XtraReports.UI.SummaryRunning.Group;
            this.xrLabelTotalCargo.Summary = xrSummary1;
            this.xrLabelTotalCargo.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            this.xrLabelTotalCargo.TextFormatString = "{0:n2}";
            // 
            // xrLabelTotalAbono
            // 
            this.xrLabelTotalAbono.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "sumSum([MONTO_ABONO])")});
            this.xrLabelTotalAbono.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelTotalAbono.LocationFloat = new DevExpress.Utils.PointFloat(626F, 6F);
            this.xrLabelTotalAbono.Name = "xrLabelTotalAbono";
            this.xrLabelTotalAbono.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelTotalAbono.SizeF = new System.Drawing.SizeF(124F, 18F);
            xrSummary2.FormatString = "{0:n2}";
            xrSummary2.Running = DevExpress.XtraReports.UI.SummaryRunning.Group;
            this.xrLabelTotalAbono.Summary = xrSummary2;
            this.xrLabelTotalAbono.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            this.xrLabelTotalAbono.TextFormatString = "{0:n2}";
            // 
            // xrLineFooterBottom
            // 
            this.xrLineFooterBottom.LocationFloat = new DevExpress.Utils.PointFloat(492F, 26F);
            this.xrLineFooterBottom.Name = "xrLineFooterBottom";
            this.xrLineFooterBottom.SizeF = new System.Drawing.SizeF(268F, 2F);
            // 
            // reportFooterBand1
            // 
            this.reportFooterBand1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabelDigitadoUser,
            this.xrLineDigitado,
            this.xrLabelDigitado,
            this.xrLineRevisado,
            this.xrLabelRevisado,
            this.xrLineAutorizado,
            this.xrLabelAutorizado});
            this.reportFooterBand1.HeightF = 72F;
            this.reportFooterBand1.Name = "reportFooterBand1";
            // 
            // xrLabelDigitadoUser
            // 
            this.xrLabelDigitadoUser.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?USUARIO_DIGITA")});
            this.xrLabelDigitadoUser.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.xrLabelDigitadoUser.LocationFloat = new DevExpress.Utils.PointFloat(0F, 10F);
            this.xrLabelDigitadoUser.Name = "xrLabelDigitadoUser";
            this.xrLabelDigitadoUser.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelDigitadoUser.SizeF = new System.Drawing.SizeF(230F, 14F);
            this.xrLabelDigitadoUser.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // xrLineDigitado
            // 
            this.xrLineDigitado.LocationFloat = new DevExpress.Utils.PointFloat(20F, 26F);
            this.xrLineDigitado.Name = "xrLineDigitado";
            this.xrLineDigitado.SizeF = new System.Drawing.SizeF(190F, 2F);
            // 
            // xrLabelDigitado
            // 
            this.xrLabelDigitado.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelDigitado.LocationFloat = new DevExpress.Utils.PointFloat(0F, 32F);
            this.xrLabelDigitado.Name = "xrLabelDigitado";
            this.xrLabelDigitado.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelDigitado.SizeF = new System.Drawing.SizeF(230F, 16F);
            this.xrLabelDigitado.Text = "Digitado Por";
            this.xrLabelDigitado.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // xrLineRevisado
            // 
            this.xrLineRevisado.LocationFloat = new DevExpress.Utils.PointFloat(280F, 26F);
            this.xrLineRevisado.Name = "xrLineRevisado";
            this.xrLineRevisado.SizeF = new System.Drawing.SizeF(190F, 2F);
            // 
            // xrLabelRevisado
            // 
            this.xrLabelRevisado.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelRevisado.LocationFloat = new DevExpress.Utils.PointFloat(260F, 32F);
            this.xrLabelRevisado.Name = "xrLabelRevisado";
            this.xrLabelRevisado.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelRevisado.SizeF = new System.Drawing.SizeF(230F, 16F);
            this.xrLabelRevisado.Text = "Revisado Por";
            this.xrLabelRevisado.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // xrLineAutorizado
            // 
            this.xrLineAutorizado.LocationFloat = new DevExpress.Utils.PointFloat(530F, 26F);
            this.xrLineAutorizado.Name = "xrLineAutorizado";
            this.xrLineAutorizado.SizeF = new System.Drawing.SizeF(200F, 2F);
            // 
            // xrLabelAutorizado
            // 
            this.xrLabelAutorizado.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelAutorizado.LocationFloat = new DevExpress.Utils.PointFloat(520F, 32F);
            this.xrLabelAutorizado.Name = "xrLabelAutorizado";
            this.xrLabelAutorizado.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelAutorizado.SizeF = new System.Drawing.SizeF(230F, 16F);
            this.xrLabelAutorizado.Text = "Autorizado Por";
            this.xrLabelAutorizado.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // xrLabelHdrCuenta
            // 
            this.xrLabelHdrCuenta.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelHdrCuenta.LocationFloat = new DevExpress.Utils.PointFloat(0.0001678467F, 99.99998F);
            this.xrLabelHdrCuenta.Name = "xrLabelHdrCuenta";
            this.xrLabelHdrCuenta.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelHdrCuenta.SizeF = new System.Drawing.SizeF(72F, 18F);
            this.xrLabelHdrCuenta.Text = "Cuenta Contable";
            // 
            // xrLabelHdrDetalle
            // 
            this.xrLabelHdrDetalle.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelHdrDetalle.LocationFloat = new DevExpress.Utils.PointFloat(72.00017F, 99.99998F);
            this.xrLabelHdrDetalle.Name = "xrLabelHdrDetalle";
            this.xrLabelHdrDetalle.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelHdrDetalle.SizeF = new System.Drawing.SizeF(430F, 18F);
            this.xrLabelHdrDetalle.Text = "Detalle de Transacción";
            // 
            // xrLabelHdrCargo
            // 
            this.xrLabelHdrCargo.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelHdrCargo.LocationFloat = new DevExpress.Utils.PointFloat(502.0001F, 99.99998F);
            this.xrLabelHdrCargo.Name = "xrLabelHdrCargo";
            this.xrLabelHdrCargo.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelHdrCargo.SizeF = new System.Drawing.SizeF(124F, 18F);
            this.xrLabelHdrCargo.Text = "Cargo";
            this.xrLabelHdrCargo.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            // 
            // xrLabelHdrAbono
            // 
            this.xrLabelHdrAbono.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabelHdrAbono.LocationFloat = new DevExpress.Utils.PointFloat(626F, 99.99998F);
            this.xrLabelHdrAbono.Name = "xrLabelHdrAbono";
            this.xrLabelHdrAbono.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabelHdrAbono.SizeF = new System.Drawing.SizeF(124F, 18F);
            this.xrLabelHdrAbono.Text = "Abono";
            this.xrLabelHdrAbono.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
            // 
            // PARTIDA_CONTABLE_DXReport
            // 
            this.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.topMarginBand1,
            this.groupHeaderPartida,
            this.pageHeaderBand1,
            this.detailBand1,
            this.groupFooterPartida,
            this.reportFooterBand1,
            this.bottomMarginBand1});
            this.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.Margins = new DevExpress.Drawing.DXMargins(50F, 50F, 20F, 20F);
            this.Version = "24.2";
            ((System.ComponentModel.ISupportInitialize)(this)).EndInit();

		}

        private XRLabel xrLabelHdrAbono;
        private XRLabel xrLabelHdrCargo;
        private XRLabel xrLabelHdrCuenta;
        private XRLabel xrLabelHdrDetalle;
    }
}
