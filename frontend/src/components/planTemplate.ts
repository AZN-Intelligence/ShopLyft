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
          quantity: 2,
          unit_price: 3.6,
          line_total: 7.2,
          item_requested: "2L milk",
        },
        {
          product_name: "Woolworths Wholemeal Bread",
          quantity: 1,
          unit_price: 2.5,
          line_total: 2.5,
          item_requested: "wholemeal bread",
        },
        {
          product_name: "Woolworths Free Range Eggs 12pk",
          quantity: 1,
          unit_price: 4.2,
          line_total: 4.2,
          item_requested: "12 free-range eggs",
        },
      ],
      subtotal: 13.9,
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
          product_name: "Coles Chicken Breast 1kg",
          quantity: 1,
          unit_price: 8.5,
          line_total: 8.5,
          item_requested: "1kg chicken breast",
        },
        {
          product_name: "Coles Basmati Rice 1kg",
          quantity: 1,
          unit_price: 3.2,
          line_total: 3.2,
          item_requested: "1kg rice",
        },
        {
          product_name: "Coles Tomatoes 500g",
          quantity: 1,
          unit_price: 2.8,
          line_total: 2.8,
          item_requested: "tomatoes",
        },
      ],
      subtotal: 14.5,
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
      items: [
        {
          product_name: "ALDI Organic Bananas 1kg",
          quantity: 1,
          unit_price: 2.9,
          line_total: 2.9,
          item_requested: "organic bananas",
        },
        {
          product_name: "ALDI Greek Yogurt 1kg",
          quantity: 1,
          unit_price: 4.5,
          line_total: 4.5,
          item_requested: "greek yogurt",
        },
        {
          product_name: "ALDI Olive Oil 500ml",
          quantity: 1,
          unit_price: 5.95,
          line_total: 5.95,
          item_requested: "olive oil",
        },
        {
          product_name: "ALDI Pasta 500g",
          quantity: 2,
          unit_price: 1.2,
          line_total: 2.4,
          item_requested: "pasta",
        },
      ],
      subtotal: 15.75,
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
