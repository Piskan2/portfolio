import ReplSkin from './skins/repl/ReplSkin'

/**
 * REPL is the only design. The shell renders it full-screen — no theme picker,
 * no hash routing to other concepts. Any hash (or none) shows this skin.
 */
export default function App() {
  return <ReplSkin />
}
