// Qué hace: componente reutilizable de editor de texto enriquecido (HTML Editor).
// Cómo lo hace: encapsula dx-html-editor de DevExtreme con la barra de herramientas completa del demo Fluent Blue Light.
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { DxHtmlEditorModule } from 'devextreme-angular/ui/html-editor';

@Component({
	selector: 'app-text-editor',
	templateUrl: './text-editor.component.html',
	styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent {
	@Input() value: string = '';
	@Input() height: number | string = 420;
	@Input() readOnly: boolean = false;
	@Input() placeholder: string = 'Escriba el contenido del correo aquí...';
	@Output() valueChange = new EventEmitter<string>();

	onValueChange(val: string): void {
		this.value = val;
		this.valueChange.emit(val);
	}

	// Qué hace: intercepta la inicialización del editor para garantizar que las tablas se puedan insertar en lienzo vacío, redistribuir anchos de columnas equitativamente y preservar el diseño institucional ante ediciones o pegado de texto.
	// Cómo lo hace: asegura la posición del cursor si el lienzo está en blanco, intercepta operaciones de tabla y monitorea text-change y paste para sincronizar y blindar los estilos de las plantillas institucionales.
	onEditorInitialized(e: any): void {
		const quill = e?.component?.getQuill();
		const tableModule = quill?.getModule('table');

		if (quill) {
			// Monitorear cambios de texto y eventos de pegado para preservar el diseño institucional
			quill.on('text-change', () => {
				setTimeout(() => this.sincronizarDisenoInstitucional(quill), 10);
			});
			quill.root?.addEventListener('paste', () => {
				setTimeout(() => this.sincronizarDisenoInstitucional(quill), 25);
				setTimeout(() => this.sincronizarDisenoInstitucional(quill), 120);
			});
			setTimeout(() => this.sincronizarDisenoInstitucional(quill), 60);
		}

		if (tableModule && typeof tableModule.insertTable === 'function') {
			const originalInsertTable = tableModule.insertTable.bind(tableModule);
			tableModule.insertTable = (rows: number, columns: number) => {
				if (!quill.getSelection()) {
					quill.setSelection(Math.max(0, quill.getLength() - 1), 0, 'silent');
				}
				const result = originalInsertTable(rows, columns);
				setTimeout(() => this.redistribuirColumnasTabla(quill, tableModule), 20);
				return result;
			};
		}

		if (tableModule && typeof tableModule.insertColumn === 'function') {
			const originalInsertColumn = tableModule.insertColumn.bind(tableModule);
			tableModule.insertColumn = (offset: number) => {
				const result = originalInsertColumn(offset);
				setTimeout(() => this.redistribuirColumnasTabla(quill, tableModule), 20);
				return result;
			};
		}

		if (tableModule && typeof tableModule.deleteColumn === 'function') {
			const originalDeleteColumn = tableModule.deleteColumn.bind(tableModule);
			tableModule.deleteColumn = () => {
				const result = originalDeleteColumn();
				setTimeout(() => this.redistribuirColumnasTabla(quill, tableModule), 20);
				return result;
			};
		}
	}

	// Qué hace: redistribuye equitativamente el ancho entre todas las columnas de la tabla activa.
	// Cómo lo hace: calcula el ancho disponible del contenedor, divide entre el número total de columnas y actualiza el formato cellWidth de Quill y el estilo de cada celda, sincronizando los marcos de redimensionamiento de DevExtreme.
	private redistribuirColumnasTabla(quill: any, tableModule: any): void {
		try {
			if (!quill) {
				return;
			}
			const selection = quill.getSelection();
			let tableEl: HTMLTableElement | null = null;
			if (selection && tableModule && typeof tableModule.getTable === 'function') {
				const tableInfo = tableModule.getTable(selection);
				if (tableInfo?.[0]?.domNode) {
					tableEl = tableInfo[0].domNode;
				}
			}

			if (!tableEl) {
				const tables = quill.root?.querySelectorAll('table');
				if (tables && tables.length > 0) {
					tableEl = tables[tables.length - 1] as HTMLTableElement;
				}
			}

			if (!tableEl) {
				return;
			}

			const rows = tableEl.querySelectorAll('tr');
			if (rows.length === 0) {
				return;
			}

			const firstRowCells = rows[0].querySelectorAll('th, td');
			const colCount = firstRowCells.length;
			if (colCount <= 0) {
				return;
			}

			const containerWidth = quill.root?.clientWidth || tableEl.parentElement?.clientWidth || 700;
			const tableWidth = Math.max(300, containerWidth - 36);
			const equalColWidth = Math.max(50, Math.floor(tableWidth / colCount));

			rows.forEach((row) => {
				const cells = row.querySelectorAll('th, td');
				cells.forEach((cell) => {
					const cellEl = cell as HTMLElement;
					cellEl.style.width = `${equalColWidth}px`;
					const cellBlot = quill.scroll?.find(cell);
					if (cellBlot && typeof cellBlot.format === 'function') {
						cellBlot.format('cellWidth', `${equalColWidth}px`);
					}
				});
			});

			const tableResizing = quill.getModule('modules/tableResizing');
			if (tableResizing) {
				if (typeof tableResizing._applyResizingImpl === 'function') {
					tableResizing._applyResizingImpl();
				} else if (typeof tableResizing._updateFramesPositions === 'function') {
					tableResizing._updateFramesPositions();
					tableResizing._updateFramesSeparators();
				}
			}

			quill.update('user');
		} catch (err) {
			console.warn('Error al redistribuir columnas de tabla en editor:', err);
		}
	}

	// Qué hace: preserva la identidad visual, colores de fondo y ausencia de bordes en las tablas del formato institucional de la UEES ante operaciones de edición y pegado de texto.
	// Cómo lo hace: inspecciona las tablas en el lienzo del editor, identifica los bloques institucionales (encabezado amarillo, tarjeta central gris y pie de página azul) y asegura en el DOM y en Quill que mantengan sus colores de fondo, clases y eliminen bordes no deseados.
	private sincronizarDisenoInstitucional(quill: any): void {
		try {
			if (!quill || !quill.root) return;
			const tables = Array.from(quill.root.querySelectorAll('table')) as HTMLTableElement[];
			if (tables.length === 0) return;

			const tieneInstitucional = tables.some(
				(tbl) =>
					tbl.querySelector('img[src*="logo"]') ||
					tbl.textContent?.includes('Universidad Evangélica') ||
					tbl.style.maxWidth === '650px' ||
					tbl.classList.contains('plantilla-uees-table')
			);

			if (!tieneInstitucional) return;

			tables.forEach((tbl) => {
				tbl.classList.add('plantilla-uees-table');
				tbl.style.border = 'none';
				tbl.style.maxWidth = '650px';
				tbl.style.margin = '2px auto';

				const td = tbl.querySelector('td');
				if (!td) return;
				td.style.border = 'none';

				const esEncabezado = !!tbl.querySelector('img');
				const esPie = !!(td.textContent?.includes('Universidad Evangélica') && td.textContent?.includes('Conmutador'));

				if (esEncabezado) {
					td.style.backgroundColor = '#f7c600';
					td.style.textAlign = 'center';
				} else if (esPie) {
					td.style.backgroundColor = '#034ea2';
					td.style.color = '#ffffff';
					td.style.textAlign = 'center';
				} else {
					// Tarjeta central de contenido
					td.style.backgroundColor = '#cccccc';
					td.style.color = '#1e293b';
					if (!td.style.padding || td.style.padding === '0px') {
						td.style.padding = '32px 24px';
					}

					// Asegurar en las líneas de Quill el dataset cellbackgroundcolor para que el motor no lo remueva
					const cellLines = td.querySelectorAll('.ql-table-cell-line');
					cellLines.forEach((cl) => {
						(cl as HTMLElement).dataset['cellbackgroundcolor'] = '#cccccc';
					});
				}
			});

			// Compactar párrafos separadores entre tablas en el DOM
			const separatorParagraphs = Array.from(quill.root.querySelectorAll('table + p')) as HTMLElement[];
			separatorParagraphs.forEach((p) => {
				p.style.margin = '3px 0';
				p.style.lineHeight = '4px';
				p.style.fontSize = '4px';
				p.style.height = '4px';
			});
		} catch (err) {
			console.warn('Error al sincronizar diseño institucional en editor:', err);
		}
	}
}

@NgModule({
	imports: [CommonModule, DxHtmlEditorModule],
	declarations: [TextEditorComponent],
	exports: [TextEditorComponent],
})
export class TextEditorModule {}
