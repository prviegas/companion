import { useState, useEffect } from 'react'
import './App.css'
import MainGrid from './components/MainGrid'
import ToolSelector from './components/ToolSelector'
import Header from './components/Header'

// Utility functions for localStorage
const STORAGE_KEY = 'companionTools'

const saveToolsToStorage = (tools) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools))
    console.log('✅ Tools saved successfully:', tools)
    return true
  } catch (error) {
    console.error('❌ Error saving tools:', error)
    return false
  }
}

const loadToolsFromStorage = () => {
  try {
    const savedTools = localStorage.getItem(STORAGE_KEY)
    if (savedTools) {
      const parsedTools = JSON.parse(savedTools)
      console.log('✅ Tools loaded successfully:', parsedTools)
      return parsedTools
    }
    console.log('ℹ️ No saved tools found')
    return []
  } catch (error) {
    console.error('❌ Error loading tools:', error)
    return []
  }
}

function App() {
  const [selectedTools, setSelectedTools] = useState(() => loadToolsFromStorage())
  const [isSelectingTools, setIsSelectingTools] = useState(false)

  // Save tools to localStorage whenever selectedTools changes
  useEffect(() => {
    saveToolsToStorage(selectedTools)
  }, [selectedTools])

  const addTool = (tool) => {
    if (!selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools([...selectedTools, tool])
    }
  }

  const removeTool = (toolId) => {
    setSelectedTools(selectedTools.filter(tool => tool.id !== toolId))
  }

  return (
    <div className="app">
      <Header 
        onToggleToolSelector={() => setIsSelectingTools(!isSelectingTools)}
        isSelectingTools={isSelectingTools}
        selectedTools={selectedTools}
        onAddTool={addTool}
        onCloseToolSelector={() => setIsSelectingTools(false)}
      />
      
      <MainGrid 
        tools={selectedTools}
        onRemoveTool={removeTool}
      />
    </div>
  )
}

export default App
