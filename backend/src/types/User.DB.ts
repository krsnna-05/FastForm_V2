type User = {
  email: string;
  password: string;
  name: string;
  accessToken?: string;
  refreshToken?: string;
  profilePictureUrl?: string;
  createdAt: Date;
};

export default User;
