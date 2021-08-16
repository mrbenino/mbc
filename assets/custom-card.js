function openCard() {
    let popup = document.createElement("div")
    popup.classList.add('popup-card')
    document.body.append(popup)
    viewCardBar(popup)
    window.listenerQuantityProduct = quantityProduct
}

async function viewCardBar(popup) {
    let cardBar = document.createElement("div")
    cardBar.innerHTML = '' +
        '<div class="popup-card__bar-head">' +
        '<div class="popup-card__bar-head-title">Cart (<span class="popup-card__bar-head-qualete"></span>items)</div>' +
        '<button class="popup-card__bar-close" onclick="actionCardClose()"><svg width="26" height="25" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="#202020" d="m1.354.646 24 24M.646 24.646l24-24"/></svg></button>' +
        '</div>' +
        '<div class="popup-card__bar-product-wrapper loading">' +
        '</div>' +
        '<div class="popup-card__bar-bottom">' +
        '<div class="popup-card__bar-inner-subtotal">' +
        '<div>Subtotal</div>' +
        '<div class="popup-card__bar-subtotal decimal-js"></div>' +
        '</div>' +
        '<div class="popup-card__bar-bottom-inner-btn">' +
        '<a class="popup-card__view-card" html="">View cart</a>' +
        '<a class="popup-card__checkout" html="">Proceed to checkout</a>' +
        '</div>' +
        '</div>'

    cardBar.classList.add('popup-card__bar')

    popup.append(cardBar)

    await showCartProduct()

    priceSeparator()

    document.querySelector('.popup-card__bar-product-wrapper').classList.remove('loading')

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

async function setCart(url , data = [{}]) {
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



    // items.other.variants.forEach(variant => {
    //      if (variant.id === items.variant_id) {
    //          console.log(variant)
    //      }
    //
    //      return
    // })

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
        let line_price = item.price ? '<div class="product-price decimal-js">' + item.price + '</div>' : '';

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
    console.log('response',response);
    //
    // let product = await getResponse('/products/' + e.dataset.handle + '.js');
    //
    // console.log('product', product);
    let final_line_price = ''
    response.items.forEach(item => {
        if (item.id == e.dataset.id) {
            final_line_price= item.final_line_price
        }

        return
    })

    document.querySelector('.popup-card__bar-head-qualete').innerHTML = response.item_count
    document.querySelector('.popup-card__bar-subtotal').innerHTML = response.total_price
    e.closest('.product-info').querySelector('.product-price').innerHTML = final_line_price

    priceSeparator()
}
