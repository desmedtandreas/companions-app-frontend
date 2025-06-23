import Layout from '../components/Layout';

function Home() {
    return (
        <Layout>  
            <h1 className='text-4xl text-blue-950 font-medium text-center mt-40'>Welkom op de Companions App!</h1>
            <div className="flex items-center mt-10 space-x-4 justify-center">
                <button 
                    className="px-8 bg-blue-950 text-white rounded-full py-4 mt-10 hover:bg-blue-800 transition duration-300" 
                    onClick={() => window.location.href = '/heatmap'}
                >
                    Heatmap
                </button>
                <button 
                    className="px-8 bg-blue-950 text-white rounded-full py-4 mt-10 hover:bg-blue-800 transition duration-300" 
                    onClick={() => window.location.href = '/list-overview'}
                >
                    Lijsten
                </button>
                <button 
                    className="px-8 bg-blue-950 text-white rounded-full py-4 mt-10 hover:bg-blue-800 transition duration-300" 
                    onClick={() => window.location.href = '/maps-search'}
                >
                    Zoek in Maps
                </button>
                <button 
                    className="px-8 bg-blue-950 text-white rounded-full py-4 mt-10 hover:bg-blue-800 transition duration-300" 
                    onClick={() => window.location.href = '/company-search'}
                >
                    Zoek Bedrijf
                </button>
            </div>
        </Layout>
    );
}

export default Home;