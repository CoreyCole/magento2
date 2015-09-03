<?php
/**
 *
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Magento\Checkout\Controller\Onepage;

class Success extends \Magento\Checkout\Controller\Onepage
{
    /**
     * Order success action
     *
     * @return \Magento\Framework\Controller\ResultInterface
     */
    public function execute()
    {
        $session = $this->getOnepage()->getCheckout();
        if (!$this->_objectManager->get('Magento\Checkout\Model\Session\SuccessValidator')->isValid()) {
            return $this->resultRedirectFactory->create()->setPath('checkout/cart');
        }
        $session->clearQuote();
        //@todo: Refactor it to match CQRS
        $resultPage = $this->resultPageFactory->create();
        $this->_eventManager->dispatch(
            'checkout_onepage_controller_success_action',
            ['order_ids' => [$session->getLastOrderId()]]
        );
        $orderID = $session->getLastOrderId();
        $items = $session->getQuote()->getShippingAddress();
        $orderIdString = "0000000".$orderID;
        $orderData = $this->orderFactory->create()->load($orderID);
        $orderItems = $orderData->getAllItems();
?>
<div id="order-data" style="display: none;">
    <div id="order-id-string"><?= $orderIdString = "0000000".$orderID; ?></div>
    <div id="order-total"><?= $orderData->getTotalDue() ?></div>
    <div id="order-tax-total"><?= $orderData->getBaseTaxAmount() ?></div>
    <div id="order-shipping-total"><?= $orderData->getShippingAmount() ?></div>
    <div id="order-shipping-tax"><?= $orderData->getShippingInclTax() ?></div>
    <div id="order-lines">
<?php
    $line = 0;
    foreach ($orderItems as $item) {
        $orderLineId = "order-line-".$line;
?>
        <div id="<?= $orderLineId ?>" class="order-line">
            <div class="sku"><?= $item->getSku() ?></div>
            <div class="qty"><?= $item->getQtyOrdered() ?></div>
            <div class="price"><?= $item->getPrice() ?></div>
        </div>
<?php
        $line++;
    }
?>
    </div>
    <div id="customer-data">
        <div id="order-address-first-name"><?= $orderData->getShippingAddress()->getFirstname() ?></div>
        <div id="order-address-last-name"><?= $orderData->getShippingAddress()->getLastname() ?></div>
        <div id="order-address-company"><?= $orderData->getShippingAddress()->getCompany() ?></div>
        <div id="order-address-street"><?= $orderData->getShippingAddress()->getStreetLine(1) ?></div>
        <div id="order-address-city"><?= $orderData->getShippingAddress()->getCity() ?></div>
        <div id="order-address-region"><?= $orderData->getShippingAddress()->getRegion() ?></div>
        <div id="order-address-zip"><?= $orderData->getShippingAddress()->getPostcode() ?></div>
        <div id="order-address-country"><?= $orderData->getShippingAddress()->getCountry() ?></div>
        <div id="order-address-phone"><?= $orderData->getShippingAddress()->getTelephone() ?></div>
        <div id="order-address-email"><?= $orderData->getShippingAddress()->getEmail() ?></div>
    </div>
</div>
<?php 
        return $resultPage;
    }
}
