
export default function CompanyInfo() {
    return (
        <main>
            <h1>Company Name</h1>
            <div className='company-info-container'>
                <h3>Bedrijfsinformatie</h3>
                <div className='company-info'>
                    <div>
                        <div>
                            <p className='info-title'>Ondernemingsnummer</p>
                            <p>0449.345.471</p>
                            <p className='info-title'>Adres</p>
                            <p>Volhardingstraat 86<br />2020 Antwerpen</p>
                        </div>
                        <div>
                            <p className='info-title'>Status</p>
                            <p>Active</p>
                            <p class='info-title'>Type</p>
                            <p>Rechtspersoon</p>
                        </div>
                        <div>
                            <p className='info-title'>Oprichting</p>
                            <p>01/01/2025</p>
                            <p className='info-title'>Website</p>
                            <p>www.company.be</p>
                        </div>
                    </div>
                    <div className='map-container'>
                        <h3>Maps Locatie?</h3>
                    </div>
                </div>
            </div>

            
        </main>
    );
}