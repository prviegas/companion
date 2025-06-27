import { useState, useEffect } from 'react'
import './IFoodHelper.css'
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

// Utility functions for localStorage
const STORAGE_KEY = 'ifoodHelperData'

const saveDataToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('🍔 iFood data saved successfully')
    return true
  } catch (error) {
    console.error('❌ Error saving iFood data:', error)
    return false
  }
}

const loadDataFromStorage = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      console.log('🍔 iFood data loaded successfully')
      return parsedData
    }
    console.log('🍔 No saved iFood data found')
    return {
      windowPosition: { width: 1200, height: 800 },
      favorites: []
    }
  } catch (error) {
    console.error('❌ Error loading iFood data:', error)
    return {
      windowPosition: { width: 1200, height: 800 },
      favorites: []
    }
  }
}

function IFoodHelper() {
  const [data, setData] = useState(() => {
    const loadedData = loadDataFromStorage()
    // Ensure windowPosition and favorites exist with default values
    return {
      ...loadedData,
      windowPosition: loadedData.windowPosition || { width: 1200, height: 800 },
      favorites: loadedData.favorites || []
    }
  })
  const [popupWindow, setPopupWindow] = useState(null)
  const [isWindowOpen, setIsWindowOpen] = useState(false)
  const [showAddFavorite, setShowAddFavorite] = useState(false)
  const [newFavorite, setNewFavorite] = useState({ name: '', url: '' })

  // Save data to localStorage whenever data changes
  useEffect(() => {
    saveDataToStorage(data)
  }, [data])

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
      const { width, height } = data.windowPosition
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

  const addFavorite = () => {
    if (newFavorite.name.trim() && newFavorite.url.trim()) {
      const updatedData = {
        ...data,
        favorites: [...data.favorites, { ...newFavorite, id: Date.now() }]
      }
      setData(updatedData)
      setNewFavorite({ name: '', url: '' })
      setShowAddFavorite(false)
    }
  }

  const removeFavorite = (id) => {
    const updatedData = {
      ...data,
      favorites: data.favorites.filter(fav => fav.id !== id)
    }
    setData(updatedData)
  }

  const openFavorite = (url) => {
    openIFoodPopup(url)
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
            <h4>Favoritos</h4>
            <button
              className="add-favorite-btn"
              onClick={() => setShowAddFavorite(!showAddFavorite)}
              title="Adicionar restaurante favorito"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
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

          <div className="favorites-list">
            {data.favorites.length === 0 ? (
              <p className="no-favorites">Nenhum favorito adicionado ainda.</p>
            ) : (
              data.favorites.map(favorite => (
                <div key={favorite.id} className="favorite-item">
                  <button
                    className="favorite-btn"
                    onClick={() => openFavorite(favorite.url)}
                    title={`Abrir ${favorite.name}`}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    <span>{favorite.name}</span>
                  </button>
                  <button
                    className="remove-favorite-btn"
                    onClick={() => removeFavorite(favorite.id)}
                    title={`Remover ${favorite.name}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IFoodHelper
