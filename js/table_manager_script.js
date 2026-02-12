document.addEventListener('DOMContentLoaded', async () => {
    const tableTitle = document.getElementById('table-title');
    const tableHeaderRow = document.getElementById('table-header-row');
    const tableBody = document.getElementById('table-body');
    const noDataMessage = document.getElementById('no-data-message');
    const addNewRowButton = document.getElementById('add-new-row-button');

    const crudModal = document.getElementById('crudModal');
    const closeCrudModalButton = document.getElementById('close-crud-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalFormFields = document.getElementById('modal-form-fields');
    const crudForm = document.getElementById('crudForm');
    const saveCrudButton = document.getElementById('save-crud-button');

    let currentTableName = '';
    let currentTableSchema = []; // Almacenará {Field, Type, Key}
    let primaryKeyColumn = null; // Almacenará el nombre de la columna PK (ej. 'id' o 'Id_Prod')

    // --- Funciones de Utilidad del Modal ---
    function openCrudModal(title) {
        modalTitle.textContent = title;
        crudModal.classList.add('active');
    }

    function closeCrudModal() {
        crudModal.classList.remove('active');
        crudForm.reset(); // Limpiar el formulario
        modalFormFields.innerHTML = ''; // Limpiar campos dinámicos
    }

    // --- Funciones de carga de datos ---

    async function checkAdminSession() {
        try {
            const response = await fetch('api/check_admin_session.php');
            const data = await response.json();
            if (!data.logged_in) {
                alert('No autorizado. Por favor, inicia sesión como administrador.');
                window.location.href = 'admin.html'; // Redirige a la página de login
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error al verificar sesión del administrador:', error);
            alert('Error de conexión al verificar la sesión. Por favor, inténtalo de nuevo.');
            window.location.href = 'admin.html';
            return false;
        }
    }

    // Obtener el esquema de la tabla (nombres de columnas, tipos, PK)
    async function fetchTableSchema(tableName) {
        try {
            const response = await fetch(`api/get_table_schema.php?table=${encodeURIComponent(tableName)}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const data = await response.json();

            if (data.success && data.schema) {
                currentTableSchema = data.schema;
                primaryKeyColumn = data.primary_key_column; // ¡Importante! Almacenar el nombre de la PK
                return data.schema;
            } else {
                console.error('Error al cargar el esquema de la tabla:', data.message);
                alert('No se pudo cargar el esquema de la tabla: ' + (data.message || 'Error desconocido'));
                return null;
            }
        } catch (error) {
            console.error('Error de red al cargar el esquema de la tabla:', error);
            alert('Error de conexión al cargar el esquema de la tabla.');
            return null;
        }
    }

    // Cargar y mostrar los datos de la tabla
    async function loadTableData(tableName) {
        if (!tableName) {
            tableTitle.textContent = 'Selecciona una tabla para gestionar.';
            tableBody.innerHTML = '';
            noDataMessage.style.display = 'block';
            return;
        }

        tableTitle.textContent = `Gestionando Tabla: ${tableName}`;
        tableBody.innerHTML = '<tr><td colspan="100%">Cargando datos...</td></tr>'; // Mensaje de carga
        noDataMessage.style.display = 'none';

        try {
            const schema = await fetchTableSchema(tableName);
            if (!schema) {
                tableBody.innerHTML = '<tr><td colspan="100%">Error al cargar el esquema de la tabla.</td></tr>';
                return;
            }

            // Generar cabeceras de tabla
            tableHeaderRow.innerHTML = '';
            schema.forEach(col => {
                const th = document.createElement('th');
                th.textContent = col.Field;
                tableHeaderRow.appendChild(th);
            });
            const actionsTh = document.createElement('th');
            actionsTh.textContent = 'Acciones';
            tableHeaderRow.appendChild(actionsTh);

            // Obtener los datos de la tabla
            const response = await fetch(`api/fetch_table_data.php?table=${encodeURIComponent(tableName)}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const data = await response.json();

            if (data.success && data.data) {
                tableBody.innerHTML = ''; // Limpiar el mensaje de carga
                if (data.data.length > 0) {
                    data.data.forEach(row => {
                        const tr = document.createElement('tr');
                        // Asegurarse de que la clave primaria exista en la fila
                        if (row[primaryKeyColumn] === undefined) {
                            console.warn(`La fila no contiene la columna de clave primaria '${primaryKeyColumn}'. Saltando fila.`, row);
                            return;
                        }
                        tr.dataset.id = row[primaryKeyColumn]; // Almacena el ID en el elemento tr

                        schema.forEach(col => {
                            const td = document.createElement('td');
                            // Trunca el texto si es muy largo
                            td.textContent = String(row[col.Field]).length > 50 ? String(row[col.Field]).substring(0, 50) + '...' : row[col.Field];
                            td.title = row[col.Field]; // Título para ver el texto completo al pasar el ratón
                            tr.appendChild(td);
                        });

                        const actionsTd = document.createElement('td');
                        const editButton = document.createElement('button');
                        editButton.textContent = 'Editar';
                        editButton.classList.add('button');
                        editButton.classList.add('edit-row-button'); // Añade una clase para identificarlo
                        editButton.dataset.id = row[primaryKeyColumn]; // Asocia el ID para editar
                        actionsTd.appendChild(editButton);

                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Eliminar';
                        deleteButton.classList.add('button', 'secondary', 'delete-row-button'); // Clases para estilo y JS
                        deleteButton.dataset.id = row[primaryKeyColumn]; // Asocia el ID para eliminar
                        actionsTd.appendChild(deleteButton);

                        tr.appendChild(actionsTd);
                        tableBody.appendChild(tr);
                    });
                } else {
                    noDataMessage.style.display = 'block';
                }
            } else {
                console.error('Error al cargar los datos de la tabla:', data.message);
                tableBody.innerHTML = `<tr><td colspan="100%">Error al cargar datos: ${data.message}</td></tr>`;
            }
        } catch (error) {
            console.error('Error de red al cargar los datos de la tabla:', error);
            tableBody.innerHTML = '<tr><td colspan="100%">Error de conexión al cargar los datos.</td></tr>';
        }
    }

    // --- Funciones de CRUD ---

    // Generar el formulario de añadir/editar dinámicamente
    function generateCrudForm(rowData = {}) {
        modalFormFields.innerHTML = ''; // Limpiar campos existentes
        currentTableSchema.forEach(col => {
            // No generar campo para la clave primaria si es auto_increment y estamos añadiendo
            if (col.Key === 'PRI' && col.Extra === 'auto_increment' && !rowData[col.Field]) {
                return;
            }

            const div = document.createElement('div');
            div.style.marginBottom = '15px';

            const label = document.createElement('label');
            label.textContent = col.Field + ':';
            label.setAttribute('for', `field-${col.Field}`);
            div.appendChild(label);

            let input;
            const value = rowData[col.Field] !== undefined ? rowData[col.Field] : '';

            // Intentar adivinar el tipo de input basado en el tipo de columna SQL
            if (col.Type.includes('int') || col.Type.includes('decimal')) {
                input = document.createElement('input');
                input.type = 'number';
            } else if (col.Type.includes('date')) {
                input = document.createElement('input');
                input.type = 'date';
            } else if (col.Type.includes('text') || col.Type.includes('varchar') || col.Type.includes('char')) {
                input = document.createElement('input');
                input.type = 'text';
            } else {
                input = document.createElement('input');
                input.type = 'text'; // Por defecto, texto
            }

            input.id = `field-${col.Field}`;
            input.name = col.Field;
            input.value = value;
            input.required = col.Null === 'NO' && !(col.Key === 'PRI' && col.Extra === 'auto_increment'); // Marcar como requerido si no es NULLABLE y no es PK auto_increment
            
            // Si es clave primaria y tiene un valor (edición), deshabilitar para no modificarlo
            if (col.Key === 'PRI' && rowData[col.Field]) {
                input.disabled = true;
            }

            div.appendChild(input);
            modalFormFields.appendChild(div);
        });
    }

    // Manejar el envío del formulario (añadir/editar)
    crudForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(crudForm);
        const rowData = {};
        for (let [key, value] of formData.entries()) {
            rowData[key] = value;
        }

        // Si es una edición, añadir el valor del ID deshabilitado
        if (crudForm.dataset.mode === 'edit' && crudForm.dataset.id) {
            const pkField = document.getElementById(`field-${primaryKeyColumn}`);
            if (pkField && pkField.disabled) { // Si el campo PK estaba deshabilitado
                rowData[primaryKeyColumn] = pkField.value;
            }
        }

        const action = crudForm.dataset.mode === 'add' ? 'add' : 'edit';
        const recordId = crudForm.dataset.id || null;

        try {
            saveCrudButton.disabled = true;
            saveCrudButton.textContent = 'Guardando...';

            const response = await fetch('api/manage_table_row.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    table: currentTableName,
                    action: action,
                    id: recordId, // Solo relevante para 'edit' o 'delete'
                    primary_key_column: primaryKeyColumn, // Pasamos el nombre de la PK
                    data: rowData
                })
            });

            const result = await response.json();

            if (result.success) {
                alert('Operación exitosa: ' + result.message);
                closeCrudModal();
                loadTableData(currentTableName); // Recargar datos de la tabla
            } else {
                alert('Error al guardar: ' + result.message);
            }
        } catch (error) {
            console.error('Error de red al guardar:', error);
            alert('Error de conexión al servidor.');
        } finally {
            saveCrudButton.disabled = false;
            saveCrudButton.textContent = 'Guardar Cambios';
        }
    });

    // Manejar clics en los botones de editar/eliminar
    tableBody.addEventListener('click', async (event) => {
        // Botón de EDITAR
        if (event.target.classList.contains('edit-row-button')) {
            const rowId = event.target.dataset.id;
            if (!rowId) {
                alert('ID de registro no encontrado para edición.');
                return;
            }

            // Obtener los datos de la fila específica para rellenar el formulario
            try {
                // ¡IMPORTANTE! Pasar el nombre de la columna PK a fetch_table_data.php
                const response = await fetch(`api/fetch_table_data.php?table=${encodeURIComponent(currentTableName)}&id=${encodeURIComponent(rowId)}&pk_column=${encodeURIComponent(primaryKeyColumn)}`);
                const data = await response.json();

                if (data.success && data.data && data.data.length > 0) {
                    const rowData = data.data[0];
                    openCrudModal(`Editar Registro en ${currentTableName}`);
                    generateCrudForm(rowData);
                    crudForm.dataset.mode = 'edit';
                    crudForm.dataset.id = rowId;
                } else {
                    alert('No se pudieron cargar los datos del registro para editar: ' + (data.message || 'Registro no encontrado.'));
                }
            } catch (error) {
                console.error('Error al cargar datos para edición:', error);
                alert('Error de conexión al cargar datos para edición.');
            }
        }

        // Botón de ELIMINAR
        if (event.target.classList.contains('delete-row-button')) {
            const rowId = event.target.dataset.id;
            if (!rowId) {
                alert('ID de registro no encontrado para eliminación.');
                return;
            }

            if (confirm(`¿Estás seguro de que quieres eliminar el registro con ID ${rowId} de la tabla ${currentTableName}?`)) {
                try {
                    const response = await fetch('api/manage_table_row.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            table: currentTableName,
                            action: 'delete',
                            id: rowId,
                            primary_key_column: primaryKeyColumn // Pasamos el nombre de la PK
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert('Registro eliminado exitosamente: ' + result.message);
                        loadTableData(currentTableName); // Recargar datos
                    } else {
                        alert('Error al eliminar el registro: ' + result.message);
                    }
                } catch (error) {
                    console.error('Error de red al eliminar:', error);
                    alert('Error de conexión al servidor al eliminar el registro.');
                }
            }
        }
    });

    // --- Event Listeners Globales ---
    closeCrudModalButton.addEventListener('click', closeCrudModal);
    window.addEventListener('click', (event) => {
        if (event.target === crudModal) {
            closeCrudModal();
        }
    });

    // Botón "Añadir Nuevo Registro"
    addNewRowButton.addEventListener('click', () => {
        openCrudModal(`Añadir Nuevo Registro a ${currentTableName}`);
        generateCrudForm({}); // Vacío para un nuevo registro
        crudForm.dataset.mode = 'add';
        delete crudForm.dataset.id; // Asegurarse de que no haya ID de edición
    });


    // --- Inicialización ---
    // Obtener el nombre de la tabla de la URL
    const urlParams = new URLSearchParams(window.location.search);
    currentTableName = urlParams.get('table');

    // Primero, verificar si el admin está logeado. Si no, la función redirigirá.
    if (await checkAdminSession()) {
        if (currentTableName) {
            loadTableData(currentTableName); // Cargar datos de la tabla especificada
        } else {
            tableTitle.textContent = 'No se ha seleccionado ninguna tabla.';
            tableBody.innerHTML = '<tr><td colspan="100%">Por favor, selecciona una tabla desde el panel de control.</td></tr>';
            noDataMessage.style.display = 'block';
            addNewRowButton.disabled = true; // Deshabilitar añadir si no hay tabla
        }
    }
});