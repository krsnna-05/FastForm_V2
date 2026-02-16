import { Router } from "express";
import { editForm } from "../controllers/form.controller";
import { getFormById, getForms } from "../controllers/formRetrive.controller";

const formRouter = Router();

formRouter.post("/edit", editForm);
formRouter.get("/list", getForms);
formRouter.get("/:formId", getFormById);

export default formRouter;
