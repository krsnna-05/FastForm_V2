import { Router } from "express";
import { editForm } from "../controllers/form.controller";

const formRouter = Router();

formRouter.post("/edit", editForm);

export default formRouter;
