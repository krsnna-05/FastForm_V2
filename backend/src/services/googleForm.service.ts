import { google } from "googleapis";
import { googleAuthConfig } from "../config/env";
import DBService from "./DB.service";
import { Form } from "../types/Form.DB";

import type { forms_v1 } from "googleapis";

class googleFormService {
  private oAuth2Client = new google.auth.OAuth2(
    googleAuthConfig.GOOGLE_AUTH_CLIENT_ID,
    googleAuthConfig.GOOGLE_AUTH_CLIENT_SECRET,
    googleAuthConfig.GOOGLE_AUTH_REDIRECT_URL,
  );

  private forms = google.forms({ version: "v1", auth: this.oAuth2Client });
  private initPromise: Promise<void>;

  constructor(userId: string) {
    this.initPromise = DBService.fetchAccessTokenByUserId(userId)
      .then((token) => {
        if (!token) {
          throw new Error(
            `No access token found for user ${userId}. Please reconnect Google account.`,
          );
        }

        this.oAuth2Client.setCredentials({ access_token: token });
      })
      .catch((error) => {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to initialize Google credentials",
        );
      });
  }

  private ensureInitialized = async () => {
    await this.initPromise;
  };

  private isTransientNetworkError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : String(error ?? "");

    return /EAI_AGAIN|ENOTFOUND|ECONNRESET|ETIMEDOUT|socket hang up/i.test(
      message,
    );
  };

  private executeWithRetry = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    retries = 3,
    delayMs = 500,
  ): Promise<T> => {
    let attempt = 0;
    let lastError: unknown;

    while (attempt < retries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        attempt += 1;

        if (!this.isTransientNetworkError(error) || attempt >= retries) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`${operationName} failed: ${message}`);
  };

  createGoogleForm = async (form: Partial<Form>) => {
    await this.ensureInitialized();

    const res = await this.executeWithRetry("createGoogleForm", () =>
      this.forms.forms.create({
        requestBody: {
          info: {
            title: form.title,
            description: form.description,
          },
        },
      }),
    );

    return res;
  };

  updateGoogleForm = async (googleFormId: string, form: Partial<Form>) => {
    await this.ensureInitialized();

    if (!googleFormId || !form.fields) {
      throw new Error(
        "{GOOGLE_FORM_UPDATE_FAILED}: Missing googleFormId or form fields",
      );
    }

    const fields = form.fields;

    const updatedRequests: forms_v1.Schema$Request[] = [];

    const currGoogleForm = await this.executeWithRetry("getGoogleForm", () =>
      this.forms.forms.get({
        formId: googleFormId,
      }),
    );

    currGoogleForm.data.items?.forEach((item, index) => {
      updatedRequests.push({
        deleteItem: {
          location: {
            index: index,
          },
        },
      });
    });

    const newRequests = fields.map((field, index) => ({
      createItem: {
        item: {
          title: field.label,
          questionItem: {
            question: {
              ...(field.fieldType === "text" && {
                textQuestion: {
                  paragraph: false,
                },
              }),

              ...(field.fieldType === "para" && {
                textQuestion: {
                  paragraph: true,
                },
              }),

              ...(field.fieldType === "radio" && {
                choiceQuestion: {
                  type: "RADIO",
                  options: field.options?.map((option) => ({
                    value: option,
                  })),
                },
              }),

              ...(field.fieldType === "checkbox" && {
                choiceQuestion: {
                  type: "CHECKBOX",
                  options: field.options?.map((option) => ({
                    value: option,
                  })),
                },
              }),

              required: field.required,
            },
          },
        },
        location: {
          index: index,
        },
      },
    }));

    updatedRequests.push(...newRequests);

    const res = await this.executeWithRetry("updateGoogleForm", () =>
      this.forms.forms.batchUpdate({
        formId: googleFormId,
        requestBody: {
          includeFormInResponse: false,
          requests: updatedRequests,
        },
      }),
    );

    console.log("Google Form update response:", res);

    return res;
  };
}

export default googleFormService;
