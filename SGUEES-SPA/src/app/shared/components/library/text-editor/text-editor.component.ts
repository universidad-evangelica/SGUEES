// Qué hace: componente reutilizable de editor de texto enriquecido (HTML Editor).
// Cómo lo hace: encapsula dx-html-editor de DevExtreme con la barra de herramientas completa del demo Fluent Blue Light.
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnChanges, OnDestroy, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DxDropDownButtonModule } from 'devextreme-angular/ui/drop-down-button';
import { DxHtmlEditorModule } from 'devextreme-angular/ui/html-editor';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { ThemeService } from 'src/app/shared/services/theme.service';

@Component({
	selector: 'app-text-editor',
	templateUrl: './text-editor.component.html',
	styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit, OnChanges, OnDestroy {
	@Input() value: string = '';
	@Input() height: number | string = 420;
	@Input() readOnly: boolean = false;
	@Input() placeholder: string = 'Escriba el contenido del correo aquí...';
	@Input() parametros: Array<{ key: string; label: string; descripcion?: string; tipo?: string }> = [];
	@Input() formatoParametro: { bold?: boolean; color?: string; size?: string } = {
		bold: true,
		color: '#000000',
		size: '12pt',
	};
	@Output() valueChange = new EventEmitter<string>();

	quillInstance: any;
	opcionesBotonParametros: any = null;
	menuParametrosVisible: boolean = false;
	filtroParametro: string = '';
	parametrosFiltrados: Array<{ key: string; label: string; descripcion?: string; tipo?: string }> = [];
	esPlantillaActiva: boolean = false;
	private isSyncingDiseno = false;
	private pendingSyncDiseno = false;
	private dropDownButtonInstance: any = null;
	private ultimaSeleccion: { index: number; length: number } | null = null;
	private themeSubscription?: Subscription;

	constructor(@Optional() private themeService?: ThemeService) {}

	// Qué hace: determina si la aplicación se encuentra actualmente en modo oscuro.
	// Cómo lo hace: consulta el servicio ThemeService o evalúa la presencia de clases oscuras en el body del documento.
	get isDark(): boolean {
		return (
			this.themeService?.currentTheme === 'dark' ||
			document.body.classList.contains('sguees-theme-dark') ||
			document.body.classList.contains('dx-color-scheme-dark')
		);
	}

	// Qué hace: genera dinámicamente las clases del contenedor del popover de parámetros.
	// Cómo lo hace: combina la clase base con modo-oscuro o modo-claro según el estado actual del tema.
	get popoverWrapperAttr(): Record<string, string> {
		return {
			class: `editor-parametros-popover-wrapper ${this.isDark ? 'modo-oscuro' : 'modo-claro'}`,
		};
	}

	// Qué hace: cierra el panel desplegable de parámetros únicamente cuando el usuario interactúa fuera de él en la página externa.
	// Cómo lo hace: verifica si el target o sus contenedores pertenecen al popover o al botón de activación; si pertenecen, cancela el cierre.
	private cerrarMenuParametrosSiAplica = (e: Event): void => {
		const target = e.target as HTMLElement;
		if (
			target &&
			(target.closest('.editor-parametros-popover-wrapper') ||
				target.closest('.dx-popover') ||
				target.closest('.dx-popover-wrapper') ||
				target.closest('.dx-overlay-content') ||
				target.closest('.parametros-panel-container') ||
				target.closest('.panel-cards-list') ||
				target.closest('.editor-toolbar-parametros-btn'))
		) {
			return;
		}

		if (this.menuParametrosVisible) {
			this.menuParametrosVisible = false;
		}
	};

	// Qué hace: handler para el evento dragstart del documento.
	// Cómo lo hace: delega la ejecución al método handleDragStart conservando la referencia de la función.
	private dragStartHandler = (e: DragEvent) => this.handleDragStart(e);

	// Qué hace: handler para el evento dragover sobre el lienzo de Quill.
	// Cómo lo hace: delega la ejecución al método handleDragOver conservando la referencia de la función.
	private dragOverHandler = (e: DragEvent) => this.handleDragOver(e);

	// Qué hace: handler para el evento drop sobre el lienzo de Quill.
	// Cómo lo hace: delega la ejecución al método handleDrop conservando la referencia de la función.
	private dropHandler = (e: DragEvent) => this.handleDrop(e);

	// Qué hace: handler para el evento mousedown sobre el lienzo de Quill.
	// Cómo lo hace: delega la ejecución al método handleMouseDown conservando la referencia de la función.
	private mouseDownHandler = (e: MouseEvent) => this.handleMouseDown(e);

	// Qué hace: handler para el evento paste sobre el lienzo de Quill.
	// Cómo lo hace: delega la ejecución al método handlePaste conservando la referencia de la función para poder remover el listener.
	private pasteHandler = (e: ClipboardEvent) => this.handlePaste(e);

	ngOnInit(): void {
		this.actualizarOpcionesBotonParametros();
		this.evaluarEstadoPlantilla(this.value);
		this.themeSubscription = this.themeService?.isDark.subscribe(() => {
			this.actualizarOpcionesBotonParametros();
		});
		document.addEventListener('dragstart', this.dragStartHandler);
		// Qué hace: escucha eventos de scroll y wheel en la ventana para cerrar el menú de parámetros automáticamente.
		// Cómo lo hace: añade listeners globales con capture true para interceptar cualquier desplazamiento de la página.
		window.addEventListener('scroll', this.cerrarMenuParametrosSiAplica, true);
		window.addEventListener('wheel', this.cerrarMenuParametrosSiAplica, { capture: true, passive: true });
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['parametros'] || changes['readOnly']) {
			this.actualizarOpcionesBotonParametros();
		}
		if (changes['value']) {
			const val = changes['value'].currentValue;
			this.evaluarEstadoPlantilla(val);
			if (
				typeof val === 'string' &&
				(val.includes('plantilla-uees') ||
					val.includes('#cccccc') ||
					val.includes('#ffdc00') ||
					val.includes('#034ea2') ||
					val.includes('universidad evang') ||
					val.includes('logo-xx'))
			) {
				setTimeout(() => {
					if (this.quillInstance) {
						this.sincronizarDisenoInstitucional(this.quillInstance);
						this.posicionarEnTarjetaCentral();
					}
				}, 60);
			}
		}
	}

	ngOnDestroy(): void {
		this.themeSubscription?.unsubscribe();
		document.removeEventListener('dragstart', this.dragStartHandler);
		window.removeEventListener('scroll', this.cerrarMenuParametrosSiAplica, true);
		window.removeEventListener('wheel', this.cerrarMenuParametrosSiAplica, true);
		if (this.quillInstance?.root) {
			this.quillInstance.root.removeEventListener('dragover', this.dragOverHandler);
			this.quillInstance.root.removeEventListener('drop', this.dropHandler);
			this.quillInstance.root.removeEventListener('mousedown', this.mouseDownHandler);
			this.quillInstance.root.removeEventListener('paste', this.pasteHandler, true);
		}
	}

	// Qué hace: intercepta el inicio de arrastre de un parámetro dinámico desde el menú desplegable o la lista de tarjetas.
	// Cómo lo hace: lee el atributo data-token del elemento arrastrado identificando .parametro-card-item o .parametro-dropdown-item y lo transfiere como texto plano.
	private handleDragStart(e: DragEvent): void {
		const target = (e.target as HTMLElement)?.closest('.parametro-card-item, .parametro-dropdown-item') as HTMLElement;
		if (target) {
			const token = target.getAttribute('data-token');
			if (token && e.dataTransfer) {
				e.dataTransfer.setData('text/plain', token);
				e.dataTransfer.effectAllowed = 'copy';
			}
		}
	}

	// Qué hace: permite arrastrar parámetros sobre el lienzo del editor y dibuja el cursor de texto parpadeante en tiempo real bajo el ratón.
	// Cómo lo hace: intercepta dragover, asigna dropEffect en copy y actualiza la selección visual del navegador dentro de la tarjeta o párrafos para mostrar la barra de inserción.
	private handleDragOver(e: DragEvent): void {
		if (this.readOnly) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'copy';
		}

		const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
		const tablaOcelda = elementUnderPointer?.closest('.plantilla-uees-table, table, td');
		const tdCentral = (tablaOcelda?.tagName === 'TD' ? tablaOcelda : tablaOcelda?.querySelector('td')) as HTMLElement;

		if (tdCentral) {
			const lineElements = Array.from(tdCentral.querySelectorAll('p, .ql-table-cell-line')) as HTMLElement[];
			if (lineElements.length > 0) {
				const primerP = lineElements[0];
				const ultimoP = lineElements[lineElements.length - 1];
				const primerRect = primerP.getBoundingClientRect();
				const ultimoRect = ultimoP.getBoundingClientRect();
				const sel = window.getSelection();

				if (sel) {
					if (e.clientY <= primerRect.top + 6) {
						const r = document.createRange();
						const target = primerP.firstChild || primerP;
						r.setStart(target, 0);
						r.collapse(true);
						sel.removeAllRanges();
						sel.addRange(r);
						return;
					}

					if (e.clientY >= ultimoRect.bottom - 4) {
						const r = document.createRange();
						const target = ultimoP.lastChild || ultimoP;
						const offset = target.nodeType === Node.TEXT_NODE ? (target.textContent?.length ?? 0) : target.childNodes.length;
						r.setStart(target, offset);
						r.collapse(true);
						sel.removeAllRanges();
						sel.addRange(r);
						return;
					}
				}
			}
		}

		if (document.caretRangeFromPoint) {
			const range = document.caretRangeFromPoint(e.clientX, e.clientY);
			if (range) {
				const sel = window.getSelection();
				if (sel) {
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}
	}

	// Qué hace: inserta el token del parámetro soltado en la posición exacta del puntero garantizando permanencia en la tarjeta central.
	// Cómo lo hace: intercepta drops sobre la tabla o celdas institucionales, resuelve el índice interno de la celda y previene expulsiones al separador exterior.
	private handleDrop(e: DragEvent): void {
		if (!this.quillInstance || this.readOnly) return;
		const token = e.dataTransfer?.getData('text/plain');
		if (!token || !token.startsWith('{{') || !token.endsWith('}}')) return;

		e.preventDefault();
		e.stopPropagation();

		let dropIndex = -1;

		// 1. Verificar si el drop cayó dentro de la tabla institucional o en sus áreas vacías
		const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
		const tablaOcelda = elementUnderPointer?.closest('.plantilla-uees-table, table, td');
		const tdCentral = (tablaOcelda?.tagName === 'TD' ? tablaOcelda : tablaOcelda?.querySelector('td')) as HTMLElement;

		if (tdCentral) {
			const indiceCelda = this.obtenerIndiceInternoCelda(tdCentral, e.clientY, e.clientX);
			if (indiceCelda !== null && indiceCelda >= 0) {
				dropIndex = indiceCelda;
			}
		}

		// 2. Fallback por rango nativo si no fue una celda institucional directa
		if (dropIndex < 0) {
			let nativeRange: Range | null = null;
			if (document.caretRangeFromPoint) {
				nativeRange = document.caretRangeFromPoint(e.clientX, e.clientY);
			} else {
				const sel = window.getSelection();
				if (sel && sel.rangeCount > 0) {
					nativeRange = sel.getRangeAt(0);
				}
			}

			if (nativeRange && nativeRange.startContainer) {
				try {
					let targetNode = nativeRange.startContainer;
					let targetOffset = nativeRange.startOffset;

					if (targetNode.nodeType === Node.ELEMENT_NODE && targetNode.childNodes.length > 0) {
						const childIndex = Math.min(targetOffset, targetNode.childNodes.length - 1);
						targetNode = targetNode.childNodes[childIndex];
						targetOffset = (targetOffset >= targetNode.childNodes.length) ? (targetNode.textContent?.length ?? 0) : 0;
					}

					const blot = this.quillInstance.scroll?.find(targetNode, true);
					if (blot && typeof blot.offset === 'function') {
						dropIndex = blot.offset(this.quillInstance.scroll) + targetOffset;
					}
				} catch (err) {
					console.warn('Error al calcular offset de drop en Quill:', err);
				}
			}
		}

		// 3. Fallback de seguridad si no se resolvió posición
		if (dropIndex < 0) {
			dropIndex = this.obtenerIndiceInsercionValido();
		}

		this.quillInstance.focus();
		const formatos: Record<string, any> = {
			bold: this.formatoParametro?.bold ?? true,
			color: this.formatoParametro?.color ?? '#000000',
			size: this.formatoParametro?.size ?? '12pt',
		};
		this.quillInstance.insertText(dropIndex, token, formatos, 'user');
		this.aplicarFormatoParametro(dropIndex, token.length);
		const nuevoIndex = dropIndex + token.length;
		this.quillInstance.setSelection(nuevoIndex, 0, 'user');
		this.ultimaSeleccion = { index: nuevoIndex, length: 0 };

		this.menuParametrosVisible = false;

		setTimeout(() => {
			this.quillInstance?.focus();
		}, 60);
	}

	// Qué hace: asegura que al hacer clic en el relleno exterior vacío de una celda se enfoque el editor sin mover clics válidos del usuario.
	// Cómo lo hace: verifica si el clic cayó directamente en la celda TD vacía sin que exista selección; si el usuario hizo clic en texto o en la línea, respeta la posición del navegador.
	private handleMouseDown(e: MouseEvent): void {
		if (this.readOnly || !this.quillInstance) return;
		const target = e.target as HTMLElement;
		// Solo intervenir si el clic fue directamente sobre el TD o TABLE vacío (relleno exterior)
		if (target.tagName === 'TD' || target.tagName === 'TABLE' || target.tagName === 'TR' || target.tagName === 'TBODY') {
			setTimeout(() => {
				const selection = this.quillInstance?.getSelection(false);
				if (!selection) {
					const td = (target.tagName === 'TD' ? target : target.querySelector('td')) as HTMLElement;
					if (td) {
						const indice = this.obtenerIndiceInternoCelda(td, e.clientY, e.clientX);
						if (indice !== null) {
							this.ultimaSeleccion = { index: indice, length: 0 };
							try {
								this.quillInstance.setSelection(indice, 0, 'user');
							} catch {}
						}
					}
				}
			}, 30);
		}
	}

	// Qué hace: localiza la posición editable exacta dentro de una celda de tabla distinguiendo inicio, renglones y final.
	// Cómo lo hace: evalúa si las coordenadas verticales caen en el relleno superior (retorna inicio del primer bloque), en el relleno inferior (retorna final del último bloque) o en renglones intermedios mediante caretRangeFromPoint.
	private obtenerIndiceInternoCelda(td: HTMLElement, clientY?: number, clientX?: number): number | null {
		if (!td || !this.quillInstance?.scroll) return null;

		const lineElements = Array.from(td.querySelectorAll('p, .ql-table-cell-line')) as HTMLElement[];
		if (lineElements.length === 0) {
			const targetChild = td.firstElementChild || td.firstChild || td;
			const blot = this.quillInstance.scroll.find(targetChild, true);
			return (blot && typeof blot.offset === 'function') ? blot.offset(this.quillInstance.scroll) : null;
		}

		// 1. Si se proporciona clientY, verificar si cayó en el relleno superior (arriba del primer párrafo) o inferior (abajo del último)
		const primerP = lineElements[0];
		const ultimoP = lineElements[lineElements.length - 1];

		if (typeof clientY === 'number') {
			const primerRect = primerP.getBoundingClientRect();
			if (clientY <= primerRect.top + 6) {
				// Clic o drop en el área gris superior: posicionar al INICIO del primer bloque
				const primerBlot = this.quillInstance.scroll.find(primerP.firstChild || primerP, true);
				return primerBlot && typeof primerBlot.offset === 'function' ? primerBlot.offset(this.quillInstance.scroll) : 0;
			}

			const ultimoRect = ultimoP.getBoundingClientRect();
			if (clientY >= ultimoRect.bottom - 4) {
				// Clic o drop en el área gris inferior: posicionar al FINAL del último bloque
				const ultimoBlot = this.quillInstance.scroll.find(ultimoP.firstChild || ultimoP, true);
				if (ultimoBlot && typeof ultimoBlot.offset === 'function') {
					const baseOffset = ultimoBlot.offset(this.quillInstance.scroll);
					const blotLength = typeof ultimoBlot.length === 'function' ? ultimoBlot.length() : 0;
					return baseOffset + Math.max(0, blotLength - 1);
				}
			}
		}

		// 2. Intentar resolución exacta por coordenadas intermedias
		if (typeof clientX === 'number' && typeof clientY === 'number' && document.caretRangeFromPoint) {
			const range = document.caretRangeFromPoint(clientX, clientY);
			if (range && range.startContainer && td.contains(range.startContainer)) {
				const blot = this.quillInstance.scroll.find(range.startContainer, true);
				if (blot && typeof blot.offset === 'function') {
					let offset = blot.offset(this.quillInstance.scroll);
					if (range.startOffset > 0) {
						offset += typeof (blot as any).index === 'function'
							? (blot as any).index(range.startContainer, range.startOffset)
							: range.startOffset;
					}
					return offset;
				}
			}
		}

		// 3. Fallback: encontrar el párrafo verticalmente más cercano
		let targetP = primerP;
		if (typeof clientY === 'number') {
			let menorDistancia = Infinity;
			for (const p of lineElements) {
				const rect = p.getBoundingClientRect();
				const centroY = (rect.top + rect.bottom) / 2;
				const distancia = Math.abs(clientY - centroY);
				if (distancia < menorDistancia) {
					menorDistancia = distancia;
					targetP = p;
				}
			}
		}

		let blot = this.quillInstance.scroll.find(targetP.firstChild || targetP, true);
		if (blot && typeof blot.offset === 'function') {
			const baseOffset = blot.offset(this.quillInstance.scroll);
			const blotLength = typeof blot.length === 'function' ? blot.length() : 0;
			return baseOffset + Math.max(0, blotLength - 1);
		}

		return null;
	}

	// Qué hace: posiciona la selección activa y el cursor de texto dentro de la tarjeta central gris del formato institucional.
	// Cómo lo hace: localiza la tabla central gris (#cccccc) en el DOM de Quill, resuelve el índice interno de la celda y actualiza ultimaSeleccion y la selección de Quill solo si el usuario no tiene selección activa.
	private posicionarEnTarjetaCentral(): void {
		if (!this.quillInstance?.root || this.quillInstance.hasFocus?.() || this.ultimaSeleccion) return;
		const tables = Array.from(this.quillInstance.root.querySelectorAll('table')) as HTMLTableElement[];
		if (tables.length === 0) return;

		const tablaCentral = tables.find(t => t.querySelector('td[style*="#cccccc"], td[style*="rgb(204, 204, 204)"]')) ||
			(tables.length >= 2 ? tables[1] : tables[0]);

		if (tablaCentral) {
			const td = tablaCentral.querySelector('td');
			if (td) {
				const indice = this.obtenerIndiceInternoCelda(td);
				if (indice !== null) {
					this.ultimaSeleccion = { index: indice, length: 0 };
					try {
						this.quillInstance.setSelection(indice, 0, 'silent');
					} catch {}
				}
			}
		}
	}

	// Qué hace: calcula la posición adecuada donde insertar el parámetro en el editor.
	// Cómo lo hace: verifica la última selección activa del usuario; si no existe, localiza el texto editable dentro de la tarjeta central gris del formato institucional (#cccccc) usando obtenerIndiceInternoCelda o retorna el inicio.
	private obtenerIndiceInsercionValido(): number {
		const selection = this.quillInstance?.getSelection(false);
		if (selection && typeof selection.index === 'number') {
			this.ultimaSeleccion = selection;
			return selection.index;
		}

		if (this.ultimaSeleccion && typeof this.ultimaSeleccion.index === 'number') {
			return this.ultimaSeleccion.index;
		}

		if (this.quillInstance?.root) {
			const tables = Array.from(this.quillInstance.root.querySelectorAll('table')) as HTMLTableElement[];
			if (tables.length > 0) {
				const tablaCentral = tables.find(t => t.querySelector('td[style*="#cccccc"], td[style*="rgb(204, 204, 204)"]')) ||
					(tables.length >= 2 ? tables[1] : tables[0]);

				if (tablaCentral) {
					const td = tablaCentral.querySelector('td');
					if (td) {
						const indice = this.obtenerIndiceInternoCelda(td);
						if (indice !== null) {
							return indice;
						}
					}
				}
			}
		}

		return 0;
	}

	// Qué hace: genera la configuración del botón desplegable de parámetros para la barra de herramientas del editor.
	// Cómo lo hace: construye el botón permanentemente visible y lo inhabilita cuando el editor está en modo de solo lectura.
	private actualizarOpcionesBotonParametros(): void {
		this.parametrosFiltrados = [...(this.parametros || [])];

		this.opcionesBotonParametros = {
			text: 'Parámetros',
			icon: 'mention',
			stylingMode: 'text',
			height: 24,
			disabled: this.readOnly,
			elementAttr: {
				class: 'editor-toolbar-parametros-btn',
			},
			onClick: () => {
				this.menuParametrosVisible = !this.menuParametrosVisible;
			},
		};
	}

	// Qué hace: filtra dinámicamente los parámetros disponibles por título, clave o descripción.
	// Cómo lo hace: evalúa el texto introducido en el input contra los atributos de cada parámetro.
	onSearchInput(e: any): void {
		this.filtroParametro = e?.target?.value ?? '';
		const query = this.filtroParametro.trim().toLowerCase();
		if (!query) {
			this.parametrosFiltrados = [...(this.parametros || [])];
			return;
		}
		this.parametrosFiltrados = (this.parametros || []).filter(
			(p) =>
				(p.label && p.label.toLowerCase().includes(query)) ||
				(p.key && p.key.toLowerCase().includes(query)) ||
				(p.descripcion && p.descripcion.toLowerCase().includes(query))
		);
	}

	// Qué hace: limpia el campo de búsqueda de parámetros y restaura la lista completa.
	// Cómo lo hace: restablece filtroParametro a vacío y refresca parametrosFiltrados.
	limpiarFiltro(): void {
		this.filtroParametro = '';
		this.parametrosFiltrados = [...(this.parametros || [])];
	}

	// Qué hace: inserta el parámetro en el cursor al hacer clic sobre una tarjeta y oculta el panel.
	// Cómo lo hace: invoca insertarParametroEnCursor y asigna false a menuParametrosVisible.
	onParamCardClick(item: any): void {
		this.insertarParametroEnCursor(item);
		this.menuParametrosVisible = false;
	}

	// Qué hace: transfiere el token del parámetro arrastrado para inserción nativa en el editor.
	// Cómo lo hace: coloca el texto plano {{TOKEN}} en dataTransfer con efecto copy.
	onParamDragStart(e: DragEvent, item: any): void {
		const token = this.getParamToken(item.key);
		if (e.dataTransfer) {
			e.dataTransfer.setData('text/plain', token);
			e.dataTransfer.effectAllowed = 'copy';
		}
	}

	// Qué hace: genera la representación en texto del token dinámico.
	// Cómo lo hace: concatena los delimitadores de llaves dobles con la clave del parámetro de forma segura.
	getParamToken(key?: string): string {
		return key ? `{{${key}}}` : '';
	}

	// Qué hace: inserta el token del parámetro en la posición actual del cursor con formato tipográfico (negrita, color negro y tamaño 12).
	// Cómo lo hace: obtiene la posición de inserción de Quill, remueve selección previa si existe, inyecta el token atómicamente con los atributos configurados y refuerza el formato individualmente.
	insertarParametroEnCursor(item: any): void {
		if (!item?.key || !this.quillInstance || this.readOnly) {
			return;
		}
		const token = `{{${item.key}}}`;
		const index = this.obtenerIndiceInsercionValido();
		const length = (this.ultimaSeleccion && this.ultimaSeleccion.length > 0) ? this.ultimaSeleccion.length : 0;

		this.quillInstance.focus();

		if (length > 0) {
			this.quillInstance.deleteText(index, length, 'user');
		}

		const formatos: Record<string, any> = {
			bold: this.formatoParametro?.bold ?? true,
			color: this.formatoParametro?.color ?? '#000000',
			size: this.formatoParametro?.size ?? '12pt',
		};

		this.quillInstance.insertText(index, token, formatos, 'user');
		this.aplicarFormatoParametro(index, token.length);
		const nuevoIndex = index + token.length;
		this.quillInstance.setSelection(nuevoIndex, 0, 'user');
		this.ultimaSeleccion = { index: nuevoIndex, length: 0 };

		if (this.dropDownButtonInstance && typeof this.dropDownButtonInstance.close === 'function') {
			this.dropDownButtonInstance.close();
		}
		setTimeout(() => {
			this.quillInstance?.focus();
		}, 60);
	}

	// Qué hace: aplica y refuerza el formato tipográfico predeterminado (negrita, color negro y tamaño 12) sobre el rango exacto del token insertado.
	// Cómo lo hace: aplica de forma directa e individual bold, color y size en la instancia de Quill garantizando que no se pierdan ante estilos de tema oscuro.
	private aplicarFormatoParametro(index: number, length: number): void {
		if (!this.quillInstance || length <= 0) return;
		const bold = this.formatoParametro?.bold ?? true;
		const color = this.formatoParametro?.color ?? '#000000';
		const size = this.formatoParametro?.size ?? '12pt';

		try {
			if (bold) {
				this.quillInstance.formatText(index, length, 'bold', true, 'user');
			}
			if (color) {
				this.quillInstance.formatText(index, length, 'color', color, 'user');
			}
			if (size) {
				this.quillInstance.formatText(index, length, 'size', size, 'user');
			}
		} catch (err) {
			console.warn('Error al aplicar formato predeterminado al parámetro:', err);
		}
	}

	onValueChange(val: string): void {
		this.value = val;
		this.evaluarEstadoPlantilla(val);
		this.valueChange.emit(val);
		if (
			this.quillInstance &&
			typeof val === 'string' &&
			(val.includes('plantilla-uees') ||
				val.includes('#cccccc') ||
				val.includes('#ffdc00') ||
				val.includes('#034ea2') ||
				val.includes('universidad evang') ||
				val.includes('uees.edu.sv') ||
				val.includes('data-tipo'))
		) {
			this.programarSincronizacionDiseno(this.quillInstance, 40);
		}
	}

	// Qué hace: evalúa si el contenido actual corresponde a una plantilla institucional oficial UEES.
	// Cómo lo hace: verifica la presencia de palabras clave institucionales en la cadena de valor o en el DOM de Quill.
	private evaluarEstadoPlantilla(val?: string): void {
		const str = (typeof val === 'string' ? val : this.value || '').toLowerCase();
		this.esPlantillaActiva =
			str.includes('plantilla-uees') ||
			str.includes('universidad evang') ||
			str.includes('uees.edu.sv') ||
			str.includes('2275-4000') ||
			str.includes('#ffdc00') ||
			str.includes('#034ea2') ||
			str.includes('data-tipo') ||
			this.esPlantillaInstitucional(this.quillInstance);
	}

	// Qué hace: determina si el documento del editor contiene la plantilla institucional oficial UEES.
	// Cómo lo hace: evalúa la presencia de textos institucionales inmutables (Universidad Evangélica, uees.edu.sv, 2275-4000), logotipo o atributos data-tipo.
	private esPlantillaInstitucional(quill: any): boolean {
		if (!quill?.root) return false;
		const text = (quill.root.innerText || quill.root.textContent || '').toLowerCase();
		const html = quill.root.innerHTML || '';
		return (
			text.includes('universidad evang') ||
			text.includes('uees.edu.sv') ||
			text.includes('2275-4000') ||
			html.includes('plantilla-uees') ||
			html.includes('data-tipo') ||
			!!quill.root.querySelector('img')
		);
	}

	// Qué hace: determina si una tabla dada pertenece al formato institucional UEES.
	// Cómo lo hace: verifica clases, data-tipo, logo, colores o si el documento raíz pertenece a la plantilla institucional UEES.
	private esTablaInstitucional(tbl: HTMLTableElement | null): boolean {
		if (!tbl) return false;
		if (
			tbl.classList.contains('plantilla-uees-table') ||
			tbl.classList.contains('plantilla-uees-pie') ||
			!!tbl.getAttribute('data-tipo') ||
			tbl.style.maxWidth === '650px' ||
			!!tbl.querySelector('img')
		) {
			return true;
		}

		const text = (tbl.innerText || tbl.textContent || '').toLowerCase();
		if (text.includes('universidad evang') || text.includes('uees.edu.sv') || text.includes('2275-4000')) {
			return true;
		}

		const html = tbl.innerHTML || '';
		if (/#ffdc00|#cccccc|#034ea2|rgb\(\s*255,\s*220,\s*0\s*\)|rgb\(\s*204,\s*204,\s*204\s*\)|rgb\(\s*3,\s*78,\s*162\s*\)/i.test(html)) {
			return true;
		}

		return this.esPlantillaInstitucional(this.quillInstance);
	}

	// Qué hace: resuelve la tabla institucional a partir del cursor de Quill cuando el evento paste no apunta al td.
	// Cómo lo hace: obtiene el leaf en el índice de selección o ultimaSeleccion y sube hasta el table contenedor.
	private obtenerTablaDesdeSeleccion(quill: any): HTMLTableElement | null {
		const rango = quill?.getSelection?.(true) || this.ultimaSeleccion;
		if (!rango || typeof rango.index !== 'number' || !quill?.getLeaf) {
			return null;
		}
		try {
			const leafInfo = quill.getLeaf(rango.index);
			const leaf = Array.isArray(leafInfo) ? leafInfo[0] : leafInfo;
			const node = leaf?.domNode as Node;
			const el = (node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement)) as HTMLElement;
			return (el?.closest?.('table') as HTMLTableElement) || null;
		} catch {
			return null;
		}
	}

	// Qué hace: extrae el texto del portapapeles sin tablas ni markup de Word para insertarlo dentro de la celda.
	// Cómo lo hace: prioriza text/plain y, si solo hay HTML, convierte innerText conservando saltos de línea.
	private extraerTextoPegado(html: string, text: string): string {
		const plano = (text || '').replace(/\r\n/g, '\n');
		if (plano.trim().length > 0) {
			return plano;
		}
		if (!html) {
			return '';
		}
		const contenedor = document.createElement('div');
		contenedor.innerHTML = html;
		contenedor.querySelectorAll('style, script, meta, xml, link').forEach((el) => el.remove());
		return (contenedor.innerText || contenedor.textContent || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
	}

	// Qué hace: intercepta el pegado dentro de los recuadros institucionales para no dejar que Quill reescriba la tabla.
	// Cómo lo hace: en fase captura, si el destino es una celda institucional, cancela el pegado nativo, inserta texto plano en el índice actual y reprograma la sincronización de colores y clase.
	private handlePaste(e: ClipboardEvent): void {
		const quill = this.quillInstance;
		if (!quill || this.readOnly) {
			return;
		}

		const origen = (e.target as HTMLElement) || null;
		const celda = (origen?.closest?.('td, th') as HTMLElement) || null;
		let tabla = (celda?.closest('table') as HTMLTableElement) || null;
		if (!this.esTablaInstitucional(tabla)) {
			tabla = this.obtenerTablaDesdeSeleccion(quill);
		}

		if (!this.esTablaInstitucional(tabla)) {
			this.programarSincronizacionDiseno(quill, 30);
			this.programarSincronizacionDiseno(quill, 150);
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		const html = e.clipboardData?.getData('text/html') ?? '';
		const text = e.clipboardData?.getData('text/plain') ?? '';
		const contenido = this.extraerTextoPegado(html, text);
		if (!contenido) {
			this.programarSincronizacionDiseno(quill, 30);
			return;
		}

		const rango = quill.getSelection(true) || this.ultimaSeleccion;
		const index = rango && typeof rango.index === 'number' ? rango.index : this.obtenerIndiceInsercionValido();
		const length = rango && typeof rango.length === 'number' ? rango.length : 0;

		try {
			quill.focus();
			if (length > 0) {
				quill.deleteText(index, length, 'user');
			}
			quill.insertText(index, contenido, 'user');
			const nuevoIndex = index + contenido.length;
			quill.setSelection(nuevoIndex, 0, 'user');
			this.ultimaSeleccion = { index: nuevoIndex, length: 0 };
		} catch (err) {
			console.warn('Error al pegar texto en celda institucional:', err);
		}

		// Qué hace: restablece inmediatamente el diseño institucional de forma síncrona y con micro-delay de seguridad.
		// Cómo lo hace: ejecuta sincronizarDisenoInstitucional en el mismo tick para que no se aprecie parpadeo ni pérdida de colores.
		this.sincronizarDisenoInstitucional(quill);
		this.programarSincronizacionDiseno(quill, 20);
		this.programarSincronizacionDiseno(quill, 100);
	}

	// Qué hace: agenda la restauración del diseño institucional evitando que la guarda de reentrancia descarte un pegado posterior.
	// Cómo lo hace: si isSyncingDiseno está activo marca pendingSyncDiseno; si no, ejecuta sincronizarDisenoInstitucional tras el delay indicado.
	private programarSincronizacionDiseno(quill: any, delay: number = 20): void {
		setTimeout(() => {
			if (this.isSyncingDiseno) {
				this.pendingSyncDiseno = true;
				return;
			}
			this.sincronizarDisenoInstitucional(quill);
		}, delay);
	}

	// Qué hace: intercepta la inicialización del editor para obtener la instancia real de Quill, garantizar que las tablas se puedan insertar en lienzo vacío, redistribuir anchos de columnas equitativamente y preservar el diseño institucional ante ediciones o pegado de texto.
	// Cómo lo hace: resuelve la instancia subyacente de Quill mediante getQuillInstance(), asegura la posición del cursor, intercepta operaciones de tabla y monitorea text-change y paste en captura con reintento si la sincronización está ocupada.
	onEditorInitialized(e: any): void {
		this.quillInstance =
			e?.component?.getQuillInstance?.() ||
			e?.component?._quillInstance ||
			(e?.component as any)?.getQuill?.();
		const quill = this.quillInstance;
		const tableModule = quill?.getModule('table');

		if (quill) {
			// Monitorear cambios de texto de usuario y eventos de pegado con guardas para prevenir bucles
			quill.on('text-change', (_delta: any, _oldDelta: any, source: string) => {
				if (source !== 'user') return;
				this.programarSincronizacionDiseno(quill, 20);
			});
			quill.on('selection-change', (range: any) => {
				if (range) {
					this.ultimaSeleccion = range;
				}
			});
			quill.root?.addEventListener('dragover', this.dragOverHandler);
			quill.root?.addEventListener('drop', this.dropHandler);
			quill.root?.addEventListener('mousedown', this.mouseDownHandler);
			quill.root?.addEventListener('paste', this.pasteHandler, true);
			setTimeout(() => this.sincronizarDisenoInstitucional(quill), 80);
			if (typeof this.value === 'string' && (this.value.includes('plantilla-uees-table') || this.value.includes('#cccccc') || this.value.includes('logo-xx'))) {
				setTimeout(() => this.posicionarEnTarjetaCentral(), 150);
			}
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

		// Interceptar el diálogo nativo de añadir enlace para inyectar selector de parámetros URL cuando existan en el módulo
		const editorInstance = e?.component;
		if (editorInstance && typeof editorInstance.showFormDialog === 'function') {
			const originalShowFormDialog = editorInstance.showFormDialog.bind(editorInstance);
			editorInstance.showFormDialog = (formConfig: any) => {
				const esDialogoEnlace = formConfig?.formData && Object.prototype.hasOwnProperty.call(formConfig.formData, 'href');
				if (esDialogoEnlace) {
					const parametrosUrl = this.obtenerParametrosUrl();
					if (parametrosUrl.length > 0) {
						// Si el enlace actual ya coincide con {{CLAVE}}, preseleccionarlo en el selector
						const matchActual = typeof formConfig.formData.href === 'string'
							? formConfig.formData.href.match(/^\{\{([A-Za-z0-9_]+)\}\}$/)
							: null;
						formConfig.formData.parametroUrl = matchActual ? matchActual[1] : null;

						const itemParametroUrl = {
							dataField: 'parametroUrl',
							label: { text: 'Parámetro URL' },
							editorType: 'dxSelectBox',
							editorOptions: {
								items: parametrosUrl,
								displayExpr: 'label',
								valueExpr: 'key',
								placeholder: 'Seleccione un parámetro de enlace...',
								showClearButton: true,
								value: formConfig.formData.parametroUrl,
								onValueChanged: (args: any) => {
									if (args.value) {
										editorInstance._formDialog?._form?.updateData('href', `{{${args.value}}}`);
										const currentText = editorInstance._formDialog?._form?.option('formData')?.text;
										if (!currentText || currentText.trim() === '') {
											const param = parametrosUrl.find((p) => p.key === args.value);
											if (param?.label) {
												editorInstance._formDialog?._form?.updateData('text', param.label);
											}
										}
									}
								}
							}
						};

						// Insertar el selector de parámetro URL justo antes del campo URL
						const itemsExistentes = formConfig.items || [];
						const indexHref = itemsExistentes.findIndex((it: any) => it.dataField === 'href');
						if (indexHref >= 0) {
							formConfig.items = [
								...itemsExistentes.slice(0, indexHref),
								itemParametroUrl,
								...itemsExistentes.slice(indexHref)
							];
						} else {
							formConfig.items = [itemParametroUrl, ...itemsExistentes];
						}
					}
				}
				return originalShowFormDialog(formConfig);
			};
		}
	}

	// Qué hace: extrae y filtra únicamente los parámetros disponibles clasificados o nombrados como enlaces web / URLs.
	// Cómo lo hace: evalúa si el parámetro tiene tipo 'URL' o si su clave o etiqueta contiene palabras clave como ENLACE, URL, LINK, PORTAL o SITIO.
	obtenerParametrosUrl(): Array<{ key: string; label: string; descripcion?: string; tipo?: string }> {
		if (!this.parametros || !Array.isArray(this.parametros) || this.parametros.length === 0) {
			return [];
		}

		return this.parametros.filter((p) => {
			if (!p || !p.key) return false;
			if (p.tipo && p.tipo.toUpperCase() === 'URL') {
				return true;
			}
			const keyUpper = p.key.toUpperCase();
			const labelUpper = (p.label || '').toUpperCase();
			return (
				keyUpper.includes('ENLACE') ||
				keyUpper.includes('URL') ||
				keyUpper.includes('LINK') ||
				keyUpper.includes('PORTAL') ||
				keyUpper.includes('SITIO') ||
				labelUpper.includes('ENLACE') ||
				labelUpper.includes('URL') ||
				labelUpper.includes('LINK') ||
				labelUpper.includes('PORTAL') ||
				labelUpper.includes('SITIO WEB')
			);
		});
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

	// Qué hace: determina el rol institucional (encabezado, cuerpo o pie) de una tabla.
	// Cómo lo hace: evalúa la posición estructural dentro de la plantilla institucional dando prioridad al orden (primera = encabezado, última = pie con texto de contacto, e intermedias = cuerpo gris) evitando falsos positivos por estilos heredados.
	private resolverTipoTablaInstitucional(
		tbl: HTMLTableElement,
		index: number,
		institucionales: HTMLTableElement[]
	): 'encabezado' | 'cuerpo' | 'pie' {
		const pos = institucionales.indexOf(tbl) >= 0 ? institucionales.indexOf(tbl) : index;
		const total = institucionales.length;

		// 1. Si es la primera tabla de la secuencia o contiene imagen de logo, siempre es encabezado
		if (pos === 0 || tbl.querySelector('img')) {
			return 'encabezado';
		}

		// 2. Si hay 3 o más tablas y estamos en una posición intermedia, es obligatoriamente cuerpo
		if (total >= 3 && pos > 0 && pos < total - 1) {
			return 'cuerpo';
		}

		// 3. Evaluar si contiene datos institucionales de pie (contacto / derechos reservados)
		const text = (tbl.innerText || tbl.textContent || '').toLowerCase();
		const esContenidoPie =
			text.includes('universidad evang') ||
			text.includes('uees.edu.sv') ||
			text.includes('2275-4000') ||
			text.includes('prolongación alameda') ||
			text.includes('prolongacion alameda') ||
			tbl.classList.contains('plantilla-uees-pie');

		// 4. Si es la última tabla de la secuencia institucional
		if (pos === total - 1) {
			if (total >= 2) {
				return 'pie';
			}
			return esContenidoPie ? 'pie' : 'cuerpo';
		}

		if (esContenidoPie) {
			return 'pie';
		}

		return 'cuerpo';
	}

	// Qué hace: reaplica el color de fondo, padding y data-cellbackgroundcolor en todas las celdas de un bloque institucional.
	// Cómo lo hace: recorre cada td/th, anula el borde de grilla de Quill y fija el dataset que DevExtreme usa para no perder el relleno al reeditar.
	private aplicarEstiloCeldasInstitucionales(tbl: HTMLTableElement, tipo: 'encabezado' | 'cuerpo' | 'pie'): void {
		const celdas = Array.from(tbl.querySelectorAll('td, th')) as HTMLElement[];
		celdas.forEach((td) => {
			td.setAttribute('align', 'center');
			td.style.border = 'none';
			td.style.textAlign = 'center';

			if (tipo === 'encabezado') {
				td.style.backgroundColor = '#ffdc00';
				td.style.padding = td.style.padding && td.style.padding !== '0px' ? td.style.padding : '12px 15px';
				td.querySelectorAll('.ql-table-cell-line, p').forEach((cl) => {
					(cl as HTMLElement).dataset['cellbackgroundcolor'] = '#ffdc00';
				});
				return;
			}

			if (tipo === 'pie') {
				td.style.backgroundColor = '#034ea2';
				td.style.color = '#ffffff';
				td.style.padding = td.style.padding && td.style.padding !== '0px' ? td.style.padding : '14px 16px';
				td.querySelectorAll('.ql-table-cell-line, p').forEach((cl) => {
					const el = cl as HTMLElement;
					el.dataset['cellbackgroundcolor'] = '#034ea2';
					if (!el.querySelector('a')) {
						el.style.color = '#ffffff';
					}
				});
				return;
			}

			td.style.backgroundColor = '#cccccc';
			td.style.color = '#1e293b';
			td.style.height = 'auto';
			td.style.minHeight = '150px';
			if (!td.style.padding || td.style.padding === '0px') {
				td.style.padding = '32px 24px';
			}
			td.querySelectorAll('.ql-table-cell-line, p').forEach((cl) => {
				(cl as HTMLElement).dataset['cellbackgroundcolor'] = '#cccccc';
			});
		});
	}

	// Qué hace: preserva la identidad visual, colores de fondo y ausencia de bordes en las tablas del formato institucional de la UEES ante operaciones de edición y pegado de texto.
	// Cómo lo hace: identifica las tablas institucionales, restaura clase data-tipo y relleno en todas las celdas, y si un ciclo quedó pendiente lo vuelve a ejecutar al liberar la guarda.
	private sincronizarDisenoInstitucional(quill: any): void {
		if (this.isSyncingDiseno) {
			this.pendingSyncDiseno = true;
			return;
		}
		this.isSyncingDiseno = true;
		try {
			if (!quill || !quill.root) return;
			const tables = Array.from(quill.root.querySelectorAll('table')) as HTMLTableElement[];
			if (tables.length === 0) return;

			const esInstitucional = this.esPlantillaInstitucional(quill);
			this.esPlantillaActiva = esInstitucional;
			quill.root?.classList?.toggle('plantilla-uees-activa', esInstitucional);
			const contentContainer = quill.root?.closest('.dx-htmleditor-content');
			contentContainer?.classList?.toggle('plantilla-uees-activa', esInstitucional);
			const institucionales = esInstitucional ? tables : tables.filter((tbl) => this.esTablaInstitucional(tbl));
			if (institucionales.length === 0) return;

			institucionales.forEach((tbl, index) => {
				const tipo = this.resolverTipoTablaInstitucional(tbl, index, institucionales);
				tbl.classList.add('plantilla-uees-table');
				tbl.setAttribute('data-tipo', tipo);
				tbl.setAttribute('align', 'center');
				tbl.setAttribute('width', '100%');
				tbl.style.border = 'none';
				tbl.style.borderCollapse = 'collapse';
				tbl.style.maxWidth = '100%';
				tbl.style.width = '100%';
				tbl.style.margin = '2px 0';
				if (tipo === 'pie') {
					tbl.classList.add('plantilla-uees-pie');
				} else {
					tbl.classList.remove('plantilla-uees-pie');
				}

				this.aplicarEstiloCeldasInstitucionales(tbl, tipo);
			});

			// Configurar párrafos separadores entre tablas en el DOM con ancho 100% y línea divisora entre amarillo y gris
			const separatorParagraphs = Array.from(quill.root.querySelectorAll('table + p')) as HTMLElement[];
			separatorParagraphs.forEach((p, index) => {
				p.style.border = 'none';
				p.style.width = '100%';
				p.style.maxWidth = '100%';
				if (index === 0) {
					p.style.borderTop = '1px solid #cccccc';
					p.style.margin = '16px 0';
					p.style.height = '1px';
					p.style.minHeight = '1px';
					p.style.maxHeight = '1px';
					p.style.lineHeight = '1px';
					p.style.fontSize = '1px';
					p.style.overflow = 'visible';
				} else {
					p.style.borderTop = 'none';
					p.style.margin = '4px 0';
					p.style.height = '4px';
					p.style.minHeight = '4px';
					p.style.maxHeight = '4px';
					p.style.lineHeight = '4px';
					p.style.fontSize = '4px';
					p.style.overflow = 'hidden';
				}
				p.style.padding = '0';
			});
		} catch (err) {
			console.warn('Error al sincronizar diseño institucional en editor:', err);
		} finally {
			setTimeout(() => {
				this.isSyncingDiseno = false;
				if (this.pendingSyncDiseno) {
					this.pendingSyncDiseno = false;
					this.sincronizarDisenoInstitucional(quill);
				}
			}, 80);
		}
	}
}

@NgModule({
	imports: [CommonModule, DxHtmlEditorModule, DxDropDownButtonModule, DxPopoverModule],
	declarations: [TextEditorComponent],
	exports: [TextEditorComponent],
})
export class TextEditorModule {}
