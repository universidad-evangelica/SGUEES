<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ImprimirRequisicion.aspx.cs" Inherits="sgueesRpt.Layouts.SelectionHiring.ImprimirRequisicion" %>

<%@ Register Assembly="DevExpress.XtraReports.v24.2.Web.WebForms, Version=24.2.3.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a"
	Namespace="DevExpress.XtraReports.Web" TagPrefix="dx" %>

<!DOCTYPE html>
<html>
<head runat="server">
	<title>Requisición de Personal</title>
	<meta charset="utf-8" />
	<style type="text/css">
		html, body, form { height: 100%; margin: 0; padding: 0; overflow: hidden; }
		#errorBox { font-family: Arial, sans-serif; color: #b00020; padding: 24px; }
	</style>
</head>
<body>
	<form id="form1" runat="server">
		<asp:Literal ID="litError" runat="server" Visible="false" />
		<dx:ASPxWebDocumentViewer ID="webDocumentViewer" runat="server" Height="100%" Width="100%" ClientInstanceName="webDocumentViewer">
			<ClientSideEvents DocumentReady="function(s, e) {
				if (window.parent &amp;&amp; window.parent !== window) {
					window.parent.postMessage({ type: 'sguees-rpt-ready', source: 'ImprimirRequisicion' }, '*');
				}
			}" />
		</dx:ASPxWebDocumentViewer>
	</form>
</body>
</html>
