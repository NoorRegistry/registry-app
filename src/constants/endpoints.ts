const endpoints = {
  authentication: {
    login: "/v1/api/users/auth/login",
    register: "/v1/api/users/auth/register",
    refreshToken: "/v1/api/users/auth/refresh",
  },
  stores: {
    index: "/v1/api/users/stores",
  },
  products: {
    index: "/v1/api/users/products",
  },
  registries: {
    index: "/v1/api/users/registries",
    purchase: "/v1/api/users/purchases",
  },
  upload: {
    index: "/v1/api/admin/upload",
  },
  search: {
    index: "/v1/api/users/search",
  },
  guides: {
    index: "/v1/api/users/guides",
  },
};

export default endpoints;
