// Variables de estado
let SCALE_DATABASE = {};
let ALL_PRODUCTS = [];
let CATEGORIES = new Set();

// Sincronizar productos con el ERP
async function loadProductsFromERP() {
    try {
        const response = await fetch('http://127.0.0.1:8081/api/products/active');
        if (!response.ok) throw new Error('Error al conectar con el ERP');
        
        const products = await response.json();
        ALL_PRODUCTS = [];
        CATEGORIES.clear();
        
        products.forEach(p => {
            if (p.barcode) {
                const categoryName = p.category?.name || "Sin Categoría";
                const isShortCode = String(p.barcode).replace(/^0+/, '').length <= 6;
                const isPluPrefix = String(p.barcode).startsWith('20') && String(p.barcode).length === 13;
                
                // En la balanza SOLO deben aparecer productos que se venden por PESO (LB, KG, GR)
                // Ignoramos productos que se venden por unidad (UN, EA, etc.) aunque tengan un código corto.
                const isWeighed = p.uomBase === 'LB' || p.uomBase === 'KG' || p.uomBase === 'GR' || p.uomBase === 'g';
                
                if (isWeighed) {
                    CATEGORIES.add(categoryName);
                    
                    let displayBarcode = String(p.barcode);
                    if (isPluPrefix) {
                        displayBarcode = displayBarcode.substring(2, 7).replace(/^0+/, '');
                    } else {
                        displayBarcode = displayBarcode.replace(/^0+/, '');
                    }
                    
                    const prodObj = {
                        originalBarcode: String(p.barcode),
                        displayBarcode: displayBarcode,
                        name: p.name,
                        price: p.salePrice || 0,
                        category: categoryName
                    };
                    
                    ALL_PRODUCTS.push(prodObj);
                    
                    SCALE_DATABASE[prodObj.originalBarcode] = prodObj;
                    SCALE_DATABASE[prodObj.displayBarcode] = prodObj;
                    SCALE_DATABASE[prodObj.originalBarcode.replace(/^0+/, '')] = prodObj;
                }
            }
        });
        
        console.log('✅ Productos sincronizados desde el ERP en la Balanza');
        document.getElementById('erpStatus').innerHTML = '<span class="text-green-600 font-bold">🟢 ERP Conectado</span>';
        populateCategories();
        renderProducts();
    } catch (error) {
        console.warn('⚠️ No se pudo conectar al ERP. Usando datos de respaldo.', error);
        document.getElementById('erpStatus').innerHTML = '<span class="text-red-600 font-bold">🔴 ERP Desconectado (Usando respaldo)</span>';
        
        // Datos de respaldo para demostración
        ALL_PRODUCTS = [
            { displayBarcode: "1204", name: "Carne Premium", price: 110.00, category: "Carnes" },
            { displayBarcode: "85", name: "Queso Seco", price: 45.00, category: "Lácteos" }
        ];
        ALL_PRODUCTS.forEach(p => {
            SCALE_DATABASE[p.displayBarcode] = p;
            CATEGORIES.add(p.category);
        });
        populateCategories();
        renderProducts();
    }
}

// Cargar categorías dinámicas en el `<select>`
function populateCategories() {
    const select = document.getElementById('categorySelect');
    if (!select) return;
    
    select.innerHTML = '<option value="ALL">Todas las Categorías</option>';
    
    const sortedCategories = Array.from(CATEGORIES).sort();
    sortedCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

// Dibujar los botones dinámicos de los productos en pantalla
// (esta función se expone globalmente para usarse en onchange en index.html)
window.renderProducts = function() {
    const container = document.getElementById('productsContainer');
    const selectedCategory = document.getElementById('categorySelect').value;
    
    if (!container) return;
    container.innerHTML = '';
    
    let filteredProducts = ALL_PRODUCTS;
    if (selectedCategory !== 'ALL') {
        filteredProducts = ALL_PRODUCTS.filter(p => p.category === selectedCategory);
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="col-span-full flex items-center justify-center h-32 text-gray-400 font-bold">No hay productos PLU en esta categoría</div>';
        return;
    }

    filteredProducts.sort((a, b) => a.name.localeCompare(b.name)).forEach(product => {
        const btn = document.createElement('button');
        btn.onclick = () => window.setPreset(product.displayBarcode, product.price);
        btn.className = "bg-white border-2 border-gray-200 rounded-xl p-3 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md active:bg-blue-100 transition-all text-left flex flex-col justify-between group h-24";
        
        btn.innerHTML = `
            <div class="font-black text-[13px] leading-tight text-gray-800 uppercase line-clamp-2 group-hover:text-blue-900">${product.name}</div>
            <div class="flex justify-between items-end mt-auto w-full">
                <div class="text-[11px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[60%]">${product.category}</div>
                <div class="text-[13px] text-blue-600 font-black px-2 py-0.5 bg-blue-100 rounded-md shadow-sm">PLU ${product.displayBarcode}</div>
            </div>
        `;
        container.appendChild(btn);
    });
}

// Rellenar automáticamente PLU y Precio
window.setPreset = function(plu, price) {
    document.getElementById('pluInput').value = plu;
    document.getElementById('priceInput').value = price;
    
    // Simular un peso aleatorio
    const randomWeight = (Math.random() * (4 - 0.5) + 0.5).toFixed(3);
    document.getElementById('weightInput').value = randomWeight;

    // Disparar evento de input manualmente
    document.getElementById('pluInput').dispatchEvent(new Event('input'));
    window.calculateTotal();
}

// Calcular Total
window.calculateTotal = function() {
    const weight = parseFloat(document.getElementById('weightInput').value) || 0;
    const price = parseFloat(document.getElementById('priceInput').value) || 0;
    const total = weight * price;
    document.getElementById('totalDisplay').innerText = total.toFixed(2);
}

// Generar código de barras e imprimir etiqueta visual
window.generateLabel = async function() {
    const plu = document.getElementById('pluInput').value.trim();
    const weight = document.getElementById('weightInput').value.trim();
    const price = document.getElementById('priceInput').value.trim();
    const total = document.getElementById('totalDisplay').innerText;

    if (!plu || !weight) {
        alert("Por favor ingresa al menos el PLU y el Peso.");
        return;
    }

    try {
        const res = await fetch('http://localhost:3030/api/generate-ean13', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plu: plu, weight: weight })
        });

        const data = await res.json();
        const ean13 = data.ean13;

        const label = document.getElementById('labelContainer');
        label.classList.remove('scale-95', 'opacity-50');
        label.classList.add('scale-100', 'opacity-100');

        const help = document.getElementById('helpText');
        if (help) help.style.display = 'none';

        document.getElementById('lblPlu').innerText = plu.padStart(5, '0');
        document.getElementById('lblWeight').innerText = Number(weight).toFixed(3);
        document.getElementById('lblPrice').innerText = price ? Number(price).toFixed(2) : "0.00";
        document.getElementById('lblTotal').innerText = total;

        const today = new Date();
        document.getElementById('lblDate').innerText = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        if (window.JsBarcode) {
            JsBarcode("#barcode", ean13, {
                format: "EAN13",
                width: 2,
                height: 60,
                displayValue: false,
                margin: 0,
                lineColor: "#000000"
            });
        }

        document.getElementById('rawBarcodeDisplay').innerText = ean13;

    } catch (err) {
        alert("Error al conectar con la API de generación EAN13. Asegúrate de ejecutar: node server.js en la carpeta BALANZA");
    }
}

// Configurar Event Listeners al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // Escuchar cuando el usuario digita el PLU
    document.getElementById('pluInput').addEventListener('input', function (e) {
        const rawPlu = e.target.value.trim();
        const pluSinCeros = rawPlu.replace(/^0+/, ''); 
        
        const product = SCALE_DATABASE[rawPlu] || SCALE_DATABASE[pluSinCeros];

        if (product) {
            document.getElementById('priceInput').value = product.price.toFixed(2);
            document.getElementById('pluInput').classList.add('text-green-600');
            window.calculateTotal();
        } else {
            document.getElementById('pluInput').classList.remove('text-green-600');
        }
    });

    // Iniciar carga de ERP
    loadProductsFromERP();
});
