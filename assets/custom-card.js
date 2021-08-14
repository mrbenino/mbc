function openCard() {
    let popup = document.createElement("div")
    popup.classList.add('popup-card')
    document.body.append(popup)
    viewCardBar(popup)
}

async function viewCardBar(popup) {
    let cardBar = document.createElement("div")
    cardBar.innerHTML = '' +
        '<div class="popup-card__bar-head">' +
        '<div class="popup-card__bar-head-title">Cart (<span class="popup-card__bar-head-qualete">8</span>items)</div>' +
        '<button class="popup-card__bar-close" onclick="actionCardClose()"><svg width="26" height="25" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="#202020" d="m1.354.646 24 24M.646 24.646l24-24"/></svg></button>' +
        '</div>' +
        '<div class="popup-card__bar-product-wrapper">' +
        '</div>' +
        '<div class="popup-card__bar-bottom">' +
        '</div>'

    cardBar.classList.add('popup-card__bar')

    popup.append(cardBar)

    let r = await getResponse();

    console.log(r)

    let raw = r.items

    let responseCart = document.createElement("div")

    let product = document.createElement('div')
    let html = ''

    let items = await responseProducts(raw)

    items.forEach(item => {

        let product_title = item.product_title ? '<div>'+ item.product_title +'</div>' : '';
        let variant_title = item.variant_title ? '<div>'+ item.variant_title +'</div>' : '';
        let compare_at_price = item.other.compare_at_price ? '<div>'+ item.other.compare_at_price + '</div>'  : '';
        let line_price = item.line_price ? '<div>'+ item.line_price + '</div>'  : '';

        html +=
            '<div class="item-inner">' +
                '<div class="circle-img">' +
                    '<img class="circle-img" src="' + item.image + '" >' +
                '</div>' +
                '<div class="product-info">' +
                    product_title +
                    variant_title +
                    compare_at_price +
                    line_price +
                    '<div class="product-form__controls-group">\n' +
                        '<button class="number-minus" type="button" onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.onchange();">-</button>\n' +
                        '<input type="number"' +
                        'name="quantity" value="' + item.quantity + '" min="1" pattern="[0-9]*"' +
                        'class="product-form__input product-form__input--quantity" data-quantity-input>' +
                        '<button class="number-plus" type="button" onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.onchange();">+</button>\n' +
                    '</div>' +
                '</div>' +
            '</div>';

    })

    product.innerHTML = html

    document.querySelector('.popup-card__bar-product-wrapper').append(product)

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

async function responseProducts(items, value  = []) {

    if (items.length == 0) {
        return value
    }

    value.push(items.pop())
    value[value.length -1].other = await getResponse('/products/' + value[value.length -1].handle + '.js');

    return await responseProducts(items, value)
}


