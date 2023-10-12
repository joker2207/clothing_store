async function getApi() {
    const URL = "https://ecommercebackend.fundamentos-29.repl.co";
    try {
        const data = await fetch(URL);
        const res = await data.json();
        localStorage.setItem('products', JSON.stringify(res));
        return res;

    } catch (error) {
        console.log(error);

    }
}
async function database() {
    const db = {
        products: JSON.parse(localStorage.getItem('products')) || await getApi(),
        cart: JSON.parse(localStorage.getItem('cart')) || {}
    }
    return db;
}
function handels() {
    const btn = document.querySelector('.header_btn');
    const list = document.querySelector('.header_list');
    const cart = document.querySelector('.cart_btn');
    const modal = document.querySelector('.cart_modal');

    btn.addEventListener('click', function () {
        list.classList.toggle('active');
    });
    list.addEventListener('click', function () {
        list.classList.remove('active');
    });
    cart.addEventListener('click', () => {
        modal.classList.toggle('active');
    });
}
function addToCart(db) {
    const add = document.querySelector('.products');
    add.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn_add')) {
            const id = +event.target.closest('.product').id;
            const article = db.products.find(element => element.id === id);

            if (article.quantity > 0) { // Verifica si hay stock disponible
                if (article.id in db.cart) {
                    if (db.cart[id].amount === db.cart[id].quantity) {
                        alert('Este producto está agotado. Le invitamos a seguir viendo nuestras demás prendas');
                        return;
                    }
                    db.cart[article.id].amount++;
                } else {
                    article.amount = 1;
                    db.cart[article.id] = article;
                }
                localStorage.setItem('cart', JSON.stringify(db.cart));
                printCart(db.cart);
                printTotals(db);
            } else {
                alert('Sin stock'); // Muestra un mensaje si no hay stock
                const productElement = document.getElementById(id);
                if (productElement) {
                    const quantityElement = productElement.querySelector('.product_description span:last-child');
                    if (quantityElement) {
                        quantityElement.innerHTML = '<strong>Sin stock</strong>';
                    }
                }
            }
        }
    });
}
function printProductos(products) {
    const print = document.querySelector('.products');
    let html = '';
    for (const item of products) {
        /**console.log(item)**/
        const { category, id, price, quantity,
            image } = item;
        html += `
        <div id="${id}" class="product">
                <figure class="product_img if${quantity}">
                    <img src="${image}" alt="imagen del producto">
                </figure>
            <p
                class="product_description">
                <span>Categoría:</span>${category}<br>
                <span>Precio:</span>$${price} USD<br>
                <span>Cantidad:</span>${quantity}Units<br>
            </p>
            <div class="product_buttons">
                <button class="btn_view">Ver detalle</button>
                <button class="btn_add">Agregar al Carrito</button>        
            </div>        
        </div> `
    }
    print.innerHTML = html;
}
function printCart(products) {
    const print = document.querySelector('.cart_products');
    let html = "";
    for (const key in products) {
        const { amount, category, id,
            image, price, quantity } = products[key];
        html += `
        <div id="${id}" class="cart__product">
            <figure class="cart__product__img">
                <img src="${image}" alt="image product">
            </figure>
            <div class="cart__product__container">
                <p class="cart__product__description">
                    <span>Categoría:</span> ${category}<br>
                    <span>precio:</span> $${price} USD<br>
                    <span>Cantidad:</span> ${quantity} Units<br>
                </p>
                <div class="cart__product__buttons">
                    <ion-icon class="less" name="remove-circle-outline"></ion-icon>
                    <span>${amount}</span>
                    <ion-icon class="plus" name="add-circle-outline"></ion-icon>
                    <ion-icon class="trash" name="trash-outline"></ion-icon>
                </div>
            </div>
        </div>
        `;
    }
    print.innerHTML = html;
}
function handleCart(db) {
    const cart = document.querySelector('.cart_products');
    cart.addEventListener('click', (event) => {

        if (event.target.classList.contains('less')) {
            const id = +event.target.closest('.cart__product').id;
            if (db.cart[id].amount === 1) {
                return alert('La cantidad minima que puedes comprar es una prenda')
            }
            db.cart[id].amount--;
        }
        if (event.target.classList.contains('plus')) {
            const id = +event.target.closest('.cart__product').id;
            if (db.cart[id].amount === db.cart[id].quantity) {
                return alert('No tenemos mas prendas disponibles en bodegas');
            }
            db.cart[id].amount++;
        }
        if (event.target.classList.contains('trash')) {
            const id = +event.target.closest('.cart__product').id;
            delete db.cart[id]; // Asegúrate de eliminar el elemento del carrito aquí
        }
        localStorage.setItem('cart', JSON.stringify(db.cart)); // Actualiza el localStorage después de la eliminación
        printCart(db.cart);
        printTotals(db);
    });
}
function printTotals(db) {
    const cartTotals = document.querySelector('.cart_totals div');
    const cartIcon = document.querySelector('.cart_btn span');
    let cantidad = 0;
    let totales = 0;
    for (const key in db.cart) {
        const { amount, price } = db.cart[key];
        cantidad += amount;
        totales += amount * price;
    }
    let html = `
        <p><span>Cantidad:</span> ${cantidad}</p>
        <p><span>Total:</span> $${totales} USD</p>
    `;
    cartTotals.innerHTML = html;
    cartIcon.innerHTML = cantidad;
}
function handleTotals(db) {
    const btnBuy = document.querySelector('.btn__buy');
    const cartModal = document.querySelector('.cart_modal');

    btnBuy.addEventListener('click', () => {
        if (!Object.values(db.cart).length) {
            return alert('Debes agregar productos a tu carrito antes de poder realizar tu compra');
        }
        const response = confirm('¿Estás seguro de querer realizar esta compra?');
        if (!response) {
            return;
        }
        const productsToUpdate = []; // Almacenar productos que necesitan actualizarse
        for (const key in db.cart) {
            const product = db.products.find(p => p.id === db.cart[key].id);
            if (product) {
                const newQuantity = product.quantity - db.cart[key].amount;
                if (newQuantity < 0) {
                    alert('No tenemos suficiente stock de esta prenda. Puedes seguir comprando otras prendas.');
                } else {
                    product.quantity = newQuantity;
                    productsToUpdate.push(product);
                }
            }
        }
        // Actualizar la base de datos solo para los productos que no tienen stock insuficiente
        productsToUpdate.forEach(product => {
            const index = db.products.findIndex(p => p.id === product.id);
            db.products[index] = product;
        });
        db.cart = {}; // Vacía el carrito
        localStorage.setItem('products', JSON.stringify(db.products));
        localStorage.setItem('cart', JSON.stringify(db.cart));
        printProductos(db.products);
        printCart(db.cart);
        printTotals(db);
        cartModal.classList.remove('active'); // Cierra el modal del carrito
    });
}

function filtersProducts(products) {
    const list = document.querySelectorAll('.header_list li');
    list[0].addEventListener('click', () => {
        printProductos(products);
    })

    list[1].addEventListener('click', () => {
        const shirts = products.filter(element => element.category === 'shirt');
        printProductos(shirts);
    })

    list[2].addEventListener('click', () => {
        const hoddies = products.filter(element => element.category === 'hoddie');
        printProductos(hoddies);
    })

    list[3].addEventListener('click', () => {
        const sweaters = products.filter(element => element.category === 'sweater');
        printProductos(sweaters);
    })

}
function showDetails(products) {
    const readBtn = document.querySelector('.products');
    const showModal = document.querySelector('.view__modal');
    const closeModal = document.querySelector('.close__modal');
    const contentModal = document.querySelector('.content__modal')
    readBtn.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn_view')) {
            const id = +event.target.closest('.product').id;
            const article = products.find(element => element.id === id);
            if (article) {
                const { category, description, image, name, price, quantity } = article;
                let html = `
                    <div class="modal__product">
                        <figure class="modal__product__img">
                            <img src="${image}" alt="image product">
                        </figure>
                        <div class="modal__product__details">
                            <p class="modal__product__short">
                                <span>Categoría:</span> ${category}<br>
                                <span>Precio:</span> $${price} USD<br>
                                <span>Cantidad:</span> ${quantity} Units<br>
                            </p>
                            <p class="modal__product__long">
                                <span>Nombre:</span> ${name}<br>
                                <span>Descripción:</span> ${description}<br>
                            </p>
                        </div>
                    </div>
                 `;
                contentModal.innerHTML = html;
                showModal.classList.add('active');
            }
        }
    });
    closeModal.addEventListener('click', () => {
        showModal.classList.remove('active');
    });
}

async function main() {
    const db = await database();
    handels();
    printProductos(db.products);
    addToCart(db);
    printCart(db.cart);
    handleCart(db);
    printTotals(db);
    handleTotals(db);
    filtersProducts(db.products);
    showDetails(db.products);
}
main();