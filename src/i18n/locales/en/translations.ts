const translations = {
  login: {
    loginToAccount: "Login to Your Account",
    orLoginWith: "Or login with",
    login: "Login",
    confirmationCode: "Verification code",
    emailSentTo:
      "Enter the verification code we sent to <Important>{{email}}</Important>",
    didNotGetCode: "Didn’t receive the code?",
    resend: "Resend",
    loginSuccessful: "Logged in successfully",
    loginFailed: "Login failed",
    resendCodeSuccessful: "Verification code sent successfully",
    resendCodeFailed: "Error sending verification code",
    loginAgreement:
      "By signing up, you agree to our <a>Terms</a>, <1>Data Policy</1> and <2>Cookies Policy</2>.",
    enterValidEmail: "Enter valid email address",
    enterEmail: "Enter your email address",
    emailPlaceholder: "example@gmail.com",
    enterPassword: "Enter your password",
    enterValidPassword:
      "Password must be at least 8 characters long, should contain at least one letter, one number and one special character",
    password: "Password",
    noAccount: "Don't have an account?",
    register: "Sign Up",
    signInToExistingAccount: "Please sign in to your existing account",
  },
  common: {
    login: "Log In",
    home: "Home",
    logout: "Log out",
    back: "Back",
    cancel: "Cancel",
    skip: "Skip",
    submit: "Submit",
    email: "Email",
    next: "Next",
    viewAll: "View All",
    deleteAccount: "Delete account",
    search: "Search",
    registry: "Registry",
    registries: "Registries",
    guides: "Guides",
    me: "Me",
    shop: "Shop",
    products: "Products",
    stores: "Stores",
    store: "Store",
    welcome: "Welcome, ",
    giftItUp1: "Gift",
    giftItUp2: "it up!",
    craftedWithLove1: "Crafted with",
    craftedWithLove2: "in Kuwait",
    categories: "Categories",
    category: "Category",
    create: "Create",
    share: "Share",
    public: "Public",
    private: "Private",
    seeAll: "See All",
    noResultsFound: "No results found",
    globalSearch: "Search stores, products, guides & registries",
    emptySearchDescription:
      "Search our curated list of stores and products, or browse through our guides.",
    save: "Save",
    required: "Required",
  },
  onboard: {
    title1: "Discover Open Tales.",
    description1:
      "Therapeutic audio stories that help your child cope with difficult emotions.",
    title2: "It's not just interesting stories.",
    description2:
      "The stories have a therapeutic effect, regulating strong emotions and developing psychological skills.",
    title3: "Discover the power of stories.",
    description3:
      "Each story develops your child's imagination and encourages conversation and reflection.",
    letsStart: "Let's Get Started",
  },
  home: {
    buildRegistry: "Build a registry that's uniquely yours",
    buildRegistryDesc:
      "Put anything from our curated list of stores onto your registry",
    getStarted: "Get started",
    browsePopularStores: "Browse some popular stores",
  },
  shop: {
    title: "Our Shop",
    subtitle: "Curated by experts and tested by parents",
    searchPlaceholder: "Search for products",
    searchStoresPlaceholder: "Search for our curated stores",
  },
  registry: {
    emptyRegistry: "You haven't added anything to your registry, yet!",
    startAddingItems: "Start adding items",
    yourList: "Your list",
    items_one: "{{count}} item",
    items_other: "{{count}} items",
    switch: "Switch",
    itemsAdded: "Items Added",
    giftsPurchased: "Gifts Purchased",
    purchasedOutOf: "Purchased {{purchased}} of {{total}}",
    itemDetails: "Item details",
    noteForRegistryItem: "Notes to friends and family",
    noteForRegistryItemPlaceholder:
      "Let your gift givers know what size or color you would like",
    purchases: "Purchases",
    purchasedCount: "{{purchased}} of {{total}}",
    qty: "Qty",
    quantityRequested: "Quantity requested",
    markAnotherPurchase_zero: "Mark as purchased",
    markAnotherPurchase_other: "Mark another purchase",
    guestView: "Guest view",
    itemAddedToregistry: "Item added to registry",
    newRegistry: "New registry",
    createregistry: "Create registry",
    letsCreateRegistry: "Let's create a registry that's uniquely yours!",
    personalizaYourRegistry: "Personaliza your registry.",
    addPhotoGreeting: "Add a photo and a greeting.",
    title: "Title",
    titlePlaceholder: "Enter registry title",
    greetings: "Greetings",
    greetingsPlaceholder: "Write a note to your family and friends",
    registryCreateError: "Something went wrong. Try again",
    addtoShiftGift: "Add to ShiftGiftMe",
    iPurchased: "I purchased this",
    someoneElsePurchased: "Someone else purchased this",
    qtyPurchased: "Quantity Purchased",
    purchaserName: "Purchaser's Name",
  },
} as const;

export default translations;
