function Header() {
    return (
      <header className="bg-[#21284f] py-6 text-white w-full">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-10">
          <h1 
            className="m-0 text-2xl font-bold cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            Companions App
          </h1>
          <nav>
            <ul className="flex space-x-5">
              <li 
                className="px-5 py-3 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer"
                onClick={() => window.location.href = '/list-overview'}
              >
                Lijsten
              </li>
              <li 
                className="px-5 py-3 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer"
                onClick={() => window.location.href = '/maps-search'}
              >
                Zoek in Maps
              </li>
              <li 
                className="px-5 py-3 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer"
                onClick={() => window.location.href = '/company-search'}
              >
                Zoek Bedrijf
              </li>
            </ul>
          </nav>
        </div>
      </header>
    );
  }
  
  export default Header;