import { Router } from "express";
import { editForm } from "../controllers/form.controller";
import { getFormById, getForms } from "../controllers/formRetrive.controller";
import {
  createAndUpdateGoogleForm,
  updateGoogleForm,
} from "../controllers/googleForm.controller";

const formRouter = Router();

formRouter.post("/edit", editForm);
formRouter.get("/list", getForms);
formRouter.get("/:formId", getFormById);

formRouter.post("/google/create", createAndUpdateGoogleForm);
formRouter.post("/google/update", updateGoogleForm);

export default formRouter;
