export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug?: string;
  children: CategoryTreeNode[];
};

export type SettingWebsiteInfo = {
  websiteName?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  favicon?: string;
};

export type DashboardInfoData = {
  settingWebsiteInfo: SettingWebsiteInfo;
  categoryList: CategoryTreeNode[];
};

export type PublicTourCategory = {
  id: string;
  name: string;
  slug: string;
};

export type PublicTour = {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  images: string[];
  price: number;
  priceNew: number;
  time: string;
  information: string;
  stock: number;
  departureDate: string | null;
  endDate: string | null;
  locations: Array<Record<string, unknown>>;
  locationNames: string[];
  schedules: Array<Record<string, unknown>>;
  rating: number;
  reviewCount: number;
  category: PublicTourCategory | null;
};

export type DashboardToursData = {
  tourList: PublicTour[];
};

export type DashboardTourDetailData = {
  tour: PublicTour | null;
};

export type ChatbotTourSuggestion = {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  information: string;
  time: string;
  price: number;
  priceNew: number;
  locationNames: string[];
  categoryName: string;
  reason: string;
};

export type ChatbotAiJson = {
  reply: string;
  matches: Array<{
    slug?: string;
    name?: string;
    reason?: string;
  }>;
};

export type ChatbotData = {
  aiJson: ChatbotAiJson;
  suggestions: ChatbotTourSuggestion[];
};

export type CartItem = {
  tourId: string;
  quantity: number;
  avatar?: string;
  name?: string;
  slug?: string;
  departureDate?: string;
  locationFrom?: string;
  locationFromName?: string;
  price?: number;
  priceNew?: number;
  stock?: number;
  priceNewAdult?: number;
  priceNewChildren?: number;
  priceNewBaby?: number;
  stockAdult?: number;
  stockChildren?: number;
  stockBaby?: number;
};

export type CartSummary = {
  itemCount: number;
  totalQuantity: number;
};

export type CartData = {
  cart: CartItem[];
  summary: CartSummary;
};

export type PublicGear = {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  badge: string;
};

export type DashboardGearsData = {
  gearList: PublicGear[];
  categories: string[];
};

export type PublicJournal = {
  id: string;
  title: string;
  summary: string;
  tag: string;
  author: string;
  date: string;
  image: string;
  avatar: string;
  trendingScore: number;
};

export type DashboardJournalsData = {
  articleList: PublicJournal[];
  trendingList: PublicJournal[];
};

export type ClientAccountProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
  walletBalance?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthMeData = {
  account: ClientAccountProfile;
};
