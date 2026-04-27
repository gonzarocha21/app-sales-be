import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { salesService } from "../sales/sales.service";
import { stockLotsService } from "../stock-lots/stockLots.service";

export const reportsService = {
  list: () => [
    {
      name: "Stock report",
      path: "/reports/stock"
    },
    {
      name: "Low stock report",
      path: "/reports/stock/low"
    },
    {
      name: "Sales report",
      path: "/reports/sales"
    }
  ],

  getStockReport: () => {
    const lots = stockLotsService.list();
    const byProduct = lots.reduce<Record<string, number>>((summary, lot) => {
      summary[lot.productId] = (summary[lot.productId] ?? 0) + lot.quantity;
      return summary;
    }, {});
    const byLocation = lots.reduce<Record<string, number>>((summary, lot) => {
      summary[lot.locationId] = (summary[lot.locationId] ?? 0) + lot.quantity;
      return summary;
    }, {});

    return {
      totalQuantity: lots.reduce((total, lot) => total + lot.quantity, 0),
      totalLots: lots.length,
      byProduct: Object.entries(byProduct).map(([productId, quantity]) => ({
        productId,
        quantity
      })),
      byLocation: Object.entries(byLocation).map(([locationId, quantity]) => ({
        locationId,
        quantity
      })),
      lots
    };
  },

  getLowStockReport: (threshold = env.lowStockThreshold) => {
    if (!Number.isFinite(threshold) || threshold < 0) {
      throw new AppError("Low stock threshold must be a positive number", 400);
    }

    const lots = stockLotsService.list();
    const productTotals = lots.reduce<Record<string, number>>((summary, lot) => {
      summary[lot.productId] = (summary[lot.productId] ?? 0) + lot.quantity;
      return summary;
    }, {});
    const locationTotals = lots.reduce<Record<string, { productId: string; locationId: string; quantity: number }>>(
      (summary, lot) => {
        const key = `${lot.productId}:${lot.locationId}`;
        const current = summary[key] ?? {
          productId: lot.productId,
          locationId: lot.locationId,
          quantity: 0
        };

        current.quantity += lot.quantity;
        summary[key] = current;

        return summary;
      },
      {}
    );
    const products = Object.entries(productTotals).map(([productId, quantity]) => ({
      productId,
      quantity,
      threshold,
      status: quantity < 0 ? "negative" : quantity <= threshold ? "low" : "ok"
    }));
    const locations = Object.values(locationTotals).map((item) => ({
      ...item,
      threshold,
      status: item.quantity < 0 ? "negative" : item.quantity <= threshold ? "low" : "ok"
    }));

    return {
      threshold,
      lowStockProducts: products.filter((item) => item.status === "low"),
      negativeStockProducts: products.filter((item) => item.status === "negative"),
      lowStockLocations: locations.filter((item) => item.status === "low"),
      negativeStockLocations: locations.filter((item) => item.status === "negative"),
      products,
      locations
    };
  },

  getSalesReport: () => {
    const sales = salesService.list();
    const itemsByProduct = sales.flatMap((sale) => sale.items);
    const quantityByProduct = itemsByProduct.reduce<Record<string, { quantity: number; total: number }>>(
      (summary, item) => {
        const current = summary[item.productId] ?? { quantity: 0, total: 0 };

        current.quantity += item.quantity;
        current.total += (item.unitPrice ?? 0) * item.quantity;
        summary[item.productId] = current;

        return summary;
      },
      {}
    );

    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce((total, sale) => total + sale.total, 0),
      totalItemsSold: itemsByProduct.reduce((total, item) => total + item.quantity, 0),
      byProduct: Object.entries(quantityByProduct).map(([productId, summary]) => ({
        productId,
        quantity: summary.quantity,
        total: summary.total
      })),
      sales
    };
  }
};
