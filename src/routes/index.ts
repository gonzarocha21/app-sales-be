import { Router } from "express";
import { adjustmentsRouter } from "../modules/adjustments/adjustments.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { categoriesRouter } from "../modules/categories/categories.routes";
import { locationsRouter } from "../modules/locations/locations.routes";
import { movementsRouter } from "../modules/movements/movements.routes";
import { productsRouter } from "../modules/products/products.routes";
import { reportsRouter } from "../modules/reports/reports.routes";
import { returnsRouter } from "../modules/returns/returns.routes";
import { salesRouter } from "../modules/sales/sales.routes";
import { settingsRouter } from "../modules/settings/settings.routes";
import { stockRouter } from "../modules/stock/stock.routes";
import { stockLotsRouter } from "../modules/stock-lots/stockLots.routes";
import { stockMovementsRouter } from "../modules/stock-movements/stockMovements.routes";
import { usersRouter } from "../modules/users/users.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/adjustments", adjustmentsRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/locations", locationsRouter);
apiRouter.use("/movements", movementsRouter);
apiRouter.use("/stock", stockRouter);
apiRouter.use("/stock-lots", stockLotsRouter);
apiRouter.use("/stock-movements", stockMovementsRouter);
apiRouter.use("/sales", salesRouter);
apiRouter.use("/returns", returnsRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/settings", settingsRouter);

export { apiRouter };
