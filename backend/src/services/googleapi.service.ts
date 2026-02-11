import { google } from "googleapis";
import { googleAuthConfig, googleAuthScopes } from "../config/env";

class GoogleApiService {
  private oAuth2Client: any;

  constructor(oAuth2Client: any) {
    this.oAuth2Client = oAuth2Client;
  }

  getUserInfo = async (): Promise<any> => {
    try {
      const oauth2 = google.oauth2({
        auth: this.oAuth2Client,
        version: "v2",
      });
      const { data } = await oauth2.userinfo.get();
      return data;
    } catch (error: unknown) {
      console.error("Error fetching user info from Google:", error);
      throw error;
    }
  };
}

export default GoogleApiService;
