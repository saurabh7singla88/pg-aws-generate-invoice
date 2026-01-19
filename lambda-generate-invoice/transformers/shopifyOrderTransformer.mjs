/**
 * Transforms a Shopify order webhook payload into invoice data format
 * @param {Object} shopifyOrder - The Shopify order object
 * @returns {Object} Formatted invoice data
 */
export function transformShopifyOrderToInvoice(shopifyOrder) {
    // Convert INR to Rs. prefix for better PDF compatibility
    const currencySymbol = shopifyOrder.currency === 'INR' ? 'Rs.' : shopifyOrder.currency;
    
    // Get total discount from order level
    const totalOrderDiscount = parseFloat(shopifyOrder.current_total_discounts || 0);
    
    const discountApplications = shopifyOrder.discount_applications || [];
    const discountAppByIndex = new Map(discountApplications.map((app, index) => [index, app]));
    const isCartDiscountApp = (app) => {
        if (!app) {
            return false;
        }
        if (app.target_type === 'order') {
            return true;
        }
        return app.target_type === 'line_item'
            && app.allocation_method === 'across'
            && app.target_selection === 'all';
    };

    // Cart-level discount derived from discount allocations on cart-type applications
    const cartLevelDiscount = shopifyOrder.line_items?.reduce((sum, item) => {
        const itemCartDiscount = item.discount_allocations?.reduce((allocSum, allocation) => {
            const app = discountAppByIndex.get(allocation.discount_application_index);
            if (!isCartDiscountApp(app)) {
                return allocSum;
            }
            return allocSum + parseFloat(allocation.amount || 0);
        }, 0) || 0;
        return sum + itemCartDiscount;
    }, 0) || 0;
    
    // Total price across all items (used for proportional cart discount allocation)
    const totalItemsPriceWithTax = shopifyOrder.line_items?.reduce((sum, item) => {
        const itemPriceWithTax = parseFloat(item.price || 0);
        return sum + (itemPriceWithTax * (item.quantity || 0));
    }, 0) || 0;
    
    const hasCartDiscount = cartLevelDiscount > 0;
    let discountAppliedInLineItems = false; // Track if any discount was applied in line items
    
    // Calculate line items with tax - expand items with quantity > 1 into separate rows
    const lineItems = shopifyOrder.line_items?.flatMap(item => {
        const sellingPriceWithTax = parseFloat(item.price || 0); // Selling price includes tax
        const itemQuantity = item.quantity || 0;
        const mrp = item.compare_at_price ? parseFloat(item.compare_at_price) : sellingPriceWithTax;
        
        // Item-level discount per unit (exclude order-level discounts)
        const itemLevelDiscountTotal = item.discount_allocations?.reduce((sum, allocation) => {
            const app = discountAppByIndex.get(allocation.discount_application_index);
            if (isCartDiscountApp(app)) {
                return sum;
            }
            return sum + parseFloat(allocation.amount || 0);
        }, 0) || 0;

        const itemLevelDiscountPerUnit = itemQuantity > 0
            ? (itemLevelDiscountTotal / itemQuantity)
            : 0;
        
        // Cart-level discount per unit (proportional to item price)
        const cartLevelDiscountPerUnit = totalItemsPriceWithTax > 0
            ? (cartLevelDiscount * (sellingPriceWithTax / totalItemsPriceWithTax))
            : 0;
        
        const totalDiscountPerUnit = itemLevelDiscountPerUnit + cartLevelDiscountPerUnit;
        
        // Create separate rows for each quantity - calculate tax individually per row
        return Array.from({ length: itemQuantity }, () => {
            const hasDiscount = totalDiscountPerUnit > 0;
            if (hasDiscount) {
                discountAppliedInLineItems = true;
            }
            
            // Calculate base price assuming 5% tax initially
            let taxRate = 0.05;
            let taxDivisor = 1.05;
            let sellingPriceBase = sellingPriceWithTax / taxDivisor;
            
            // Calculate price after discount for this specific row (before tax)
            let sellingPriceAfterDiscount = hasDiscount
                ? Math.max(sellingPriceBase - totalDiscountPerUnit, 0)
                : sellingPriceBase;
            
            // Determine actual tax rate based on price after discount: 5% if < 2500, else 18%
            if (sellingPriceAfterDiscount >= 2500) {
                taxRate = 0.18;
                taxDivisor = 1.18;
                sellingPriceBase = sellingPriceWithTax / taxDivisor;
                sellingPriceAfterDiscount = hasDiscount
                    ? Math.max(sellingPriceBase - totalDiscountPerUnit, 0)
                    : sellingPriceBase;
            }
            
            const perUnitTax = sellingPriceAfterDiscount * taxRate;
            const finalSellingPriceAfterDiscount = sellingPriceAfterDiscount;
            const finalSellingPriceAfterTax = finalSellingPriceAfterDiscount + perUnitTax;
            
            return {
                name: item.title || item.name,
                description: item.variant_title ? `Variant: ${item.variant_title}` : null,
                sku: item.sku || null,
                quantity: 1, // Always 1 per row
                mrp: `${currencySymbol} ${mrp.toFixed(2)}`,
                discount: itemLevelDiscountPerUnit > 0 ? `${currencySymbol} ${itemLevelDiscountPerUnit.toFixed(2)}` : `${currencySymbol} 0.00`,
                cartDiscount: hasCartDiscount ? `${currencySymbol} ${cartLevelDiscountPerUnit.toFixed(2)}` : null,
                sellingPrice: `${currencySymbol} ${finalSellingPriceAfterDiscount.toFixed(2)}`,
                tax: `${currencySymbol} ${perUnitTax.toFixed(2)}`,
                sellingPriceAfterTax: `${currencySymbol} ${finalSellingPriceAfterTax.toFixed(2)}`,
                _totalItemTax: perUnitTax // Tax per individual unit
            };
        });
    }) || [];
    
    // Calculate total tax by summing all item taxes
    const calculatedTotalTax = lineItems.reduce((sum, item) => sum + (item._totalItemTax || 0), 0);
    
    // Calculate subtotal before tax by summing all line item selling prices (after discount)
    const calculatedSubtotalBeforeTax = lineItems.reduce((sum, item) => {
        const itemPrice = parseFloat(item.sellingPrice.replace('Rs. ', '').replace(/,/g, ''));
        return sum + itemPrice;
    }, 0);
    
    return {
        order: {
            name: shopifyOrder.name,
            date: new Date(shopifyOrder.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
            dueDate: null,
            notes: shopifyOrder.note || "Thank you for your purchase!"
        },
        customer: {
            name: `${shopifyOrder.customer?.first_name || ''} ${shopifyOrder.customer?.last_name || ''}`.trim() || shopifyOrder.billing_address?.name || '',
            company: shopifyOrder.customer?.company || shopifyOrder.billing_address?.company || null,
            email: shopifyOrder.email || shopifyOrder.customer?.email || '',
            phone: shopifyOrder.phone || shopifyOrder.customer?.phone || shopifyOrder.billing_address?.phone || null
        },
        shippingAddress: {
            name: shopifyOrder.shipping_address?.name || shopifyOrder.billing_address?.name || '',
            address: `${shopifyOrder.shipping_address?.address1 || ''} ${shopifyOrder.shipping_address?.address2 || ''}`.trim(),
            city: shopifyOrder.shipping_address?.city || '',
            state: shopifyOrder.shipping_address?.province || '',
            zip: shopifyOrder.shipping_address?.zip || ''
        },
        lineItems: lineItems,
        hasCartDiscount: hasCartDiscount,
        totals: {
            // Subtotal is sum of all line items before tax (already includes discount adjustment if applied)
            subtotal: `${currencySymbol} ${calculatedSubtotalBeforeTax.toFixed(2)}`,
            // Show discount in totals only if it wasn't applied in line items
            discount: (!discountAppliedInLineItems && totalOrderDiscount > 0)
                ? `-${currencySymbol} ${totalOrderDiscount.toFixed(2)}`
                : null,
            shipping: `${currencySymbol} ${parseFloat(shopifyOrder.total_shipping_price_set?.shop_money?.amount || 0).toFixed(2)}`,
            tax: `${currencySymbol} ${calculatedTotalTax.toFixed(2)}`,
            total: `${currencySymbol} ${parseFloat(shopifyOrder.current_total_price || shopifyOrder.total_price).toFixed(2)}`
        }
    };
}

/**
 * Parses the Shopify webhook event body
 * @param {Object} event - Lambda event object
 * @returns {Object} Parsed Shopify order
 */
export function parseShopifyWebhook(event) {
    return typeof event.body === 'string' 
        ? JSON.parse(event.body) 
        : event.body || event;
}
