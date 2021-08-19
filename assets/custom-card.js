(function () {
    window.AjaxCart = function () {
        this.elements = {}

        this.selectors = {
            popupCard: '.popup-card',
            popupCardBar: '.popup-card__bar-product-wrapper',
            popupCardBarQuality: '.popup-card__bar-head-quality',
            popupCardBarSubtotal: '.popup-card__bar-subtotal',
            productPrice: '.product-price',
            productInfo: '.product-info',
            openCart: '#openCart'
        }

        this._initElements = function () {
            this.elements.popupCard = document.querySelector(this.selectors.popupCard)
            this.elements.popupCardBar = document.querySelector(this.selectors.popupCardBar)
            this.elements.openCart = document.querySelector(this.selectors.openCart)
        }

        this._eventListeners = function () {
            this.elements.openCart.addEventListener('click', async () => {
                await this._viewCardBar()
            })
            window.listenerQuantityProduct = this._quantityProduct.bind(this)
            window.listenerCardClose = this._actionCardClose.bind(this)
        }

        this._viewCardBar = async function () {
            this.elements.popupCard.classList.toggle('hidden')
            this.elements.popupCardBar.classList.toggle('loading')

            await this._showCartProduct()

            this._priceSeparator()

            this.elements.popupCardBar.classList.toggle('loading')
        }

        this._actionCardClose = function () {
            this.elements.popupCard.classList.toggle('hidden')
            this.elements.popupCardBar.innerHTML = ''
        }

        this._getResponse = async function (url = '/cart.js') {
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

        this._setCart = async function (url, data = [{}]) {
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

        this._responseProducts = async function (items, value = []) {

            if (items.length == 0) {
                return value
            }

            value.push(items.pop())
            value[value.length - 1].other = await this._getResponse('/products/' + value[value.length - 1].handle + '.js');

            return await this._responseProducts(items, value)
        }

        this._showCartDetail = function ({item_count = '', total_price = '', currency = ''}) {
            document.querySelector(this.selectors.popupCardBarQuality).innerHTML = item_count;
            document.querySelector(this.selectors.popupCardBarSubtotal).innerHTML = total_price;
        }

        this._showCartProduct = async function () {
            let r = await this._getResponse();

            let raw = r.items

            let product = document.createElement('div')
            let html = ''

            let items = await this._responseProducts(raw)

            items.forEach(item => {
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

            this.elements.popupCardBar.append(product)

            this._showCartDetail({
                item_count: r.item_count,
                total_price: r.total_price,
                currency: r.currency
            })
        }

        this._priceSeparator = function () {
            let priceArray = document.querySelectorAll('.decimal-js')
            priceArray.forEach(e => {
                e.innerHTML = this._decimalSeparator(e.textContent);
            })
        }

        this._decimalSeparator = function (number) {
            return number.replace(/^(\d*)([\d])(\d{2})$/, '$1$2.$3');
        }

        this._quantityProduct = async function (e) {
            console.log(this)
            let response = await this._setCart('/cart/change.js', {
                'id': e.dataset.id,
                'quantity': e.value
            })

            let final_line_price = ''
            response.items.forEach(item => {
                if (item.id == e.dataset.id) {
                    final_line_price = item.final_line_price
                }
                return
            })

            document.querySelector(this.selectors.popupCardBarQuality).innerHTML = response.item_count
            document.querySelector(this.selectors.popupCardBarSubtotal).innerHTML = response.total_price
            e.closest(this.selectors.productInfo).querySelector(this.selectors.productPrice).innerHTML = final_line_price

            this._priceSeparator()
        }

        this._init = function () {
            this._initElements()
            if (!this.selectors.popupCard) return false
            this._eventListeners()

        };

        this._init()
    }

    const ajaxCart = new AjaxCart()

})();
