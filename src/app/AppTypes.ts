const AppTypes = {
  DBProvider: Symbol.for('DBProvider'),
  CacheProvider: Symbol.for('CacheProvider'),
  PaymentProvider: Symbol.for('PaymentProvider'),

  // Entity Services
  HealthService: Symbol.for('HealthService'),
  AdminService: Symbol.for('AdminService'),
  CatalogueService: Symbol.for('CatalogueService'),
  ProductService: Symbol.for('ProductService'),
  ProductElementService: Symbol.for('ProductElementService'),
  BlogService: Symbol.for('BlogService'),
  SectionService: Symbol.for('SectionService'),
  SectionElementsService: Symbol.for('SectionElementsService'),
  UserService: Symbol.for('UserService'),
  AddressService: Symbol.for('AddressService'),
  SupportedRegionsService: Symbol.for('SupportedRegionsService'),
  CurrencyService: Symbol.for('CurrencyService'),
  FAQService: Symbol.for('FAQService'),
  SearchService: Symbol.for('SearchService'),
  StaticPageService: Symbol.for('StaticPageService'),
  CartService: Symbol.for('CartService'),
  WishlistService: Symbol.for('WishlistService'),
  PaymentService: Symbol.for('PaymentService'),
  OrderService: Symbol.for('OrderService'),
  SecurityService: Symbol.for('SecurityService'),
  SettingService: Symbol.for('SettingService'),
  ImageService: Symbol.for('ImageService'),
}

export default AppTypes
