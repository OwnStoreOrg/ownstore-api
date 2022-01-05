export interface IUserWishAddCommand {
  userId: number
  individualProductId?: number
  comboProductId?: number
}

export interface IUserWishDeleteCommand {
  userWishId: number
  userId: number
}
