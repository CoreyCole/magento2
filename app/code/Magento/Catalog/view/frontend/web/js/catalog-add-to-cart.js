/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'mage/translate',
    'jquery/ui'
], function($, $t) {
    "use strict";

    $.widget('mage.catalogAddToCart', {

        options: {
            processStart: null,
            processStop: null,
            bindSubmit: true,
            minicartSelector: '[data-block="minicart"]',
            messagesSelector: '[data-placeholder="messages"]',
            productStatusSelector: '.stock.available',
            addToCartButtonSelector: '.action.tocart',
            addToCartButtonDisabledClass: 'disabled',
            addToCartButtonTextWhileAdding: $t('Adding...'),
            addToCartButtonTextAdded: $t('Added'),
            addToCartButtonTextDefault: $t('Add to Cart')

        },

        _create: function() {
            if (this.options.bindSubmit) {
                this._bindSubmit();
            }
        },

        _bindSubmit: function() {
            var self = this;
            this.element.on('submit', function(e) {
                e.preventDefault();
                self.submitForm($(this));
            });
        },

        isLoaderEnabled: function() {
            return this.options.processStart && this.options.processStop;
        },

        submitForm: function(form) {
            var self = this;
            if (form.has('input[type="file"]').length  && form.find('input[type="file"]').val() !== '') {
                self.element.off('submit');
                form.submit();
            } else {
                self.ajaxSubmit(form);
            }
        },

        ajaxSubmit: function(form) {
            var self = this;
            $(self.options.minicartSelector).trigger('contentLoading');
            self.disableAddToCartButton(form);

            var sku = $(".product div.value").text();
            var xml = '<?xml version="1.0" encoding="UTF-8"?><QuantityRequestMessage xmlns="http://api.gsicommerce.com/schema/checkout/1.0"><QuantityRequest lineId="line1" itemId="' + sku + '"/></QuantityRequestMessage>';

            $.ajax({
                url: "http://ashdevni5rtc.us.gspt.net:8008/ROMi-devcgi/InvInq/stores/TBL/",
                data: xml,
                type: 'post',
                dataType: 'text',
                beforeSend: function() {
                    if (self.isLoaderEnabled()) {
                        $('body').trigger(self.options.processStart);
                    }
                },
                success: function(res1){
                    var quantity = $(res1).find("quantity").text();
                    alert("Item " + sku + " is in stock on JDA!\nQuantity: " + quantity);
                    $.ajax({
                        url: form.attr('action'),
                        data: form.serialize(),
                        type: 'post',
                        dataType: 'json',
                        success: function(res2) {
                            if (self.isLoaderEnabled()) {
                                $('body').trigger(self.options.processStop);
                            }

                            if (res2.backUrl) {
                                window.location = res2.backUrl;
                                return;
                            }
                            if (res2.messages) {
                                $(self.options.messagesSelector).html(res2.messages);
                            }
                            if (res2.minicart) {
                                $(self.options.minicartSelector).replaceWith(res2.minicart);
                                $(self.options.minicartSelector).trigger('contentUpdated');
                            }
                            if (res2.product && res2.product.statusText) {
                                $(self.options.productStatusSelector)
                                    .removeClass('available')
                                    .addClass('unavailable')
                                    .find('span')
                                    .html(res2.product.statusText);
                            }
                            self.enableAddToCartButton(form);
                        }
                    });
                }
            });  
        },

        disableAddToCartButton: function(form) {
            var addToCartButton = $(form).find(this.options.addToCartButtonSelector);
            addToCartButton.addClass(this.options.addToCartButtonDisabledClass);
            addToCartButton.attr('title', this.options.addToCartButtonTextWhileAdding);
            addToCartButton.find('span').text(this.options.addToCartButtonTextWhileAdding);
        },

        enableAddToCartButton: function(form) {
            var self = this,
                addToCartButton = $(form).find(this.options.addToCartButtonSelector);

            addToCartButton.find('span').text(this.options.addToCartButtonTextAdded);
            addToCartButton.attr('title', this.options.addToCartButtonTextAdded);

            setTimeout(function() {
                addToCartButton.removeClass(self.options.addToCartButtonDisabledClass);
                addToCartButton.find('span').text(self.options.addToCartButtonTextDefault);
                addToCartButton.attr('title', self.options.addToCartButtonTextDefault);
            }, 1000);
        }
    });

    return $.mage.catalogAddToCart;
});