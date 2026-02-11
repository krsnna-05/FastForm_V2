import UserModel from "../models/User";
import User from "../types/User.DB";

type user = {
  name: string;
  email: string;
  accessToken?: string;
  refreshToken?: string;
  profilePictureUrl?: string;
};

class DBService {
  getUserByEmail = async (
    email: string,
  ): Promise<{ user: User; userId: string } | null> => {
    try {
      const user = await UserModel.findOne({ email }).exec();

      if (!user) {
        return null;
      }

      return { user: user, userId: user._id.toString() };
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  };

  checkIfUserExistswithId = async (userId: string): Promise<boolean> => {
    try {
      const user = await UserModel.findById(userId).exec();

      if (!user) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw error;
    }
  };

  checkIfUserExistswithEmail = async (email: string): Promise<boolean> => {
    try {
      const user = await UserModel.findOne({ email }).exec();

      if (!user) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw error;
    }
  };

  updateUserAccessToken = async (
    userId: string,
    accessToken: string,
  ): Promise<void> => {
    try {
      await UserModel.findByIdAndUpdate(userId, { accessToken }).exec();
    } catch (error) {
      console.error("Error updating user access token:", error);
      throw error;
    }
  };

  updateUserTokens = async (
    userId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> => {
    try {
      const update: Partial<user> = { accessToken };
      if (refreshToken) {
        update.refreshToken = refreshToken;
      }

      await UserModel.findByIdAndUpdate(userId, update).exec();
    } catch (error) {
      console.error("Error updating user tokens:", error);
      throw error;
    }
  };

  addUser = async (user: user): Promise<boolean> => {
    try {
      const newUser = new UserModel(user);
      await newUser.save();

      return true;
    } catch (error) {
      console.error("Error adding user to the database:", error);
      throw error;
    }
  };
}

export default new DBService();
