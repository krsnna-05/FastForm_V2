import UserModel from "../models/User";

type addUserParams = {
  user: {
    name: string;
    email: string;
    password: string;
    accessToken?: string;
    refreshToken?: string;
    profilePictureUrl?: string;
  };
};

class DBService {
  checkIfUserExists = async (userId: string): Promise<boolean> => {
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

  addUser = async ({ user }: addUserParams): Promise<void> => {
    try {
      const newUser = new UserModel(user);
      await newUser.save();
    } catch (error) {
      console.error("Error adding user to the database:", error);
      throw error;
    }
  };
}

export default new DBService();
