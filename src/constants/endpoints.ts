const endpoints = {
  authentication: {
    login: "/v1/api/users/auth/email/request",
    verifyOtp: "/v1/api/users/auth/email/verify",
    register: "/v1/api/users/auth/register",
    refreshToken: "/v1/api/users/auth/refresh",
    updateUserInfo: "/v1/api/users/auth/info",
    googleLogin: "/v1/api/users/auth/google",
    appleLogin: "/v1/api/users/auth/apple",
  },
  stores: {
    index: "/v1/api/users/stores",
  },
  products: {
    index: "/v1/api/users/products",
    mostAdded: "/v1/api/users/products/most-added",
  },
  registries: {
    index: "/v1/api/users/registries",
    publicGuestView: "/v1/api/public/registries/guest-view",
    purchase: "/v1/api/users/purchases",
  },
  upload: {
    index: "/v1/api/users/upload",
  },
  search: {
    index: "/v1/api/users/search",
  },
  guides: {
    index: "/v1/api/users/guides",
  },
};

export default endpoints;
