import { useAppData } from '../app/providers/AppDataProvider'

export function useFavorites() {
  const { currentUser, database, publishedVentures } = useAppData()
  const favorites = currentUser
    ? database.favorites.filter((favorite) => favorite.userId === currentUser.uid)
    : []

  return {
    favorites,
    favoriteVentures: favorites
      .map((favorite) => publishedVentures.find((venture) => venture.id === favorite.ventureId))
      .filter((venture): venture is (typeof publishedVentures)[number] => Boolean(venture)),
    isFavorite: (ventureId: string) =>
      favorites.some((favorite) => favorite.ventureId === ventureId),
  }
}
