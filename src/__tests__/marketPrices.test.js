import {
  commodityFor,
  referenceCommodityForProduct,
  quantityInKg,
  parseQty,
  perKg,
  summarise,
  freshness,
  parseArrival,
} from "../lib/marketPrices";

// Records copied from a live data.gov.in response (Agmarknet mandi prices, 10/11/2026).
// The commodity filter is fuzzy, so a "Masur Dal" request also returned other dals.
const masurResponse = [
  { state: "West Bengal", district: "Bankura", market: "Bishnupur(Bankura) APMC", commodity: "Masur Dal", variety: "Masur Dal", grade: "FAQ", arrival_date: "10/11/2026", min_price: 9900, max_price: 11500, modal_price: 10800 },
  { state: "Uttar Pradesh", district: "Bijnor", market: "Bijnaur APMC", commodity: "Green Gram Dal(Moong Dal)", variety: "Other", grade: "FAQ", arrival_date: "10/11/2026", min_price: 9700, max_price: 10900, modal_price: 10466.67 },
  { state: "Manipur", district: "Imphal West", market: "Lamlong Bazaar APMC", commodity: "Masur Dal", variety: "Other", grade: "FAQ", arrival_date: "10/11/2026", min_price: 11000, max_price: 12000, modal_price: 11500 },
  { state: "Manipur", district: "Thoubal", market: "Kakching Market APMC", commodity: "Masur Dal", variety: "Other", grade: "FAQ", arrival_date: "10/11/2026", min_price: 12500, max_price: 13000, modal_price: 12700 },
  { state: "Odisha", district: "Ganjam", market: "Old market", commodity: "Masur Dal", variety: "Other", grade: "FAQ", arrival_date: "09/11/2026", min_price: 9000, max_price: 9500, modal_price: 9200 },
];

describe("matching list items to mandi commodities", () => {
  test("loose staples match by their whole name, plurals and Hindi names included", () => {
    expect(commodityFor({ name: "Tomatoes" })).toBe("Tomato");
    expect(commodityFor({ name: "pyaz" })).toBe("Onion");
    expect(commodityFor({ name: "Toor dal" })).toBe("Red gram split/Arhar dal/Tur dal");
    expect(commodityFor({ name: "Jaggery" })).toBe("Gur(Jaggery)");
    expect(commodityFor({ name: "Spinach" })).toBe("Spinach");
  });

  test("items that are not the mandi commodity never borrow its price", () => {
    expect(commodityFor({ name: "Whole wheat atta" })).toBeNull(); // atta is not wheat grain
    expect(commodityFor({ name: "Basmati rice" })).toBeNull(); // a variety, not the loose commodity
    expect(commodityFor({ name: "Turmeric powder" })).toBeNull();
    expect(commodityFor({ name: "Paneer" })).toBeNull(); // not traded in mandis
    expect(commodityFor({ name: "Curd" })).toBeNull();
  });

  test("packaged products never match, even with a commodity name", () => {
    expect(commodityFor({ name: "Rice", kind: "product" })).toBeNull();
    expect(commodityFor({ name: "Sugar", kind: "product" })).toBeNull();
  });

  test("a packaged product gets a loose reference only when its name and category both say so", () => {
    const rices = ["Plant-based foods", "Cereals and potatoes", "Rices"];
    expect(referenceCommodityForProduct({ product_name: "India gate basmati rice dubar", categories_tags_en: rices })).toBe("Rice");
    // Open Food Facts files these under rice categories, but they are not rice grain
    expect(referenceCommodityForProduct({ product_name: "Poha Mota", categories_tags_en: rices })).toBeNull();
    expect(referenceCommodityForProduct({ product_name: "Murmura, Kurmura", categories_tags_en: rices })).toBeNull();
    expect(referenceCommodityForProduct({ product_name: "Rice", categories_tags_en: ["Biscuits"] })).toBeNull();
  });
});

describe("units", () => {
  test("mandi prices are per quintal; per kg is a hundredth", () => {
    expect(perKg(5250)).toBe(52.5);
    expect(perKg(10466.67)).toBeCloseTo(104.6667, 4);
  });

  test("only weights convert to kg", () => {
    expect(quantityInKg("1", "kg")).toBe(1);
    expect(quantityInKg("250", "g")).toBe(0.25);
    expect(quantityInKg("1/2", "kg")).toBe(0.5);
    expect(quantityInKg("1 1/2", "kg")).toBe(1.5);
    expect(quantityInKg("1", "L")).toBeNull(); // volume is not weight
    expect(quantityInKg("6", "pcs")).toBeNull();
    expect(quantityInKg("1", "bunch")).toBeNull();
    expect(quantityInKg("1", "pack")).toBeNull();
    expect(quantityInKg("", "kg")).toBeNull(); // no quantity, no estimate
    expect(parseQty("abc")).toBeNull();
  });
});

describe("summarising a live response", () => {
  const s = summarise("Masur Dal", masurResponse);

  test("drops fuzzy matches and keeps only the latest reporting date", () => {
    expect(s.commodity).toBe("Masur Dal");
    expect(s.marketsReporting).toBe(3); // 3 masur records on 10/11; moong and the 09/11 record excluded
    expect(s.arrivalDate).toBe("10/11/2026");
  });

  test("shows the market with the median modal price, with its own min and max", () => {
    expect(s.market).toBe("Lamlong Bazaar APMC");
    expect(s.modalPrice).toBe(11500);
    expect(s.minPrice).toBe(11000);
    expect(s.maxPrice).toBe(12000);
    expect(s.modalLow).toBe(10800);
    expect(s.modalHigh).toBe(12700);
  });

  test("no exact record means no price, never a substitute", () => {
    expect(summarise("Ghee", masurResponse)).toBeNull();
  });
});

describe("freshness", () => {
  test("today and yesterday are current; older reports are marked with their age", () => {
    const today = new Date();
    const fmt = (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    const daysAgo = (n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
    expect(freshness(parseArrival(fmt(daysAgo(0))))).toEqual({ current: true, label: "Today" });
    expect(freshness(parseArrival(fmt(daysAgo(1))))).toEqual({ current: true, label: "Yesterday" });
    expect(freshness(parseArrival(fmt(daysAgo(4))))).toEqual({ current: false, label: "4 days old" });
    expect(freshness(null).current).toBe(false);
  });
});
