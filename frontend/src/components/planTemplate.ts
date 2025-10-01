// Export product links for use in AddToCartButton
// Example sets of product links for different AddToCartButton instances
// export const woolworthsLinks = [
//   'https://www.woolworths.com.au/shop/productdetails/888137/woolworths-full-cream-milk',
//   'https://www.woolworths.com.au/shop/productdetails/581176/woolworths-wholemeal-soft-sandwich-bread',
//   'https://www.woolworths.com.au/shop/productdetails/224763/woolworths-12-x-large-free-range-eggs',
// ];

// export const colesLinks = [
//   'https://www.coles.com.au/product/coles-rspca-approved-chicken-breast-fillets-large-pack-approx.-1.4kg-2263179',
//   'https://www.coles.com.au/product/coles-basmati-rice-1kg',
//   'https://www.coles.com.au/product/coles-gourmet-field-tomatoes-1-kg-4640831'
// ];

// export const aldiLinks = [
//   'https://www.aldi.com.au/product/organic-bananas-1kg',
//   'https://www.aldi.com.au/product/greek-yogurt-1kg',
// ];
// Plan data structure interfaces
export interface PlanItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  item_requested: string;
}

export interface StoreBasket {
  store_info: {
    store_id: string;
    name: string;
    address: string;
    retailer_id: string;
  };
  links: string[]
  items: PlanItem[];
  subtotal: number;
  click_collect_available: boolean;
  min_spend_met: boolean;
}

export interface RouteSegment {
  from_store_id?: string;
  to_store_id: string;
  distance_km: number;
  travel_time_min: number;
  travel_method: "walking" | "driving" | "public_transport";
}

export interface PlanData {
  total_cost: number;
  total_time: number;
  travel_time: number;
  shopping_time: number;
  total_savings: number;
  route_score: number;
  starting_location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  stores: StoreBasket[];
  route_segments: RouteSegment[];
  optimization_details: {
    price_component: number;
    time_component: number;
    total_items: number;
    stores_count: number;
  };
}

// Template plan data
export const TEMPLATE_PLAN: PlanData = {
  total_cost: 47.85,
  total_time: 24,
  travel_time: 18,
  shopping_time: 24,
  total_savings: 12.5,
  route_score: 0.8472,
  starting_location: {
    address: "100 Market Street, Sydney NSW 2000",
    coordinates: { lat: -33.8688, lng: 151.2093 },
  },
  route_segments: [
    {
      to_store_id: "store_001",
      distance_km: 0.8,
      travel_time_min: 6,
      travel_method: "walking",
    },
    {
      from_store_id: "store_001",
      to_store_id: "store_002",
      distance_km: 0.5,
      travel_time_min: 4,
      travel_method: "walking",
    },
    {
      from_store_id: "store_002",
      to_store_id: "store_003",
      distance_km: 0.7,
      travel_time_min: 8,
      travel_method: "walking",
    },
  ],
  stores: [
    {
      store_info: {
        store_id: "store_001",
        name: "Woolworths Town Hall",
        address: "Shop 1248/Cnr Park Street &, George St, Sydney NSW 2000",
        retailer_id: "woolworths",
      },
      items: [
        {
          product_name: "Woolworths Full Cream Milk 2L",
          quantity: 1,
          unit_price: 3.2,
          line_total: 3.2,
          item_requested: "2L milk",
        },
        {
          product_name: "Woolworths Wholemeal Bread",
          quantity: 1,
          unit_price: 2.7,
          line_total: 2.7,
          item_requested: "wholemeal bread",
        },
        {
          product_name: "Woolworths 12 X-Large Free Range Eggs",
          quantity: 1,
          unit_price: 6.6,
          line_total: 6.6,
          item_requested: "12 free-range eggs",
        },
      ],
      links : [
        'https://www.woolworths.com.au/shop/productdetails/888137/woolworths-full-cream-milk',
        'https://www.woolworths.com.au/shop/productdetails/581176/woolworths-wholemeal-soft-sandwich-bread',
        'https://www.woolworths.com.au/shop/productdetails/224763/woolworths-12-x-large-free-range-eggs'
      ],
      subtotal: 12.5,
      click_collect_available: true,
      min_spend_met: true,
    },
    {
      store_info: {
        store_id: "store_002",
        name: "Coles World Square",
        address: "650 George St, Sydney NSW 2000",
        retailer_id: "coles",
      },
      items: [
        {
          product_name: "Coles Chicken Breast 1.4kg",
          quantity: 1,
          unit_price: 15.4,
          line_total: 15.4,
          item_requested: "1.4kg chicken breast",
        },
        {
          product_name: "Coles Basmati Rice 1kg",
          quantity: 1,
          unit_price: 4,
          line_total: 4,
          item_requested: "1kg rice",
        },
        {
          product_name: "Coles Tomatoes 1kg",
          quantity: 1,
          unit_price: 3.9,
          line_total: 3.9,
          item_requested: "tomatoes",
        },
      ],
      links : [
        'https://www.coles.com.au/product/coles-rspca-approved-chicken-breast-fillets-large-pack-approx.-1.4kg-2263179',
        'https://www.coles.com.au/product/coles-basmati-rice-1kg-8703059',
        'https://www.coles.com.au/product/coles-gourmet-field-tomatoes-1-kg-4640831'
      ],
      subtotal: 23.3,
      click_collect_available: true,
      min_spend_met: true,
    },
    {
      store_info: {
        store_id: "store_003",
        name: "ALDI Oxford Village",
        address: "73 Oxford St, Darlinghurst NSW 2010",
        retailer_id: "aldi",
      },
      links : [
        "https://www.aldi.com.au/product/no-brand-cavendish-bananas-loose-000000000000380234",
        "https://www.aldi.com.au/product/jalna-sweet-creamy-greek-style-yogurt-1kg-000000000000399510"
      ],
      items: [
        {
          product_name: "ALDI Bananas 1kg",
          quantity: 1,
          unit_price: 3.99,
          line_total: 3.99,
          item_requested: "organic bananas",
        },
        {
          product_name: "ALDI Greek Yogurt 1kg",
          quantity: 1,
          unit_price: 6.49,
          line_total: 6.49,
          item_requested: "greek yogurt",
        },
      ],
      subtotal: 10.48,
      click_collect_available: false,
      min_spend_met: false,
    },
  ],
  optimization_details: {
    price_component: 0.7234,
    time_component: 0.1238,
    total_items: 10,
    stores_count: 3,
  },
};
