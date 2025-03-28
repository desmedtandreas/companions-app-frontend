import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CompanyInfo() {
    const { enterprise_number } = useParams();
    const [companyInfo, setCompanyInfo] = useState(null);
    const [financialData, setFinancialData] = useState(null);

    const url = `${import.meta.env.VITE_API_URL}api/companies/${enterprise_number}/full/`;

    useEffect(() => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setCompanyInfo(data);
                setFinancialData(data.annual_accounts);
            })
            .catch(err => {
                console.error('Fetch error:', err);
            });
    }, [url]);

    if (!companyInfo || !financialData) {
        return <main><p>Loading...</p></main>;
    }

    return (
        <main>
            <h1>{companyInfo.name}</h1>
            <div className='company-info-container'>
                <h3>Bedrijfsinformatie</h3>
                <div className='company-info'>
                    <div className='info-columns'> 
                        <div>
                            <p className='info-title'>Ondernemingsnummer</p>
                            <p>{companyInfo.number}</p>
                            <p className='info-title'>Adres</p>
                            <p>{companyInfo.addresses[0].street} {companyInfo.addresses[0].house_number}
                                <br />
                                {companyInfo.addresses[0].postal_code} {companyInfo.addresses[0].city}</p>
                        </div>
                        <div>
                            <p className='info-title'>Status</p>
                            <p>{companyInfo.status}</p>
                            <p className='info-title'>Type</p>
                            <p>{companyInfo.type}</p>
                        </div>
                        <div>
                            <p className='info-title'>Oprichting</p>
                            <p>{companyInfo.start_date}</p>
                            <p className='info-title'>Website</p>
                            <p>www.company.be</p>
                        </div>
                    </div>
                    <div className='map-container'>
                        <h3>Maps Locatie?</h3>
                    </div>
                </div>
            </div>

            <div className="financial-data-container">
                <h3>Financieel</h3>
                <div className='table-container'>
                    <table>
                        <thead>
                            <tr>
                                <th>Einde Boekjaar</th>
                                <th>Activa</th>
                                <th>Winst</th>
                                <th>Schulden</th>
                                <th>Werknemers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financialData.map((account) => {
                                const rubrics = account.financial_rubrics;

                                if (!rubrics || rubrics.length === 0) {
                                    return null;
                                }

                                const activa = account.financial_rubrics.find(r => r.code === "21/28")?.value || "0";
                                const winst = account.financial_rubrics.find(r => r.code === "9901")?.value || "0";
                                const schulden = account.financial_rubrics.find(r => r.code === "17/49")?.value || "0";
                                const werknemers = account.financial_rubrics.find(r => r.code === "1001")?.value || "-"; // You can replace this with actual logic if available

                                return (
                                    <tr key={account.reference}>
                                        <td>{account.end_fiscal_year}</td>
                                        <td>€ {parseFloat(activa).toLocaleString('nl-BE')}</td>
                                        <td>€ {parseFloat(winst).toLocaleString('nl-BE')}</td>
                                        <td>€ {parseFloat(schulden).toLocaleString('nl-BE')}</td>
                                        <td>{werknemers} FTE</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}