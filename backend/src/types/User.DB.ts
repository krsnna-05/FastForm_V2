type User = {
  email: string;
  name: string;
  accessToken?: string;
  refreshToken?: string;
  profilePictureUrl?: string;
  createdAt: Date;
};

export default User;
