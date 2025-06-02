import { GameScene } from './components/GameScene';
import { GameUI } from './components/GameUI';

function App() {
  return (
    <div className="w-full h-screen relative">
      <GameScene />
      <GameUI />
    </div>
  );
}

export default App;