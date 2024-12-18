import { BrowserRouter, Route, Routes } from "react-router-dom"
import { KanbanBoard } from "./components/views/KanbanBoard"

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<KanbanBoard />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App