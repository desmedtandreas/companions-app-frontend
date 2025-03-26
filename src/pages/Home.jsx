import Header from '../components/Header.jsx';
import './css/Home.css';

export default function Home() {
    return (
        <>  
            <Header />
            <main>
                <h1 className='welcome'>Welkom op de Companions App!</h1>
                <div className="home-button-container">
                    <button 
                        className="home-button" 
                        onClick={() => window.location.href = '/maps-search'}
                    >
                        Zoek in Maps
                    </button>
                    <button 
                        className="home-button" 
                        onClick={() => window.location.href = '/company-search'}
                    >
                        Zoek Bedrijf
                    </button>
                </div>
            </main>
        </>
    );
}