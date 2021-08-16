function openCard() {
    viewCardBar()
    window.listenerQuantityProduct = quantityProduct
}

async function viewCardBar() {

    document.querySelector('.popup-card').classList.toggle('hidden')
    document.querySelector('.popup-card__bar-product-wrapper').classList.toggle('loading')

    await showCartProduct()

    priceSeparator()

    document.querySelector('.popup-card__bar-product-wrapper').classList.toggle('loading')

}

function actionCardClose() {
    alert('cli cli !!@##@')
}

async function getResponse(url = '/cart.js') {
    try {
        const response = await fetch(url,
            {
                method: "GET",
                headers: {'Content-Type': 'application/json;charset=utf-8'},
            }
        );
        let responseData;
        responseData = await response.json();
        return responseData;
    } catch (e) {
        console.error(e)
    }
}

async function setCart(url, data = [{}]) {
    try {
        const response = await fetch(url,
            {
                method: "POST",
                headers: {'Content-Type': 'application/json;charset=utf-8'},
                body: JSON.stringify(data)
            }
        );
        let responseData;
        responseData = await response.json();
        return responseData;
    } catch (e) {
        console.error(e)
    }
}

async function responseProducts(items, value = []) {

    if (items.length == 0) {
        return value
    }

    value.push(items.pop())
    value[value.length - 1].other = await getResponse('/products/' + value[value.length - 1].handle + '.js');

    return await responseProducts(items, value)
}

function showCartDetail({item_count = '', total_price = '', currency = ''}) {
    document.querySelector('.popup-card__bar-head-qualete').innerHTML = item_count;
    document.querySelector('.popup-card__bar-subtotal').innerHTML = total_price;
}

async function showCartProduct() {
    let r = await getResponse();

    let raw = r.items

    let responseCart = document.createElement('div')

    let product = document.createElement('div')
    let html = ''

    let items = await responseProducts(raw)

    items.forEach(item => {
        console.log(item);

        let compare_price = ''
        item.other.variants.forEach(variant => {
            if (variant.id === item.variant_id) {
                compare_price = variant.compare_at_price
            }
            return
        })

        let product_title = item.product_title ? '<div>' + item.product_title + '</div>' : '';
        let variant_title = item.variant_title ? '<div>' + item.variant_title + '</div>' : '';
        let compare_at_price = compare_price ? '<div class="product-compare-price decimal-js">' + compare_price + '</div>' : '';
        let line_price = item.final_line_price ? '<div class="product-price decimal-js">' + item.final_line_price + '</div>' : '';

        html +=
            '<div class="item-inner">' +
            '<div class="circle-img">' +
            '<img class="circle-img" src="' + item.image + '" >' +
            '</div>' +
            '<div class="product-info">' +
            product_title +
            variant_title +
            '<div class="price-group">' +
            line_price +
            compare_at_price +
            '</div>' +
            '<div class="product-form__controls-group">\n' +
            '<button class="number-minus" type="button" onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.oninput();">-</button>\n' +
            '<input data-id="' + item.variant_id + '" type="number" data-handle="' + item.handle + '" type="number"' +
            'name="quantity" value="' + item.quantity + '" min="1" pattern="[0-9]*"' +
            'class="product-form__input product-form__input--quantity" data-quantity-input oninput="listenerQuantityProduct(this)">' +
            '<button class="number-plus" type="button" onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.oninput();">+</button>\n' +
            '</div>' +
            '</div>' +
            '</div>';

    })

    product.innerHTML = html

    document.querySelector('.popup-card__bar-product-wrapper').append(product)

    showCartDetail({
        item_count: r.item_count,
        total_price: r.total_price,
        currency: r.currency
    })
}

function priceSeparator() {
    let priceArray = document.querySelectorAll('.decimal-js')
    priceArray.forEach(e => {
        e.innerHTML = decimalSeparator(e.textContent);
    })
}

function decimalSeparator(number) {
    return number.replace(/^(\d*)([\d])(\d{2})$/, '$1$2.$3');
}

async function quantityProduct(e) {

    let response = await setCart('/cart/change.js', {
        'id': e.dataset.id,
        'quantity': e.value
    })
    console.log('response', response);

    let final_line_price = ''
    response.items.forEach(item => {
        if (item.id == e.dataset.id) {
            final_line_price = item.final_line_price
        }
        return
    })

    document.querySelector('.popup-card__bar-head-qualete').innerHTML = response.item_count
    document.querySelector('.popup-card__bar-subtotal').innerHTML = response.total_price
    e.closest('.product-info').querySelector('.product-price').innerHTML = final_line_price

    priceSeparator()
}
