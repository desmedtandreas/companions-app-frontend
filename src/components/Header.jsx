
export default function Header() {
    return (
        <header>
            <h1 onClick={() => window.location.href = '/'}>
                Companions App
            </h1>
            <nav>
                <ul>
                    <li onClick={() => window.location.href = '/maps-search'}>Zoek in Maps</li>
                    <li onClick={() => window.location.href = '/company-search'}>Zoek Bedrijf</li>
                </ul>
            </nav>
        </header>
    )
}
