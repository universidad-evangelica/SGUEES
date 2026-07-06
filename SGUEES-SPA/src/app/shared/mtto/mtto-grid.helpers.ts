import dxSelectBox from 'devextreme/ui/select_box';

export interface EstadoColumnOptions {
	caption?: string;
	width?: number;
	activoLabel?: string;
	inactivoLabel?: string;
}

const ESTADO_LOOKUP = [
	{ value: true, text: 'Activo' },
	{ value: false, text: 'Inactivo' },
];

export function buildEstadoColumn(dataField: string, options: EstadoColumnOptions = {}): Record<string, unknown> {
	const activoLabel = options.activoLabel ?? 'Activo';
	const inactivoLabel = options.inactivoLabel ?? 'Inactivo';
	const lookup = [
		{ value: true, text: activoLabel },
		{ value: false, text: inactivoLabel },
	];

	return {
		dataField,
		caption: options.caption ?? 'Estado',
		width: options.width ?? 140,
		allowFiltering: true,
		allowHeaderFiltering: true,
		cellTemplate: (cellElement: HTMLElement, cellInfo: { value: boolean }) => {
			const badge = document.createElement('span');
			badge.classList.add('estado-badge', cellInfo.value ? 'estado-badge--activo' : 'estado-badge--inactivo');
			badge.textContent = cellInfo.value ? activoLabel : inactivoLabel;
			cellElement.innerHTML = '';
			cellElement.appendChild(badge);
		},
		lookup: {
			dataSource: lookup,
			valueExpr: 'value',
			displayExpr: 'text',
		},
		filterCellTemplate: (cellElement: HTMLElement, cellInfo: { value: unknown; setValue: (value: unknown) => void }) => {
			new dxSelectBox(cellElement, {
				dataSource: lookup,
				displayExpr: 'text',
				valueExpr: 'value',
				value: cellInfo.value,
				placeholder: 'Seleccione...',
				showClearButton: false,
				onValueChanged: (event: { value: unknown }) => cellInfo.setValue(event.value),
			});
		},
		calculateFilterExpression: (filterValue: unknown) => {
			if (filterValue === '__ALL__' || filterValue === null || filterValue === undefined) {
				return null;
			}

			return [dataField, '=', filterValue];
		},
	};
}

export interface EstadoActionButtonsOptions {
	campoEstado: string;
	onActivar: (event: unknown) => void;
	onDesactivar: (event: unknown) => void;
	canEdit?: boolean;
}

export function buildEstadoActionButtons(options: EstadoActionButtonsOptions): Record<string, unknown>[] {
	const canEdit = options.canEdit ?? true;
	const activarHint = canEdit ? 'Activar registro' : 'No tiene permiso para activar registros.';
	const desactivarHint = canEdit ? 'Desactivar registro' : 'No tiene permiso para desactivar registros.';
	const activateCssClass = canEdit ? 'sguees-grid-action-edit' : 'sguees-action-no-activate';
	const deactivateCssClass = canEdit ? 'sguees-grid-action-delete' : 'sguees-action-no-deactivate';
	const activarClick = canEdit ? options.onActivar : () => undefined;
	const desactivarClick = canEdit ? options.onDesactivar : () => undefined;
	const campo = options.campoEstado;

	return [
		{
			hint: activarHint,
			icon: 'refresh',
			stylingMode: 'text',
			cssClass: activateCssClass,
			onClick: activarClick,
			visible: (event: { row?: { data?: Record<string, boolean> } }) => !event.row?.data?.[campo],
		},
		{
			hint: desactivarHint,
			icon: 'close',
			stylingMode: 'text',
			cssClass: deactivateCssClass,
			onClick: desactivarClick,
			visible: (event: { row?: { data?: Record<string, boolean> } }) => !!event.row?.data?.[campo],
		},
	];
}
