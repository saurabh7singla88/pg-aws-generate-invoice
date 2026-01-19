import { log } from 'console';
import { generateInvoicePDF } from '../generators/pdfGenerator.mjs';
import { parseShopifyWebhook, transformShopifyOrderToInvoice } from '../transformers/shopifyOrderTransformer.mjs';
import fs from 'fs';

// const shopifyOrder = {
//     "id": 6297791234108,
//     "admin_graphql_api_id": "gid://shopify/Order/6297791234108",
//     "app_id": 580111,
//     "browser_ip": "49.43.105.190",
//     "buyer_accepts_marketing": true,
//     "cancel_reason": null,
//     "cancelled_at": null,
//     "cart_token": "hWN76jHWlkciBmy3WcHvmZne",
//     "checkout_id": 26878973509692,
//     "checkout_token": "9175b0846177ecf1f219cdfa7d516d6d",
//     "client_details": {
//         "accept_language": "en-IN",
//         "browser_height": null,
//         "browser_ip": "49.43.105.190",
//         "browser_width": null,
//         "session_hash": null,
//         "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
//     },
//     "closed_at": null,
//     "confirmation_number": "XV4N2EN0X",
//     "confirmed": true,
//     "contact_email": "priyanka7mittal@gmail.com",
//     "created_at": "2026-01-17T11:58:57+05:30",
//     "currency": "INR",
//     "current_shipping_price_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_subtotal_price": "6779.00",
//     "current_subtotal_price_set": {
//         "shop_money": {
//             "amount": "6779.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "6779.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_additional_fees_set": null,
//     "current_total_discounts": "981.00",
//     "current_total_discounts_set": {
//         "shop_money": {
//             "amount": "981.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "981.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_duties_set": null,
//     "current_total_price": "6779.00",
//     "current_total_price_set": {
//         "shop_money": {
//             "amount": "6779.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "6779.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_tax": "322.81",
//     "current_total_tax_set": {
//         "shop_money": {
//             "amount": "322.81",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "322.81",
//             "currency_code": "INR"
//         }
//     },
//     "customer_locale": "en-IN",
//     "device_id": null,
//     "discount_codes": [],
//     "duties_included": false,
//     "email": "priyanka7mittal@gmail.com",
//     "estimated_taxes": false,
//     "financial_status": "pending",
//     "fulfillment_status": null,
//     "landing_site": "/products/work-to-weekend-smart-trousers-2?pr_prod_strat=pinned&pr_rec_id=909ea8af3&pr_rec_pid=8642806218812&pr_ref_pid=8743540686908&pr_seq=uniform&fbclid=IwY2xjawPRbCBleHRuA2FlbQIxMABicmlkETFrMXhPMEpZVVI0VDBVWnBTc3J0YwZhcHBfaWQPMTE5MjExNzI4MTQ0NTA0AAEeC",
//     "landing_site_ref": null,
//     "location_id": null,
//     "merchant_business_entity_id": "MTY0Njg4NTU0MDQ0",
//     "merchant_of_record_app_id": null,
//     "name": "PG1263",
//     "note": null,
//     "note_attributes": [
//         {
//             "name": "wvs",
//             "value": "1"
//         },
//         {
//             "name": "wvi",
//             "value": "1"
//         },
//         {
//             "name": "_kaching_cart_attributes",
//             "value": "{\"totalAfterDiscounts\":727900}"
//         }
//     ],
//     "number": 263,
//     "order_number": 1263,
//     "order_status_url": "https://pistagreen.com/64688554044/orders/f9a491b80e6accde2371c8b9c64ada79/authenticate?key=d0cedbfc3063cecae0999367b4133be4",
//     "original_total_additional_fees_set": null,
//     "original_total_duties_set": null,
//     "payment_gateway_names": [
//         "Cash on Delivery (COD)"
//     ],
//     "phone": "+919501201259",
//     "po_number": null,
//     "presentment_currency": "INR",
//     "processed_at": "2026-01-17T11:58:56+05:30",
//     "reference": null,
//     "referring_site": "https://l.facebook.com/",
//     "source_identifier": null,
//     "source_name": "web",
//     "source_url": null,
//     "subtotal_price": "6779.00",
//     "subtotal_price_set": {
//         "shop_money": {
//             "amount": "6779.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "6779.00",
//             "currency_code": "INR"
//         }
//     },
//     "tags": "",
//     "tax_exempt": false,
//     "tax_lines": [
//         {
//             "price": "322.81",
//             "rate": 0.05,
//             "title": "IGST",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "322.81",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "322.81",
//                     "currency_code": "INR"
//                 }
//             },
//             "channel_liable": false
//         }
//     ],
//     "taxes_included": true,
//     "test": false,
//     "token": "f9a491b80e6accde2371c8b9c64ada79",
//     "total_cash_rounding_payment_adjustment_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_cash_rounding_refund_adjustment_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_discounts": "981.00",
//     "total_discounts_set": {
//         "shop_money": {
//             "amount": "981.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "981.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_line_items_price": "7760.00",
//     "total_line_items_price_set": {
//         "shop_money": {
//             "amount": "7760.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "7760.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_outstanding": "6779.00",
//     "total_price": "6779.00",
//     "total_price_set": {
//         "shop_money": {
//             "amount": "6779.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "6779.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_shipping_price_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_tax": "322.81",
//     "total_tax_set": {
//         "shop_money": {
//             "amount": "322.81",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "322.81",
//             "currency_code": "INR"
//         }
//     },
//     "total_tip_received": "0.00",
//     "total_weight": 1120,
//     "updated_at": "2026-01-17T11:58:57+05:30",
//     "user_id": null,
//     "billing_address": {
//         "first_name": "PRIYANKA",
//         "address1": "GH 60 SECTOR 20 303 A GH 60 SECTOR 20",
//         "phone": "+919501201259",
//         "city": "PANCHKULA",
//         "zip": "134109",
//         "province": "Haryana",
//         "country": "India",
//         "last_name": "MITTAL",
//         "address2": "sector 20",
//         "company": null,
//         "latitude": 30.6720747,
//         "longitude": 76.85718609999999,
//         "name": "PRIYANKA MITTAL",
//         "country_code": "IN",
//         "province_code": "HR"
//     },
//     "customer": {
//         "id": 7233636401212,
//         "created_at": "2024-12-24T16:35:12+05:30",
//         "updated_at": "2026-01-17T11:58:57+05:30",
//         "first_name": "PRIYANKA",
//         "last_name": "MITTAL",
//         "state": "disabled",
//         "note": null,
//         "verified_email": true,
//         "multipass_identifier": null,
//         "tax_exempt": false,
//         "email": "priyanka7mittal@gmail.com",
//         "phone": "+919501201259",
//         "currency": "INR",
//         "tax_exemptions": [],
//         "admin_graphql_api_id": "gid://shopify/Customer/7233636401212",
//         "default_address": {
//             "id": 9286078332988,
//             "customer_id": 7233636401212,
//             "first_name": "PRIYANKA",
//             "last_name": "MITTAL",
//             "company": null,
//             "address1": "GH 60 SECTOR 20 303 A GH 60 SECTOR 20",
//             "address2": "sector 20",
//             "city": "PANCHKULA",
//             "province": "Haryana",
//             "country": "India",
//             "zip": "134109",
//             "phone": "+919501201259",
//             "name": "PRIYANKA MITTAL",
//             "province_code": "HR",
//             "country_code": "IN",
//             "country_name": "India",
//             "default": true
//         }
//     },
//     "discount_applications": [
//         {
//             "target_type": "line_item",
//             "type": "automatic",
//             "value": "500.0",
//             "value_type": "fixed_amount",
//             "allocation_method": "across",
//             "target_selection": "all",
//             "title": "KCART - 500 INR"
//         },
//         {
//             "target_type": "line_item",
//             "type": "automatic",
//             "value": "400.0",
//             "value_type": "fixed_amount",
//             "allocation_method": "across",
//             "target_selection": "entitled",
//             "title": "400 INR"
//         },
//         {
//             "target_type": "line_item",
//             "type": "automatic",
//             "value": "81.0",
//             "value_type": "fixed_amount",
//             "allocation_method": "each",
//             "target_selection": "entitled",
//             "title": "OFFER (Buy 2)"
//         },
//         {
//             "target_type": "shipping_line",
//             "type": "automatic",
//             "value": "100.0",
//             "value_type": "percentage",
//             "allocation_method": "each",
//             "target_selection": "entitled",
//             "title": "FREE Shipping"
//         }
//     ],
//     "fulfillments": [],
//     "line_items": [
//         {
//             "id": 15715295264828,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15715295264828",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 100,
//             "name": "Soft Cotton Ribbed Sweetheart Top | Winter White - L",
//             "price": "890.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "890.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "890.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8642727051324,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": null,
//             "taxable": true,
//             "title": "Soft Cotton Ribbed Sweetheart Top | Winter White",
//             "total_discount": "81.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "81.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "81.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43448089215036,
//             "variant_inventory_management": "shopify",
//             "variant_title": "L",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "35.88",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "35.88",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "35.88",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.05,
//                     "title": "IGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": [
//                 {
//                     "amount": "55.58",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "55.58",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "55.58",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 0
//                 },
//                 {
//                     "amount": "81.00",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "81.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "81.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 2
//                 }
//             ]
//         },
//         {
//             "id": 15715295297596,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15715295297596",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 100,
//             "name": "Soft Cotton Ribbed Sweetheart Top | Winter White - S",
//             "price": "890.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "890.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "890.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8642727051324,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": null,
//             "taxable": true,
//             "title": "Soft Cotton Ribbed Sweetheart Top | Winter White",
//             "total_discount": "0.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43448089149500,
//             "variant_inventory_management": "shopify",
//             "variant_title": "S",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "39.47",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "39.47",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "39.47",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.05,
//                     "title": "IGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": [
//                 {
//                     "amount": "61.14",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "61.14",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "61.14",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 0
//                 },
//                 {
//                     "amount": "0.00",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "0.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "0.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 2
//                 }
//             ]
//         },
//         {
//             "id": 15715295330364,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15715295330364",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 460,
//             "name": "Premium Satin Oversized Pintuck Shirt | Raven Black - XS",
//             "price": "2990.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "2990.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "2990.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8743540686908,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": null,
//             "taxable": true,
//             "title": "Premium Satin Oversized Pintuck Shirt | Raven Black",
//             "total_discount": "0.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43730831376444,
//             "variant_inventory_management": "shopify",
//             "variant_title": "XS",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "123.73",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "123.73",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "123.73",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.05,
//                     "title": "IGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": [
//                 {
//                     "amount": "191.64",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "191.64",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "191.64",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 0
//                 },
//                 {
//                     "amount": "200.00",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "200.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "200.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 1
//                 }
//             ]
//         },
//         {
//             "id": 15715295363132,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15715295363132",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 460,
//             "name": "Japanese Crepe Tailored Pleated Trousers | Latte Cream - M",
//             "price": "2990.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "2990.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "2990.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8642806218812,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": null,
//             "taxable": true,
//             "title": "Japanese Crepe Tailored Pleated Trousers | Latte Cream",
//             "total_discount": "0.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43448250433596,
//             "variant_inventory_management": "shopify",
//             "variant_title": "M",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "123.73",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "123.73",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "123.73",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.05,
//                     "title": "IGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": [
//                 {
//                     "amount": "191.64",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "191.64",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "191.64",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 0
//                 },
//                 {
//                     "amount": "200.00",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "200.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "200.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 1
//                 }
//             ]
//         }
//     ],
//     "payment_terms": null,
//     "refunds": [],
//     "shipping_address": {
//         "first_name": "PRIYANKA",
//         "address1": "GH 60 SECTOR 20 303 A GH 60 SECTOR 20",
//         "phone": "+919501201259",
//         "city": "PANCHKULA",
//         "zip": "134109",
//         "province": "Haryana",
//         "country": "India",
//         "last_name": "MITTAL",
//         "address2": "sector 20",
//         "company": null,
//         "latitude": 30.6720747,
//         "longitude": 76.85718609999999,
//         "name": "PRIYANKA MITTAL",
//         "country_code": "IN",
//         "province_code": "HR"
//     },
//     "shipping_lines": [
//         {
//             "id": 5336232755260,
//             "carrier_identifier": null,
//             "code": "Standard",
//             "current_discounted_price_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "discounted_price": "0.00",
//             "discounted_price_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "is_removed": false,
//             "phone": null,
//             "price": "0.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "requested_fulfillment_service_id": null,
//             "source": "shopify",
//             "title": "Standard",
//             "tax_lines": [],
//             "discount_allocations": [
//                 {
//                     "amount": "0.00",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "0.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "0.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 3
//                 }
//             ]
//         }
//     ],
//     "returns": [],
//     "line_item_groups": []
// };

const shopifyOrder = {
    "id": 6302019354684,
    "admin_graphql_api_id": "gid://shopify/Order/6302019354684",
    "app_id": 580111,
    "browser_ip": "106.222.216.106",
    "buyer_accepts_marketing": false,
    "cancel_reason": null,
    "cancelled_at": null,
    "cart_token": "hWN7mrkuBRQvfn2OmD8zJbKW",
    "checkout_id": 26886173294652,
    "checkout_token": "a8787689b9e8a6ec2d4f0dfa95635a33",
    "client_details": {
        "accept_language": "en-IN",
        "browser_height": null,
        "browser_ip": "106.222.216.106",
        "browser_width": null,
        "session_hash": null,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22G100 Instagram 412.0.0.17.89 (iPhone13,2; iOS 18_6_2; en_GB; en-GB; scale=3.00; 1170x2532; IABMV/1; 859471633) Safari/604.1"
    },
    "closed_at": null,
    "confirmation_number": "UQHNN2YVX",
    "confirmed": true,
    "contact_email": "priyanka.ahirwal@gmail.com",
    "created_at": "2026-01-19T17:47:33+05:30",
    "currency": "INR",
    "current_shipping_price_set": {
        "shop_money": {
            "amount": "0.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "0.00",
            "currency_code": "INR"
        }
    },
    "current_subtotal_price": "5180.00",
    "current_subtotal_price_set": {
        "shop_money": {
            "amount": "5180.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "5180.00",
            "currency_code": "INR"
        }
    },
    "current_total_additional_fees_set": null,
    "current_total_discounts": "800.00",
    "current_total_discounts_set": {
        "shop_money": {
            "amount": "800.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "800.00",
            "currency_code": "INR"
        }
    },
    "current_total_duties_set": null,
    "current_total_price": "5180.00",
    "current_total_price_set": {
        "shop_money": {
            "amount": "5180.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "5180.00",
            "currency_code": "INR"
        }
    },
    "current_total_tax": "246.67",
    "current_total_tax_set": {
        "shop_money": {
            "amount": "246.67",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "246.67",
            "currency_code": "INR"
        }
    },
    "customer_locale": "en-IN",
    "device_id": null,
    "discount_codes": [],
    "duties_included": false,
    "email": "priyanka.ahirwal@gmail.com",
    "estimated_taxes": false,
    "financial_status": "paid",
    "fulfillment_status": null,
    "landing_site": "/products/work-to-weekend-smart-trousers-2",
    "landing_site_ref": null,
    "location_id": null,
    "merchant_business_entity_id": "MTY0Njg4NTU0MDQ0",
    "merchant_of_record_app_id": null,
    "name": "PG1268",
    "note": null,
    "note_attributes": [],
    "number": 268,
    "order_number": 1268,
    "order_status_url": "https://pistagreen.com/64688554044/orders/47fb8b0377b81e156b17e34861b98edf/authenticate?key=2e94e096145f9580ee57e2afc7da07a5",
    "original_total_additional_fees_set": null,
    "original_total_duties_set": null,
    "payment_gateway_names": [
        "1 Razorpay"
    ],
    "phone": null,
    "po_number": null,
    "presentment_currency": "INR",
    "processed_at": "2026-01-19T17:47:31+05:30",
    "reference": null,
    "referring_site": null,
    "source_identifier": null,
    "source_name": "web",
    "source_url": null,
    "subtotal_price": "5180.00",
    "subtotal_price_set": {
        "shop_money": {
            "amount": "5180.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "5180.00",
            "currency_code": "INR"
        }
    },
    "tags": "",
    "tax_exempt": false,
    "tax_lines": [
        {
            "price": "246.67",
            "rate": 0.05,
            "title": "IGST",
            "price_set": {
                "shop_money": {
                    "amount": "246.67",
                    "currency_code": "INR"
                },
                "presentment_money": {
                    "amount": "246.67",
                    "currency_code": "INR"
                }
            },
            "channel_liable": false
        }
    ],
    "taxes_included": true,
    "test": false,
    "token": "47fb8b0377b81e156b17e34861b98edf",
    "total_cash_rounding_payment_adjustment_set": {
        "shop_money": {
            "amount": "0.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "0.00",
            "currency_code": "INR"
        }
    },
    "total_cash_rounding_refund_adjustment_set": {
        "shop_money": {
            "amount": "0.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "0.00",
            "currency_code": "INR"
        }
    },
    "total_discounts": "800.00",
    "total_discounts_set": {
        "shop_money": {
            "amount": "800.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "800.00",
            "currency_code": "INR"
        }
    },
    "total_line_items_price": "5980.00",
    "total_line_items_price_set": {
        "shop_money": {
            "amount": "5980.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "5980.00",
            "currency_code": "INR"
        }
    },
    "total_outstanding": "0.00",
    "total_price": "5180.00",
    "total_price_set": {
        "shop_money": {
            "amount": "5180.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "5180.00",
            "currency_code": "INR"
        }
    },
    "total_shipping_price_set": {
        "shop_money": {
            "amount": "0.00",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "0.00",
            "currency_code": "INR"
        }
    },
    "total_tax": "246.67",
    "total_tax_set": {
        "shop_money": {
            "amount": "246.67",
            "currency_code": "INR"
        },
        "presentment_money": {
            "amount": "246.67",
            "currency_code": "INR"
        }
    },
    "total_tip_received": "0.00",
    "total_weight": 920,
    "updated_at": "2026-01-19T17:47:35+05:30",
    "user_id": null,
    "billing_address": {
        "first_name": "Priyanka",
        "address1": "D 10 Sterling Oasis Rajat Vihar Colony",
        "phone": "9131321847",
        "city": "Bhopal",
        "zip": "462026",
        "province": "Madhya Pradesh",
        "country": "India",
        "last_name": "Ahirwal",
        "address2": "Bagmugalia Road",
        "company": null,
        "latitude": 23.1864872,
        "longitude": 77.45899279999999,
        "name": "Priyanka Ahirwal",
        "country_code": "IN",
        "province_code": "MP"
    },
    "customer": {
        "id": 8186750730300,
        "created_at": "2026-01-19T17:46:01+05:30",
        "updated_at": "2026-01-19T17:47:34+05:30",
        "first_name": "Priyanka",
        "last_name": "Ahirwal",
        "state": "disabled",
        "note": null,
        "verified_email": true,
        "multipass_identifier": null,
        "tax_exempt": false,
        "email": "priyanka.ahirwal@gmail.com",
        "phone": null,
        "currency": "INR",
        "tax_exemptions": [],
        "admin_graphql_api_id": "gid://shopify/Customer/8186750730300",
        "default_address": {
            "id": 9289183658044,
            "customer_id": 8186750730300,
            "first_name": "Priyanka",
            "last_name": "Ahirwal",
            "company": null,
            "address1": "D 10 Sterling Oasis Rajat Vihar Colony",
            "address2": "Bagmugalia Road",
            "city": "Bhopal",
            "province": "Madhya Pradesh",
            "country": "India",
            "zip": "462026",
            "phone": "9131321847",
            "name": "Priyanka Ahirwal",
            "province_code": "MP",
            "country_code": "IN",
            "country_name": "India",
            "default": true
        }
    },
    "discount_applications": [
        {
            "target_type": "line_item",
            "type": "automatic",
            "value": "800.0",
            "value_type": "fixed_amount",
            "allocation_method": "across",
            "target_selection": "entitled",
            "title": "-₹800 (Buy 2 Trousers)"
        },
        {
            "target_type": "shipping_line",
            "type": "automatic",
            "value": "100.0",
            "value_type": "percentage",
            "allocation_method": "each",
            "target_selection": "entitled",
            "title": "FREE Shipping"
        }
    ],
    "fulfillments": [],
    "line_items": [
        {
            "id": 15722074472508,
            "admin_graphql_api_id": "gid://shopify/LineItem/15722074472508",
            "attributed_staffs": [],
            "current_quantity": 1,
            "fulfillable_quantity": 1,
            "fulfillment_service": "manual",
            "fulfillment_status": null,
            "gift_card": false,
            "grams": 460,
            "name": "Japanese Crepe Tailored Wide Trousers | Midnight Blue - M",
            "price": "2990.00",
            "price_set": {
                "shop_money": {
                    "amount": "2990.00",
                    "currency_code": "INR"
                },
                "presentment_money": {
                    "amount": "2990.00",
                    "currency_code": "INR"
                }
            },
            "product_exists": true,
            "product_id": 8642798420028,
            "properties": [],
            "quantity": 1,
            "requires_shipping": true,
            "sales_line_item_group_id": null,
            "sku": null,
            "taxable": true,
            "title": "Japanese Crepe Tailored Wide Trousers | Midnight Blue",
            "total_discount": "0.00",
            "total_discount_set": {
                "shop_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                },
                "presentment_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                }
            },
            "variant_id": 43448235327548,
            "variant_inventory_management": "shopify",
            "variant_title": "M",
            "vendor": "PistaGreen",
            "tax_lines": [
                {
                    "channel_liable": false,
                    "price": "123.34",
                    "price_set": {
                        "shop_money": {
                            "amount": "123.34",
                            "currency_code": "INR"
                        },
                        "presentment_money": {
                            "amount": "123.34",
                            "currency_code": "INR"
                        }
                    },
                    "rate": 0.05,
                    "title": "IGST"
                }
            ],
            "duties": [],
            "discount_allocations": [
                {
                    "amount": "400.00",
                    "amount_set": {
                        "shop_money": {
                            "amount": "400.00",
                            "currency_code": "INR"
                        },
                        "presentment_money": {
                            "amount": "400.00",
                            "currency_code": "INR"
                        }
                    },
                    "discount_application_index": 0
                }
            ]
        },
        {
            "id": 15722074505276,
            "admin_graphql_api_id": "gid://shopify/LineItem/15722074505276",
            "attributed_staffs": [],
            "current_quantity": 1,
            "fulfillable_quantity": 1,
            "fulfillment_service": "manual",
            "fulfillment_status": null,
            "gift_card": false,
            "grams": 460,
            "name": "Japanese Crepe Tailored Wide Trousers | Latte Cream - M",
            "price": "2990.00",
            "price_set": {
                "shop_money": {
                    "amount": "2990.00",
                    "currency_code": "INR"
                },
                "presentment_money": {
                    "amount": "2990.00",
                    "currency_code": "INR"
                }
            },
            "product_exists": true,
            "product_id": 8642798780476,
            "properties": [],
            "quantity": 1,
            "requires_shipping": true,
            "sales_line_item_group_id": null,
            "sku": null,
            "taxable": true,
            "title": "Japanese Crepe Tailored Wide Trousers | Latte Cream",
            "total_discount": "0.00",
            "total_discount_set": {
                "shop_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                },
                "presentment_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                }
            },
            "variant_id": 43448236474428,
            "variant_inventory_management": "shopify",
            "variant_title": "M",
            "vendor": "PistaGreen",
            "tax_lines": [
                {
                    "channel_liable": false,
                    "price": "123.33",
                    "price_set": {
                        "shop_money": {
                            "amount": "123.33",
                            "currency_code": "INR"
                        },
                        "presentment_money": {
                            "amount": "123.33",
                            "currency_code": "INR"
                        }
                    },
                    "rate": 0.05,
                    "title": "IGST"
                }
            ],
            "duties": [],
            "discount_allocations": [
                {
                    "amount": "400.00",
                    "amount_set": {
                        "shop_money": {
                            "amount": "400.00",
                            "currency_code": "INR"
                        },
                        "presentment_money": {
                            "amount": "400.00",
                            "currency_code": "INR"
                        }
                    },
                    "discount_application_index": 0
                }
            ]
        }
    ],
    "payment_terms": null,
    "refunds": [],
    "shipping_address": {
        "first_name": "Priyanka",
        "address1": "D 10 Sterling Oasis Rajat Vihar Colony",
        "phone": "9131321847",
        "city": "Bhopal",
        "zip": "462026",
        "province": "Madhya Pradesh",
        "country": "India",
        "last_name": "Ahirwal",
        "address2": "Bagmugalia Road",
        "company": null,
        "latitude": 23.1864872,
        "longitude": 77.45899279999999,
        "name": "Priyanka Ahirwal",
        "country_code": "IN",
        "province_code": "MP"
    },
    "shipping_lines": [
        {
            "id": 5339039301692,
            "carrier_identifier": null,
            "code": "Standard",
            "current_discounted_price_set": {
                "shop_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                },
                "presentment_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                }
            },
            "discounted_price": "0.00",
            "discounted_price_set": {
                "shop_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                },
                "presentment_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                }
            },
            "is_removed": false,
            "phone": null,
            "price": "0.00",
            "price_set": {
                "shop_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                },
                "presentment_money": {
                    "amount": "0.00",
                    "currency_code": "INR"
                }
            },
            "requested_fulfillment_service_id": null,
            "source": "shopify",
            "title": "Standard",
            "tax_lines": [],
            "discount_allocations": [
                {
                    "amount": "0.00",
                    "amount_set": {
                        "shop_money": {
                            "amount": "0.00",
                            "currency_code": "INR"
                        },
                        "presentment_money": {
                            "amount": "0.00",
                            "currency_code": "INR"
                        }
                    },
                    "discount_application_index": 1
                }
            ]
        }
    ],
    "returns": [],
    "line_item_groups": []
};

console.log(shopifyOrder);


// const shopifyOrder = {
//     "id": 6297742278716,
//     "admin_graphql_api_id": "gid://shopify/Order/6297742278716",
//     "app_id": 1354745,
//     "browser_ip": "49.43.105.190",
//     "buyer_accepts_marketing": false,
//     "cancel_reason": null,
//     "cancelled_at": null,
//     "cart_token": null,
//     "checkout_id": 26878872485948,
//     "checkout_token": "97ea5ad3a1a82d31d27ec11407a7c91f",
//     "client_details": {
//         "accept_language": null,
//         "browser_height": null,
//         "browser_ip": "49.43.105.190",
//         "browser_width": null,
//         "session_hash": null,
//         "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
//     },
//     "closed_at": null,
//     "confirmation_number": "H60HHPTCI",
//     "confirmed": true,
//     "contact_email": null,
//     "created_at": "2026-01-17T10:50:49+05:30",
//     "currency": "INR",
//     "current_shipping_price_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_subtotal_price": "4570.00",
//     "current_subtotal_price_set": {
//         "shop_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_additional_fees_set": null,
//     "current_total_discounts": "0.00",
//     "current_total_discounts_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_duties_set": null,
//     "current_total_price": "4570.00",
//     "current_total_price_set": {
//         "shop_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_tax": "111.46",
//     "current_total_tax_set": {
//         "shop_money": {
//             "amount": "111.46",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "111.46",
//             "currency_code": "INR"
//         }
//     },
//     "customer_locale": "en",
//     "device_id": null,
//     "discount_codes": [],
//     "duties_included": false,
//     "email": "",
//     "estimated_taxes": false,
//     "financial_status": "pending",
//     "fulfillment_status": null,
//     "landing_site": null,
//     "landing_site_ref": null,
//     "location_id": 72274444348,
//     "merchant_business_entity_id": "MTY0Njg4NTU0MDQ0",
//     "merchant_of_record_app_id": null,
//     "name": "PG1262",
//     "note": null,
//     "note_attributes": [],
//     "number": 262,
//     "order_number": 1262,
//     "order_status_url": "https://pistagreen.com/64688554044/orders/926018cff0c2ee83f03321327a965768/authenticate?key=657c392c758adddb7edb2ac4fab04c92",
//     "original_total_additional_fees_set": null,
//     "original_total_duties_set": null,
//     "payment_gateway_names": [],
//     "phone": null,
//     "po_number": null,
//     "presentment_currency": "INR",
//     "processed_at": "2026-01-17T10:50:48+05:30",
//     "reference": null,
//     "referring_site": null,
//     "source_identifier": null,
//     "source_name": "shopify_draft_order",
//     "source_url": null,
//     "subtotal_price": "4570.00",
//     "subtotal_price_set": {
//         "shop_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         }
//     },
//     "tags": "",
//     "tax_exempt": false,
//     "tax_lines": [
//         {
//             "price": "111.46",
//             "rate": 0.025,
//             "title": "CGST",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "111.46",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "111.46",
//                     "currency_code": "INR"
//                 }
//             },
//             "channel_liable": false
//         }
//     ],
//     "taxes_included": true,
//     "test": false,
//     "token": "926018cff0c2ee83f03321327a965768",
//     "total_cash_rounding_payment_adjustment_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_cash_rounding_refund_adjustment_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_discounts": "0.00",
//     "total_discounts_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_line_items_price": "4570.00",
//     "total_line_items_price_set": {
//         "shop_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_outstanding": "4570.00",
//     "total_price": "4570.00",
//     "total_price_set": {
//         "shop_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "4570.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_shipping_price_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_tax": "111.46",
//     "total_tax_set": {
//         "shop_money": {
//             "amount": "111.46",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "111.46",
//             "currency_code": "INR"
//         }
//     },
//     "total_tip_received": "0.00",
//     "total_weight": 660,
//     "updated_at": "2026-01-17T10:51:50+05:30",
//     "user_id": 84508573756,
//     "billing_address": null,
//     "customer": null,
//     "discount_applications": [],
//     "fulfillments": [],
//     "line_items": [
//         {
//             "id": 15715195945020,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15715195945020",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 100,
//             "name": "Cotton Ribbed Classic Cropped Top | Latte Cream - XS",
//             "price": "790.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "790.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "790.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8642791374908,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": null,
//             "taxable": true,
//             "title": "Cotton Ribbed Classic Cropped Top | Latte Cream",
//             "total_discount": "0.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43448219369532,
//             "variant_inventory_management": "shopify",
//             "variant_title": "XS",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "19.26",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "19.26",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "19.26",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.025,
//                     "title": "CGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": []
//         },
//         {
//             "id": 15715195977788,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15715195977788",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 100,
//             "name": "Cotton Ribbed Classic Cropped Top | Latte Cream - S",
//             "price": "790.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "790.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "790.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8642791374908,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": null,
//             "taxable": true,
//             "title": "Cotton Ribbed Classic Cropped Top | Latte Cream",
//             "total_discount": "0.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43448219402300,
//             "variant_inventory_management": "shopify",
//             "variant_title": "S",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "19.27",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "19.27",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "19.27",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.025,
//                     "title": "CGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": []
//         },
//         {
//             "id": 15715196010556,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15715196010556",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 460,
//             "name": "Japanese Crepe Tailored Pleated Trousers | Midnight Blue - M",
//             "price": "2990.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "2990.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "2990.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8642805760060,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": null,
//             "taxable": true,
//             "title": "Japanese Crepe Tailored Pleated Trousers | Midnight Blue",
//             "total_discount": "0.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43448248205372,
//             "variant_inventory_management": "shopify",
//             "variant_title": "M",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "72.93",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "72.93",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "72.93",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.025,
//                     "title": "CGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": []
//         }
//     ],
//     "payment_terms": {
//         "id": 20351352892,
//         "created_at": "2026-01-17T10:50:49+05:30",
//         "due_in_days": null,
//         "payment_schedules": [],
//         "payment_terms_name": "Due on receipt",
//         "payment_terms_type": "receipt",
//         "updated_at": "2026-01-17T10:50:49+05:30"
//     },
//     "refunds": [],
//     "shipping_address": null,
//     "shipping_lines": [],
//     "returns": [],
//     "line_item_groups": []
// };

// Sample Shopify order
//    const shopifyOrder2 = {
//     "id": 6268524396604,
//     "admin_graphql_api_id": "gid://shopify/Order/6268524396604",
//     "app_id": 580111,
//     "browser_ip": "112.79.67.24",
//     "buyer_accepts_marketing": false,
//     "cancel_reason": null,
//     "cancelled_at": null,
//     "cart_token": "hWN6cNZXZemrDJSUALGolqcM",
//     "checkout_id": 26813178937404,
//     "checkout_token": "d557465093879d4e81327567115561d8",
//     "client_details": {
//         "accept_language": "en-IN",
//         "browser_height": null,
//         "browser_ip": "112.79.67.24",
//         "browser_width": null,
//         "session_hash": null,
//         "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23C55 Instagram 410.0.0.29.70 (iPhone14,5; iOS 26_2; en_GB; en-GB; scale=3.00; 1170x2532; IABMV/1; 843189213) Safari/604.1"
//     },
//     "closed_at": null,
//     "confirmation_number": "VCHX1Z0QC",
//     "confirmed": true,
//     "contact_email": "ritikamishra570@gmail.com",
//     "created_at": "2025-12-29T09:54:05+05:30",
//     "currency": "INR",
//     "current_shipping_price_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_subtotal_price": "2190.00",
//     "current_subtotal_price_set": {
//         "shop_money": {
//             "amount": "2190.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "2190.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_additional_fees_set": null,
//     "current_total_discounts": "400.00",
//     "current_total_discounts_set": {
//         "shop_money": {
//             "amount": "400.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "400.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_duties_set": null,
//     "current_total_price": "2190.00",
//     "current_total_price_set": {
//         "shop_money": {
//             "amount": "2190.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "2190.00",
//             "currency_code": "INR"
//         }
//     },
//     "current_total_tax": "104.29",
//     "current_total_tax_set": {
//         "shop_money": {
//             "amount": "104.29",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "104.29",
//             "currency_code": "INR"
//         }
//     },
//     "customer_locale": "en-IN",
//     "device_id": null,
//     "discount_codes": [
//         {
//             "code": "WELCOME400",
//             "amount": "400.00",
//             "type": "fixed_amount"
//         }
//     ],
//     "duties_included": false,
//     "email": "ritikamishra570@gmail.com",
//     "estimated_taxes": false,
//     "financial_status": "paid",
//     "fulfillment_status": null,
//     "landing_site": "/products/work-to-weekend-smart-trousers-2?utm_medium=paid&utm_id=120238505458210315&utm_content=120239269625290315&utm_term=120238505458220315&utm_campaign=120238505458210315&fbclid=PAZXh0bgNhZW0BMABhZGlkAass-qEa4-tzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAa",
//     "landing_site_ref": null,
//     "location_id": null,
//     "merchant_business_entity_id": "MTY0Njg4NTU0MDQ0",
//     "merchant_of_record_app_id": null,
//     "name": "PG1229",
//     "note": null,
//     "note_attributes": [],
//     "number": 229,
//     "order_number": 1229,
//     "order_status_url": "https://pistagreen.com/64688554044/orders/7f68df802166bb539174790b4b701c8c/authenticate?key=95ce5716f1b80025467dff0d061c6ebf",
//     "original_total_additional_fees_set": null,
//     "original_total_duties_set": null,
//     "payment_gateway_names": [
//         "1 Razorpay"
//     ],
//     "phone": null,
//     "po_number": null,
//     "presentment_currency": "INR",
//     "processed_at": "2025-12-29T09:54:04+05:30",
//     "reference": null,
//     "referring_site": null,
//     "source_identifier": null,
//     "source_name": "web",
//     "source_url": null,
//     "subtotal_price": "2190.00",
//     "subtotal_price_set": {
//         "shop_money": {
//             "amount": "2190.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "2190.00",
//             "currency_code": "INR"
//         }
//     },
//     "tags": "",
//     "tax_exempt": false,
//     "tax_lines": [
//         {
//             "price": "104.29",
//             "rate": 0.05,
//             "title": "IGST",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "104.29",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "104.29",
//                     "currency_code": "INR"
//                 }
//             },
//             "channel_liable": false
//         }
//     ],
//     "taxes_included": true,
//     "test": false,
//     "token": "7f68df802166bb539174790b4b701c8c",
//     "total_cash_rounding_payment_adjustment_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_cash_rounding_refund_adjustment_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_discounts": "400.00",
//     "total_discounts_set": {
//         "shop_money": {
//             "amount": "400.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "400.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_line_items_price": "2590.00",
//     "total_line_items_price_set": {
//         "shop_money": {
//             "amount": "2590.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "2590.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_outstanding": "0.00",
//     "total_price": "2190.00",
//     "total_price_set": {
//         "shop_money": {
//             "amount": "2190.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "2190.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_shipping_price_set": {
//         "shop_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "0.00",
//             "currency_code": "INR"
//         }
//     },
//     "total_tax": "104.29",
//     "total_tax_set": {
//         "shop_money": {
//             "amount": "104.29",
//             "currency_code": "INR"
//         },
//         "presentment_money": {
//             "amount": "104.29",
//             "currency_code": "INR"
//         }
//     },
//     "total_tip_received": "0.00",
//     "total_weight": 460,
//     "updated_at": "2025-12-29T09:54:07+05:30",
//     "user_id": null,
//     "billing_address": {
//         "first_name": "Ritika",
//         "address1": "Sant Dnyaneshwar Road Nensey Colony Borivali East",
//         "phone": "9769003006",
//         "city": "Mumbai",
//         "zip": "400066",
//         "province": "Maharashtra",
//         "country": "India",
//         "last_name": "Mishra",
//         "address2": "C-102 - Adinath Tower",
//         "company": null,
//         "latitude": 19.2361493,
//         "longitude": 72.8640329,
//         "name": "Ritika Mishra",
//         "country_code": "IN",
//         "province_code": "MH"
//     },
//     "customer": {
//         "id": 8146247614524,
//         "created_at": "2025-12-29T09:53:13+05:30",
//         "updated_at": "2025-12-29T09:54:06+05:30",
//         "first_name": "Ritika",
//         "last_name": "Mishra",
//         "state": "disabled",
//         "note": null,
//         "verified_email": true,
//         "multipass_identifier": null,
//         "tax_exempt": false,
//         "email": "ritikamishra570@gmail.com",
//         "phone": null,
//         "currency": "INR",
//         "tax_exemptions": [],
//         "admin_graphql_api_id": "gid://shopify/Customer/8146247614524",
//         "default_address": {
//             "id": 9256218165308,
//             "customer_id": 8146247614524,
//             "first_name": "Ritika",
//             "last_name": "Mishra",
//             "company": null,
//             "address1": "Sant Dnyaneshwar Road Nensey Colony Borivali East",
//             "address2": "C-102 - Adinath Tower",
//             "city": "Mumbai",
//             "province": "Maharashtra",
//             "country": "India",
//             "zip": "400066",
//             "phone": "9769003006",
//             "name": "Ritika Mishra",
//             "province_code": "MH",
//             "country_code": "IN",
//             "country_name": "India",
//             "default": true
//         }
//     },
//     "discount_applications": [
//         {
//             "target_type": "shipping_line",
//             "type": "automatic",
//             "value": "100.0",
//             "value_type": "percentage",
//             "allocation_method": "each",
//             "target_selection": "entitled",
//             "title": "FREE Shipping"
//         },
//         {
//             "target_type": "line_item",
//             "type": "discount_code",
//             "value": "400.0",
//             "value_type": "fixed_amount",
//             "allocation_method": "across",
//             "target_selection": "all",
//             "code": "WELCOME400"
//         }
//     ],
//     "fulfillments": [],
//     "line_items": [
//         {
//             "id": 15652522950716,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15652522950716",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 460,
//             "name": "Japanese Crepe Tailored Pleated Trousers | Latte Cream - XS",
//             "price": "2590.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "2590.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "2590.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8642806218812,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": null,
//             "taxable": true,
//             "title": "Japanese Crepe Tailored Pleated Trousers | Latte Cream",
//             "total_discount": "0.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43448250368060,
//             "variant_inventory_management": "shopify",
//             "variant_title": "XS",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "104.29",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "104.29",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "104.29",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.05,
//                     "title": "IGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": [
//                 {
//                     "amount": "200.00",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "200.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "200.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 1
//                 }
//             ]
//         },
//         {
//             "id": 15652522950717,
//             "admin_graphql_api_id": "gid://shopify/LineItem/15652522950717",
//             "attributed_staffs": [],
//             "current_quantity": 1,
//             "fulfillable_quantity": 1,
//             "fulfillment_service": "manual",
//             "fulfillment_status": null,
//             "gift_card": false,
//             "grams": 400,
//             "name": "Cotton Blend Smart Casual Shirt | Navy Blue - M",
//             "price": "3890.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "3890.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "3890.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "product_exists": true,
//             "product_id": 8642806218813,
//             "properties": [],
//             "quantity": 1,
//             "requires_shipping": true,
//             "sales_line_item_group_id": null,
//             "sku": "SHIRT-NB-M",
//             "taxable": true,
//             "title": "Cotton Blend Smart Casual Shirt | Navy Blue",
//             "total_discount": "0.00",
//             "total_discount_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "variant_id": 43448250368061,
//             "variant_inventory_management": "shopify",
//             "variant_title": "M",
//             "vendor": "PistaGreen",
//             "tax_lines": [
//                 {
//                     "channel_liable": false,
//                     "price": "90.00",
//                     "price_set": {
//                         "shop_money": {
//                             "amount": "90.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "90.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "rate": 0.05,
//                     "title": "IGST"
//                 }
//             ],
//             "duties": [],
//             "discount_allocations": [
//                 {
//                     "amount": "200.00",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "200.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "200.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 1
//                 }
//             ]
//         }
//     ],
//     "payment_terms": null,
//     "refunds": [],
//     "shipping_address": {
//         "first_name": "Ritika",
//         "address1": "Sant Dnyaneshwar Road Nensey Colony Borivali East",
//         "phone": "9769003006",
//         "city": "Mumbai",
//         "zip": "400066",
//         "province": "Maharashtra",
//         "country": "India",
//         "last_name": "Mishra",
//         "address2": "C-102 - Adinath Tower",
//         "company": null,
//         "latitude": 19.2361493,
//         "longitude": 72.8640329,
//         "name": "Ritika Mishra",
//         "country_code": "IN",
//         "province_code": "MH"
//     },
//     "shipping_lines": [
//         {
//             "id": 5310755799100,
//             "carrier_identifier": null,
//             "code": "Standard",
//             "current_discounted_price_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "discounted_price": "0.00",
//             "discounted_price_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "is_removed": false,
//             "phone": null,
//             "price": "0.00",
//             "price_set": {
//                 "shop_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 },
//                 "presentment_money": {
//                     "amount": "0.00",
//                     "currency_code": "INR"
//                 }
//             },
//             "requested_fulfillment_service_id": null,
//             "source": "shopify",
//             "title": "Standard",
//             "tax_lines": [],
//             "discount_allocations": [
//                 {
//                     "amount": "0.00",
//                     "amount_set": {
//                         "shop_money": {
//                             "amount": "0.00",
//                             "currency_code": "INR"
//                         },
//                         "presentment_money": {
//                             "amount": "0.00",
//                             "currency_code": "INR"
//                         }
//                     },
//                     "discount_application_index": 0
//                 }
//             ]
//         }
//     ],
//     "returns": [],
//     "line_item_groups": []
// };

console.log('🔧 Testing PDF generation locally...\n');

try {
    // Transform order data
    console.log('📋 Transforming Shopify order data...');
    const invoiceData = transformShopifyOrderToInvoice(shopifyOrder);
    
    // Generate PDF
    console.log('📄 Generating PDF invoice...');
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    
    // Save to file
    const fileName = `test-invoice-${invoiceData.order.name.replace('#', '')}.pdf`;
    await fs.promises.writeFile(fileName, pdfBuffer);
    
    console.log(`\n✅ Success!`);
    console.log(`📁 PDF saved: ${fileName}`);
    console.log(`📊 Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`\n👀 Open the file to view the updated layout!`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
}
