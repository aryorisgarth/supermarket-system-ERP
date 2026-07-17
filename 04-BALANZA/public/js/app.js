// Variables de estado
let SCALE_DATABASE = {};
let ALL_PRODUCTS = [];
let CATEGORIES = new Set();
let SCALE_CONFIG = { prefix: '20', pluLength: 5 };

async function resolveErpUrls() {
    try {
        const cfgRes = await fetch('/api/config');
        if (cfgRes.ok) {
            const cfg = await cfgRes.json();
            return {
                productsUrl: cfg.productsActiveUrl,
                scaleConfigUrl: cfg.scaleConfigUrl,
            };
        }
    } catch (_) {
        /* fallback abajo */
    }

    const { protocol, hostname } = window.location;
    const host = hostname === 'localhost' ? '127.0.0.1' : hostname;
    return {
        productsUrl: `${protocol}//${host}:8081/api/products/active`,
        scaleConfigUrl: `${protocol}//${host}:8081/api/scale-config`,
    };
}

function registerProduct(prodObj) {
    ALL_PRODUCTS.push(prodObj);
    SCALE_DATABASE[prodObj.originalBarcode] = prodObj;
    SCALE_DATABASE[prodObj.displayBarcode] = prodObj;
    SCALE_DATABASE[prodObj.originalBarcode.replace(/^0+/, '')] = prodObj;
    if (prodObj.displayBarcode !== prodObj.originalBarcode) {
        SCALE_DATABASE[String(prodObj.displayBarcode).padStart(5, '0')] = prodObj;
    }
}

// Sincronizar productos con el ERP
async function loadProductsFromERP() {
    const statusEl = document.getElementById('erpStatus');
    try {
        const { productsUrl, scaleConfigUrl } = await resolveErpUrls();

        const [productsRes, scaleRes] = await Promise.all([
            fetch(productsUrl),
            fetch(scaleConfigUrl).catch(() => null),
        ]);

        if (!productsRes.ok) throw new Error('Error al conectar con el ERP');

        if (scaleRes && scaleRes.ok) {
            SCALE_CONFIG = await scaleRes.json();
        }

        const products = await productsRes.json();
        ALL_PRODUCTS = [];
        CATEGORIES.clear();
        SCALE_DATABASE = {};

        products.forEach((p) => {
            if (!p.barcode || !window.PluUtils.isPluProduct(p, SCALE_CONFIG)) return;

            const categoryName = p.category?.name || 'Sin Categoría';
            CATEGORIES.add(categoryName);

            const displayBarcode = window.PluUtils.extractDisplayPlu(p.barcode, SCALE_CONFIG);
            const prodObj = {
                originalBarcode: String(p.barcode),
                displayBarcode,
                name: p.name,
                price: p.salePrice || 0,
                category: categoryName,
            };

            registerProduct(prodObj);
        });

        console.log(`✅ ${ALL_PRODUCTS.length} productos PLU sincronizados desde el ERP`);
        if (statusEl) {
            statusEl.innerHTML = `<span class="text-green-600 font-bold">🟢 ERP Conectado · ${ALL_PRODUCTS.length} PLU</span>`;
        }
        populateCategories();
        renderProducts();
    } catch (error) {
        console.warn('⚠️ No se pudo conectar al ERP. Usando datos de respaldo.', error);
        if (statusEl) {
            statusEl.innerHTML = '<span class="text-red-600 font-bold">🔴 ERP Desconectado (Usando respaldo)</span>';
        }

        ALL_PRODUCTS = [];
        SCALE_DATABASE = {};
        CATEGORIES.clear();

        [
            { displayBarcode: '1204', originalBarcode: '1204', name: 'Carne Premium', price: 110.0, category: 'Carnes' },
            { displayBarcode: '85', originalBarcode: '85', name: 'Queso Seco', price: 45.0, category: 'Lácteos' },
        ].forEach((p) => {
            CATEGORIES.add(p.category);
            registerProduct(p);
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

    Array.from(CATEGORIES)
        .sort()
        .forEach((cat) => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
}

// Dibujar los botones dinámicos de los productos en pantalla
window.renderProducts = function () {
    const container = document.getElementById('productsContainer');
    const selectedCategory = document.getElementById('categorySelect').value;

    if (!container) return;
    container.innerHTML = '';

    let filteredProducts = ALL_PRODUCTS;
    if (selectedCategory !== 'ALL') {
        filteredProducts = ALL_PRODUCTS.filter((p) => p.category === selectedCategory);
    }

    if (filteredProducts.length === 0) {
        container.innerHTML =
            '<div class="col-span-full flex items-center justify-center h-32 text-gray-400 font-bold text-center px-4">No hay productos PLU. Verifique códigos cortos (4011) o unidad KG/LB en el ERP.</div>';
        return;
    }

    filteredProducts
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((product) => {
            const btn = document.createElement('button');
            btn.onclick = () => window.setPreset(product.displayBarcode, product.price);
            btn.className =
                'bg-white border-2 border-gray-200 rounded-xl p-3 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md active:bg-blue-100 transition-all text-left flex flex-col justify-between group h-24';

            btn.innerHTML = `
            <div class="font-black text-[13px] leading-tight text-gray-800 uppercase line-clamp-2 group-hover:text-blue-900">${product.name}</div>
            <div class="flex justify-between items-end mt-auto w-full">
                <div class="text-[11px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[60%]">${product.category}</div>
                <div class="text-[13px] text-blue-600 font-black px-2 py-0.5 bg-blue-100 rounded-md shadow-sm">PLU ${product.displayBarcode}</div>
            </div>
        `;
            container.appendChild(btn);
        });
};

// Rellenar automáticamente PLU y Precio
window.setPreset = function (plu, price) {
    document.getElementById('pluInput').value = plu;
    document.getElementById('priceInput').value = price;

    const randomWeight = (Math.random() * (4 - 0.5) + 0.5).toFixed(3);
    document.getElementById('weightInput').value = randomWeight;

    document.getElementById('pluInput').dispatchEvent(new Event('input'));
    window.calculateTotal();
};

window.calculateTotal = function () {
    const weight = parseFloat(document.getElementById('weightInput').value) || 0;
    const price = parseFloat(document.getElementById('priceInput').value) || 0;
    document.getElementById('totalDisplay').innerText = (weight * price).toFixed(2);
};

window.generateLabel = async function () {
    const plu = document.getElementById('pluInput').value.trim();
    const weight = document.getElementById('weightInput').value.trim();
    const price = document.getElementById('priceInput').value.trim();
    const total = document.getElementById('totalDisplay').innerText;

    if (!plu || !weight) {
        alert('Por favor ingresa al menos el PLU y el Peso.');
        return;
    }

    try {
        const res = await fetch('/api/generate-ean13', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plu, weight }),
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
        document.getElementById('lblPrice').innerText = price ? Number(price).toFixed(2) : '0.00';
        document.getElementById('lblTotal').innerText = total;

        const today = new Date();
        document.getElementById('lblDate').innerText = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        if (window.JsBarcode) {
            JsBarcode('#barcode', ean13, {
                format: 'EAN13',
                width: 2,
                height: 60,
                displayValue: false,
                margin: 0,
                lineColor: '#000000',
            });
        }

        document.getElementById('rawBarcodeDisplay').innerText = ean13;
    } catch (err) {
        alert('Error al generar etiqueta EAN13. Verifique que el servicio de balanza esté activo.');
    }
};

document.addEventListener('DOMContentLoaded', () => {
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

    loadProductsFromERP();
});
