import dxSelectBox from 'devextreme/ui/select_box';

import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';

export function patchMttoArrayModels(models: unknown[], data: Record<string, unknown>, isAdd: boolean, keyField: string): void {
	if (!Array.isArray(models) || !data || !keyField) {
		return;
	}

	if (isAdd) {
		models.push(data);
		return;
	}

	const index = models.findIndex((item: any) => item?.[keyField] === data[keyField]);
	if (index >= 0) {
		models[index] = data;
	}
}

export function removeMttoArrayModel(models: unknown[], keyValue: unknown, keyField: string): void {
	if (!Array.isArray(models) || !keyField) {
		return;
	}

	const index = models.findIndex((item: any) => item?.[keyField] === keyValue);
	if (index >= 0) {
		models.splice(index, 1);
	}
}

/** Parchea la página visible del grid remoto sin nueva petición load. */
export function patchMttoRemoteGrid(
	grid: DataGridMttoComponent | null | undefined,
	data: Record<string, unknown>,
	isAdd: boolean,
	keyField: string
): boolean {
	const instance = grid?.gData?.instance;
	if (!instance || !data || !keyField) {
		return false;
	}

	const store: any = instance.getDataSource()?.store();
	if (!store?.push) {
		return false;
	}

	const key = data[keyField];
	const changes = isAdd ? [{ type: 'insert', data }] : [{ type: 'update', key, data }];
	store.push(changes);
	return true;
}

export function removeMttoRemoteGrid(
	grid: DataGridMttoComponent | null | undefined,
	keyValue: unknown,
	keyField: string
): boolean {
	const instance = grid?.gData?.instance;
	if (!instance || keyValue === undefined || keyValue === null || !keyField) {
		return false;
	}

	const store: any = instance.getDataSource()?.store();
	if (!store?.push) {
		return false;
	}

	store.push([{ type: 'remove', key: keyValue }]);
	return true;
}

export interface AuditGridColumnOptions {
	/** A+P: filter row datetime en cliente (recomendado). */
	withDateTimeFilter?: boolean;
	usuarioWidth?: number;
	fechaWidth?: number;
}

/** Columnas estándar de auditoría para grid mtto — al final de getColumns(). Sin ESTACION_*. */
export function buildAuditGridColumns(options: AuditGridColumnOptions = {}): Record<string, unknown>[] {
	const usuarioWidth = options.usuarioWidth ?? 160;
	const fechaWidth = options.fechaWidth ?? 180;

	const fechaColumn = (dataField: string, caption: string): Record<string, unknown> => ({
		dataField,
		caption,
		width: fechaWidth,
		dataType: 'datetime',
		format: 'dd/MM/yyyy HH:mm',
		...(options.withDateTimeFilter
			? { calculateFilterExpression: createDateTimeFilterExpression(dataField) }
			: {}),
	});

	return [
		{ dataField: 'USUARIO_CREA', caption: 'Usuario crea', width: usuarioWidth },
		fechaColumn('FECHA_CREA', 'Fecha crea'),
		{ dataField: 'USUARIO_ACTU', caption: 'Usuario actu', width: usuarioWidth },
		fechaColumn('FECHA_ACTU', 'Fecha actu'),
	];
}

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

export interface EstadoToolbarOptions {
	campoEstado: string;
	focusedRow: Record<string, unknown> | null;
	puedeCambiarEstado: boolean;
	onActivarInactivar: () => void;
}

/** Botones Activar/Desactivar en toolbar del grid (v1.1 — sobre fila seleccionada). */
export function buildEstadoToolbarOptions(options: EstadoToolbarOptions): {
	optActivar: Record<string, unknown>;
	optDesactivar: Record<string, unknown>;
} {
	const canEdit = options.puedeCambiarEstado;
	const row = options.focusedRow;
	const campo = options.campoEstado;
	const activo = row ? !!row[campo] : false;
	const hasRow = !!row;
	const onActivarInactivar = canEdit ? options.onActivarInactivar : () => undefined;

	return {
		optActivar: {
			text: 'Activar',
			icon: 'refresh',
			type: 'default',
			stylingMode: 'contained',
			visible: hasRow && !activo,
			disabled: !canEdit,
			elementAttr: canEdit ? undefined : { class: 'sguees-action-no-activate' },
			hint: canEdit ? 'Activar registro seleccionado' : 'No tiene permiso para activar registros.',
			onClick: onActivarInactivar,
		},
		optDesactivar: {
			text: 'Desactivar',
			icon: 'close',
			type: 'default',
			stylingMode: 'contained',
			visible: hasRow && activo,
			disabled: !canEdit,
			elementAttr: canEdit ? undefined : { class: 'sguees-action-no-deactivate' },
			hint: canEdit ? 'Desactivar registro seleccionado' : 'No tiene permiso para desactivar registros.',
			onClick: onActivarInactivar,
		},
	};
}

/** @deprecated v1.0 — usar toolbar con buildEstadoToolbarOptions (v1.1). */
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
