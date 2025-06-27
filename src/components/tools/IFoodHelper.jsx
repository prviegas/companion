import { useState, useEffect } from 'react'
import './IFoodHelper.css'
import { useAuth } from '../../context/AuthContext'
import { cloudSync } from '../../services/cloudSync'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUtensils, 
  faHome,
  faSearch,
  faShoppingCart,
  faWindowMaximize,
  faWindowRestore,
  faTimes,
  faHeart,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons'

// Utility functions for localStorage (for window settings only)
const WINDOW_STORAGE_KEY = 'ifoodWindowSettings'

const saveWindowSettings = (settings) => {
  try {
    localStorage.setItem(WINDOW_STORAGE_KEY, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('❌ Error saving window settings:', error)
    return false
  }
}

const loadWindowSettings = () => {
  try {
    const savedSettings = localStorage.getItem(WINDOW_STORAGE_KEY)
    if (savedSettings) {
      return JSON.parse(savedSettings)
    }
    return { width: 1200, height: 800 }
  } catch (error) {
    console.error('❌ Error loading window settings:', error)
    return { width: 1200, height: 800 }
  }
}

function IFoodHelper({ isReadOnly = false, sharedToolData = null }) {
  // Window settings (stored in localStorage for immediate access)
  const [windowSettings, setWindowSettings] = useState(() => loadWindowSettings())
  
  // Favorites data and loading state - use shared data if available
  const [favorites, setFavorites] = useState(() => {
    if (sharedToolData?.ifoodFavorites) {
      console.log('🍔 IFoodHelper using shared favorites:', sharedToolData.ifoodFavorites)
      return sharedToolData.ifoodFavorites
    }
    return []
  })
  
  const [favoriteDishes, setFavoriteDishes] = useState(() => {
    if (sharedToolData?.ifoodFavoriteDishes) {
      console.log('🍽️ IFoodHelper using shared dishes:', sharedToolData.ifoodFavoriteDishes)
      return sharedToolData.ifoodFavoriteDishes
    }
    return []
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // UI state
  const [popupWindow, setPopupWindow] = useState(null)
  const [isWindowOpen, setIsWindowOpen] = useState(false)
  const [showAddFavorite, setShowAddFavorite] = useState(false)
  const [showAddDish, setShowAddDish] = useState(false)
  const [newFavorite, setNewFavorite] = useState({ name: '', url: '' })
  const [newDish, setNewDish] = useState({ name: '', restaurant: '', description: '', url: '' })

  // Get authentication context
  const { user, isAuthenticated } = useAuth()

  // Load favorites from database or use shared data
  const loadFavorites = async () => {
    // If we have shared data, don't load from database
    if (sharedToolData) {
      console.log('🍔 Using shared tool data, skipping database load')
      setIsLoading(false)
      return
    }
    
    if (!isAuthenticated || !user) {
      console.log('🍔 User not authenticated, skipping load')
      setIsLoading(false)
      return
    }

    try {
      console.log('🍔 Loading favorites from database...')
      const userData = await cloudSync.loadUserData(user.uid)
      
      // Load favorite restaurants
      if (userData && userData.ifoodFavorites) {
        console.log('🍔 Favorite restaurants loaded:', userData.ifoodFavorites.length, 'items')
        setFavorites(userData.ifoodFavorites)
      }
      // Check for legacy data migration for restaurants
      else if (userData && userData.ifoodHelper && userData.ifoodHelper.favorites) {
        console.log('🔄 Migrating restaurant favorites from legacy location...')
        const legacyFavorites = userData.ifoodHelper.favorites
        setFavorites(legacyFavorites)
        
        // Save to new location
        await cloudSync.saveUserData(user.uid, { 
          ifoodFavorites: legacyFavorites
        })
        console.log('✅ Restaurant migration completed successfully')
      }
      else {
        console.log('🍔 No restaurant favorites found in database')
        setFavorites([])
      }

      // Load favorite dishes
      if (userData && userData.ifoodFavoriteDishes) {
        console.log('🍕 Favorite dishes loaded:', userData.ifoodFavoriteDishes.length, 'items')
        setFavoriteDishes(userData.ifoodFavoriteDishes)
      } else {
        console.log('🍕 No favorite dishes found in database')
        setFavoriteDishes([])
      }

      // Clean up old structure if migration happened
      if (userData && userData.ifoodHelper) {
        await cloudSync.saveUserData(user.uid, { 
          ifoodHelper: null // Clear the old structure
        })
        console.log('🧹 Cleaned up legacy data structure')
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error)
      setFavorites([])
      setFavoriteDishes([])
    } finally {
      setIsLoading(false)
    }
  }

  // Save favorites to database
  const saveFavorites = async (favoritesToSave) => {
    if (!isAuthenticated || !user) {
      console.log('🍔 User not authenticated, skipping save')
      return
    }

    try {
      console.log('🍔 Saving restaurant favorites to database:', favoritesToSave.length, 'items')
      await cloudSync.saveUserData(user.uid, { ifoodFavorites: favoritesToSave })
      console.log('✅ Restaurant favorites saved successfully')
    } catch (error) {
      console.error('❌ Error saving restaurant favorites:', error)
    }
  }

  // Save favorite dishes to database
  const saveFavoriteDishes = async (dishesToSave) => {
    if (!isAuthenticated || !user) {
      console.log('🍕 User not authenticated, skipping save')
      return
    }

    try {
      console.log('🍕 Saving favorite dishes to database:', dishesToSave.length, 'items')
      await cloudSync.saveUserData(user.uid, { ifoodFavoriteDishes: dishesToSave })
      console.log('✅ Favorite dishes saved successfully')
    } catch (error) {
      console.error('❌ Error saving favorite dishes:', error)
    }
  }

  // Load favorites when component mounts or user changes
  useEffect(() => {
    loadFavorites()
  }, [user, isAuthenticated])

  // Update favorites when shared data changes
  useEffect(() => {
    if (sharedToolData?.ifoodFavorites) {
      console.log('🍔 IFoodHelper updating with shared favorites:', sharedToolData.ifoodFavorites)
      setFavorites(sharedToolData.ifoodFavorites)
    }
    if (sharedToolData?.ifoodFavoriteDishes) {
      console.log('🍽️ IFoodHelper updating with shared dishes:', sharedToolData.ifoodFavoriteDishes)
      setFavoriteDishes(sharedToolData.ifoodFavoriteDishes)
    }
  }, [sharedToolData])

  // Save window settings to localStorage when they change
  useEffect(() => {
    saveWindowSettings(windowSettings)
  }, [windowSettings])

  // Check if the popup window is still open
  useEffect(() => {
    const checkWindowStatus = () => {
      if (popupWindow && popupWindow.closed) {
        setIsWindowOpen(false)
        setPopupWindow(null)
      }
    }

    if (popupWindow) {
      const interval = setInterval(checkWindowStatus, 1000)
      return () => clearInterval(interval)
    }
  }, [popupWindow])

  // Quick navigation URLs
  const quickLinks = [
    { name: 'Home', url: 'https://www.ifood.com.br', icon: faHome, description: 'iFood homepage' },
    { name: 'Delivery', url: 'https://www.ifood.com.br/delivery', icon: faSearch, description: 'Browse restaurants' },
    { name: 'My Orders', url: 'https://www.ifood.com.br/pedidos', icon: faShoppingCart, description: 'Order history' }
  ]

  const openIFoodPopup = (url = 'https://www.ifood.com.br') => {
    try {
      const { width, height } = windowSettings
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2

      const popup = window.open(
        url,
        'ifoodWindow',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=yes,status=no`
      )

      if (popup) {
        setPopupWindow(popup)
        setIsWindowOpen(true)
        popup.focus()
      } else {
        alert('⚠️ Não foi possível abrir o iFood. Verifique se o bloqueador de pop-ups está habilitado.')
      }
    } catch (error) {
      console.error('Erro ao abrir popup do iFood:', error)
      alert('❌ Erro ao abrir o iFood. Tente novamente.')
    }
  }

  const focusIFoodWindow = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.focus()
    } else {
      setIsWindowOpen(false)
      setPopupWindow(null)
    }
  }

  const closeIFoodWindow = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close()
    }
    setIsWindowOpen(false)
    setPopupWindow(null)
  }

  const addFavorite = async () => {
    if (isReadOnly) return // Don't allow adding in read-only mode
    
    if (newFavorite.name.trim() && newFavorite.url.trim()) {
      const newFavoriteItem = {
        id: Date.now(),
        name: newFavorite.name.trim(),
        url: newFavorite.url.trim(),
        createdAt: new Date().toISOString()
      }
      
      // Update local state
      const updatedFavorites = [...favorites, newFavoriteItem]
      setFavorites(updatedFavorites)
      
      // Save to database
      await saveFavorites(updatedFavorites)
      
      // Reset form
      setNewFavorite({ name: '', url: '' })
      setShowAddFavorite(false)
    }
  }

  const removeFavorite = async (id) => {
    if (isReadOnly) return // Don't allow removing in read-only mode
    
    // Update local state
    const updatedFavorites = favorites.filter(fav => fav.id !== id)
    setFavorites(updatedFavorites)
    
    // Save to database
    await saveFavorites(updatedFavorites)
  }

  const openFavorite = (url) => {
    openIFoodPopup(url)
  }

  // Extract restaurant identifier from iFood URL
  const extractRestaurantId = (url) => {
    if (!url) return null
    
    try {
      // Match iFood restaurant URL pattern
      // Example: https://www.ifood.com.br/delivery/cidade/restaurante-slug/restaurant-id
      const match = url.match(/\/delivery\/[^\/]+\/([^\/]+)\/([a-f0-9-]{36})/i)
      if (match) {
        const [, restaurantSlug, restaurantId] = match
        return { slug: restaurantSlug, id: restaurantId, fullId: `${restaurantSlug}/${restaurantId}` }
      }
      
      // Fallback: try to extract just the restaurant ID if present
      const idMatch = url.match(/\/([a-f0-9-]{36})/i)
      if (idMatch) {
        return { id: idMatch[1], fullId: idMatch[1] }
      }
      
      return null
    } catch (error) {
      console.warn('🍔 Error parsing restaurant URL:', url, error)
      return null
    }
  }

  // Group dishes by restaurant using URL matching
  const getDishesByRestaurant = () => {
    const restaurantDishes = {}
    
    // Group dishes by restaurant URL identifier
    favoriteDishes.forEach(dish => {
      const dishRestaurantId = extractRestaurantId(dish.url)
      let groupKey = 'Outros' // Default group for dishes without URL or unmatched
      
      if (dishRestaurantId) {
        // Try to find matching restaurant by URL
        const matchingRestaurant = favorites.find(fav => {
          const favRestaurantId = extractRestaurantId(fav.url)
          return favRestaurantId && favRestaurantId.fullId === dishRestaurantId.fullId
        })
        
        if (matchingRestaurant) {
          groupKey = matchingRestaurant.name
        } else {
          // Use restaurant name from dish if no URL match found
          groupKey = dish.restaurant || 'Outros'
        }
      } else {
        // Fallback to restaurant name matching for dishes without valid URLs
        groupKey = dish.restaurant || 'Outros'
      }
      
      if (!restaurantDishes[groupKey]) {
        restaurantDishes[groupKey] = []
      }
      restaurantDishes[groupKey].push(dish)
    })
    
    return restaurantDishes
  }

  // Add new favorite dish
  const addFavoriteDish = async () => {
    if (isReadOnly) return // Don't allow adding in read-only mode
    
    if (newDish.name.trim()) {
      // Extract restaurant info from URL if available
      let restaurantName = ''
      const dishRestaurantId = extractRestaurantId(newDish.url.trim())
      
      if (dishRestaurantId) {
        // Try to find matching restaurant by URL
        const matchingRestaurant = favorites.find(fav => {
          const favRestaurantId = extractRestaurantId(fav.url)
          return favRestaurantId && favRestaurantId.fullId === dishRestaurantId.fullId
        })
        
        if (matchingRestaurant) {
          restaurantName = matchingRestaurant.name
        } else {
          // Use the restaurant slug from URL as fallback
          restaurantName = dishRestaurantId.slug ? dishRestaurantId.slug.replace(/-+/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''
        }
      }
      
      const newDishItem = {
        id: Date.now(),
        name: newDish.name.trim(),
        restaurant: restaurantName,
        description: newDish.description.trim(),
        url: newDish.url.trim(),
        createdAt: new Date().toISOString()
      }
      
      // Update local state
      const updatedDishes = [...favoriteDishes, newDishItem]
      setFavoriteDishes(updatedDishes)
      
      // Save to database
      await saveFavoriteDishes(updatedDishes)
      
      // Reset form
      setNewDish({ name: '', restaurant: '', description: '', url: '' })
      setShowAddDish(false)
    }
  }

  // Remove favorite dish
  const removeFavoriteDish = async (id) => {
    if (isReadOnly) return // Don't allow removing in read-only mode
    
    // Update local state
    const updatedDishes = favoriteDishes.filter(dish => dish.id !== id)
    setFavoriteDishes(updatedDishes)
    
    // Save to database
    await saveFavoriteDishes(updatedDishes)
  }

  // Open dish URL or search for it
  const openFavoriteDish = (dish) => {
    if (dish.url && dish.url.trim()) {
      openIFoodPopup(dish.url)
    } else {
      // If no URL, search for the dish name + restaurant
      const searchQuery = encodeURIComponent(`${dish.name} ${dish.restaurant}`.trim())
      openIFoodPopup(`https://www.ifood.com.br/delivery?q=${searchQuery}`)
    }
  }

  return (
    <div className="ifood-helper">
      <div className="ifood-header">
        <FontAwesomeIcon icon={faUtensils} className="ifood-icon" />
        <h3>iFood Helper</h3>
      </div>

      <div className="ifood-content">
        <div className="quick-access-section">
          <h4>Acesso Rápido</h4>
          <div className="quick-access-buttons">
            <button
              className="quick-access-btn home"
              onClick={() => openIFoodPopup('https://www.ifood.com.br')}
              title="Abrir página inicial do iFood"
            >
              <FontAwesomeIcon icon={faHome} />
              <span>Início</span>
            </button>

            <button
              className="quick-access-btn delivery"
              onClick={() => openIFoodPopup('https://www.ifood.com.br/delivery')}
              title="Buscar por delivery"
            >
              <FontAwesomeIcon icon={faSearch} />
              <span>Delivery</span>
            </button>

            <button
              className="quick-access-btn orders"
              onClick={() => openIFoodPopup('https://www.ifood.com.br/pedidos')}
              title="Ver meus pedidos"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              <span>Pedidos</span>
            </button>
          </div>
        </div>

        {isWindowOpen && (
          <div className="window-controls">
            <h4>Controles da Janela</h4>
            <div className="window-control-buttons">
              <button
                className="control-btn focus"
                onClick={focusIFoodWindow}
                title="Focar na janela do iFood"
              >
                <FontAwesomeIcon icon={faWindowMaximize} />
                <span>Focar</span>
              </button>

              <button
                className="control-btn close"
                onClick={closeIFoodWindow}
                title="Fechar janela do iFood"
              >
                <FontAwesomeIcon icon={faTimes} />
                <span>Fechar</span>
              </button>
            </div>
          </div>
        )}

        <div className="favorites-section">
          <div className="favorites-header">
            <h4>Restaurantes e Pratos Favoritos</h4>
            {!isReadOnly && (
              <div className="action-buttons">
                <button
                  className="add-favorite-btn restaurant"
                  onClick={() => setShowAddFavorite(!showAddFavorite)}
                  title="Adicionar restaurante favorito"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Restaurante</span>
                </button>
                <button
                  className="add-dish-btn"
                  onClick={() => setShowAddDish(!showAddDish)}
                  title="Adicionar prato favorito"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Prato</span>
                </button>
              </div>
            )}
          </div>

          {showAddFavorite && (
            <div className="add-favorite-form">
              <input
                type="text"
                placeholder="Nome do restaurante"
                value={newFavorite.name}
                onChange={(e) => setNewFavorite({ ...newFavorite, name: e.target.value })}
                className="favorite-input"
              />
              <input
                type="url"
                placeholder="URL do restaurante (ex: https://www.ifood.com.br/delivery/...)"
                value={newFavorite.url}
                onChange={(e) => setNewFavorite({ ...newFavorite, url: e.target.value })}
                className="favorite-input"
              />
              <div className="form-buttons">
                <button onClick={addFavorite} className="save-btn">Salvar</button>
                <button onClick={() => setShowAddFavorite(false)} className="cancel-btn">Cancelar</button>
              </div>
            </div>
          )}

          {showAddDish && (
            <div className="add-dish-form">
              <input
                type="text"
                placeholder="Nome do prato"
                value={newDish.name}
                onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                className="dish-input"
              />
              <textarea
                placeholder="Descrição (opcional)"
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                className="dish-description"
              />
              <input
                type="url"
                placeholder="URL do prato (o restaurante será detectado automaticamente)"
                value={newDish.url}
                onChange={(e) => setNewDish({ ...newDish, url: e.target.value })}
                className="dish-input"
              />
              <div className="form-buttons">
                <button onClick={addFavoriteDish} className="save-btn">Salvar</button>
                <button onClick={() => setShowAddDish(false)} className="cancel-btn">Cancelar</button>
              </div>
            </div>
          )}

          <div className="favorites-list">
            {isLoading ? (
              <p className="no-favorites">Carregando favoritos...</p>
            ) : favorites.length === 0 && favoriteDishes.length === 0 ? (
              <p className="no-favorites">Nenhum favorito adicionado ainda.</p>
            ) : (
              <>
                {/* Render favorite restaurants */}
                {favorites.map(favorite => {
                  const favoriteRestaurantId = extractRestaurantId(favorite.url)
                  const restaurantDishes = favoriteDishes.filter(dish => {
                    const dishRestaurantId = extractRestaurantId(dish.url)
                    
                    // First try URL matching (most reliable)
                    if (favoriteRestaurantId && dishRestaurantId) {
                      return favoriteRestaurantId.fullId === dishRestaurantId.fullId
                    }
                    
                    // Fallback to name matching for dishes without URLs
                    return dish.restaurant && dish.restaurant.toLowerCase() === favorite.name.toLowerCase()
                  })
                  
                  return (
                    <div key={favorite.id} className="restaurant-group">
                      <div className="favorite-item restaurant">
                        <button
                          className="favorite-btn"
                          onClick={() => openFavorite(favorite.url)}
                          title={`Abrir ${favorite.name}`}
                        >
                          <FontAwesomeIcon icon={faHeart} />
                          <span>{favorite.name}</span>
                        </button>
                        {!isReadOnly && (
                          <button
                            className="remove-favorite-btn"
                            onClick={() => removeFavorite(favorite.id)}
                            title={`Remover ${favorite.name}`}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                      
                      {/* Render dishes for this restaurant */}
                      {restaurantDishes.length > 0 && (
                        <div className="restaurant-dishes">
                          {restaurantDishes.map(dish => (
                            <div key={dish.id} className="dish-item">
                              <div className="dish-info" onClick={() => openFavoriteDish(dish)}>
                                <h5 className="dish-name">{dish.name}</h5>
                                {dish.description && <p className="dish-description">{dish.description}</p>}
                              </div>
                              {!isReadOnly && (
                                <button
                                  className="remove-dish-btn"
                                  onClick={() => removeFavoriteDish(dish.id)}
                                  title={`Remover ${dish.name}`}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {/* Render dishes without a matching restaurant */}
                {(() => {
                  const orphanedDishes = favoriteDishes.filter(dish => {
                    const dishRestaurantId = extractRestaurantId(dish.url)
                    
                    const hasMatchingRestaurant = favorites.some(fav => {
                      const favRestaurantId = extractRestaurantId(fav.url)
                      
                      // First try URL matching
                      if (favRestaurantId && dishRestaurantId) {
                        return favRestaurantId.fullId === dishRestaurantId.fullId
                      }
                      
                      // Fallback to name matching
                      return dish.restaurant && fav.name.toLowerCase() === dish.restaurant.toLowerCase()
                    })
                    
                    return !hasMatchingRestaurant
                  })
                  
                  if (orphanedDishes.length > 0) {
                    return (
                      <div className="restaurant-group orphaned">
                        <div className="orphaned-header">
                          <h5>Outros Pratos</h5>
                        </div>
                        <div className="restaurant-dishes">
                          {orphanedDishes.map(dish => (
                            <div key={dish.id} className="dish-item">
                              <div className="dish-info" onClick={() => openFavoriteDish(dish)}>
                                <h5 className="dish-name">{dish.name}</h5>
                                {dish.restaurant && <p className="dish-restaurant">{dish.restaurant}</p>}
                                {dish.description && <p className="dish-description">{dish.description}</p>}
                              </div>
                              {!isReadOnly && (
                                <button
                                  className="remove-dish-btn"
                                  onClick={() => removeFavoriteDish(dish.id)}
                                  title={`Remover ${dish.name}`}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IFoodHelper
