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

  constructor(userId: string) {
    DBService.fetchAccessTokenByUserId(userId).then((token) => {
      if (token) {
        this.oAuth2Client.setCredentials({ access_token: token });
      } else {
        console.warn(
          `No access token found for user ${userId}. Google Forms API calls will fail.`,
        );
      }
    });
  }

  createGoogleForm = async (form: Form) => {
    this.forms.forms.create({
      requestBody: {
        info: {
          title: form.title,
          description: form.description,
        },
      },
    });
  };

  updateGoogleForm = async (googleFormId: string, form: Form) => {
    const updatedRequests: forms_v1.Schema$Request[] = [];

    const currGoogleForm = await this.forms.forms.get({
      formId: googleFormId,
    });

    currGoogleForm.data.items?.forEach((item, index) => {
      updatedRequests.push({
        deleteItem: {
          location: {
            index: index,
          },
        },
      });
    });

    const newRequests = form.fields.map((field, index) => ({
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

              ...(field.fieldType === "single_choice" && {
                choiceQuestion: {
                  type: "RADIO",
                  options: field.options?.map((option) => ({
                    value: option,
                  })),
                },
              }),

              ...(field.fieldType === "multiple_choice" && {
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

    this.forms.forms.batchUpdate({
      formId: googleFormId,
      requestBody: {
        requests: updatedRequests,
      },
    });
  };
}

export default googleFormService;
