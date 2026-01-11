import CellCounter from './components/CellCounter'

export default function Home() {
  return (
    <main className="container">
      <header className="header">
        <h1>CellCount</h1>
        <p>An app to help pathologists calculate cells in medical images</p>
      </header>
      <CellCounter />
    </main>
  )
}
