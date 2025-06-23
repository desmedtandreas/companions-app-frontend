import React, { use, useEffect, useState, useCallback } from 'react';
import { 
  GoogleMap, 
  LoadScript, 
  Polygon,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { scaleLinear } from 'd3-scale';

const containerStyle = { width: '100%', height: '800px' };
const mapCenter = { lat: 50.5, lng: 4.5 };

type Company = {
  name: string;
  address: string
  valueChain: string;
};

type Props = {
  scoreMap: Record<string, number>;
  companies: Company[];
  selectedCompanyIndex: number | null;
  onCompanySelect: (index: number | null) => void;
};

type MarkerInfo = {
  position : google.maps.LatLngLiteral;
  company: Company;
  companyIndex: number;
};

const BelgiumMap: React.FC<Props> = ({ scoreMap, companies, selectedCompanyIndex, onCompanySelect }) => {
  const [features, setFeatures] = useState<any[]>([]);
  const [colorScale, setColorScale] = useState<(v: number) => string>(
    () => () => 'rgba(200,200,200,0.4)'
  );
  const [markers, setMarkers] = useState<MarkerInfo[]>([]);
  const [infoOpen, setInfoOpen] = useState<number | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    fetch('/municipalities.geojson')
      .then((r) => r.json())
      .then((data) => setFeatures(data.features));
  }, []);

  useEffect(() => {
    const vals = Object.values(scoreMap);
    if (!vals.length) return;

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const mid = (min + max) / 2;

    const scale = scaleLinear<string>()
      .domain([min, mid, max])
      .range(['red', 'orange', 'green']);

    setColorScale(() => (v: number) => scale(v));
  }, [scoreMap]);

  useEffect(() => {
    if (!companies.length) return;
    const geocoder = new window.google.maps.Geocoder();
    Promise.all(
      companies.map((c, i) =>
        new Promise<MarkerInfo | null>((resolve) =>
          geocoder.geocode({ address: c.address }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const pos = results[0].geometry.location;
              resolve({
                position: { lat: pos.lat(), lng: pos.lng() },
                company: c,
                companyIndex: i,
              });
            } else {
              console.warn(`Geocode failed for ${c.address}: ${status}`);
              resolve(null);
            }
          })
        )
      )
    ).then((res) => {
      setMarkers(res.filter((m): m is MarkerInfo => m !== null));
    });
  }, [companies]);

  const handleMapLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  useEffect(() => {
    if (
      selectedCompanyIndex == null ||
      !map ||
      !markers.length
    ) return;

    // find the marker that has this companyIndex
    const m = markers.find(x => x.companyIndex === selectedCompanyIndex);
    if (!m) return;

    // open that InfoWindow
    setInfoOpen(m.companyIndex);

    // pan & zoom
    map.panTo(m.position);
    map.setZoom(10);

  }, [ selectedCompanyIndex, map, markers ]);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={8.1}
        onLoad={handleMapLoad}
      >
        {features.map((feat, i) => {
          const polys =
            feat.geometry.type === 'MultiPolygon'
              ? feat.geometry.coordinates.flat()
              : feat.geometry.coordinates;

          // lookup on your Gemeente property
          const name = feat.properties.mun_name_nl;
          const score = scoreMap[name];
          // if missing, grey-out
          const fillColor =
            score != null ? colorScale(score) : 'rgba(200,200,200,0.4)';

          return polys.map((coords: any[], j: number) => (
            <Polygon
              key={`poly-${i}-${j}`}
              paths={coords.map((c) => ({ lat: c[1], lng: c[0] }))}
              options={{
                fillColor,
                fillOpacity: 0.6,
                strokeColor: '#000',
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          ));
        })}

        {markers.map((marker) => (
          <Marker
            key={marker.companyIndex}
            position={marker.position}
            onClick={() => {
              onCompanySelect(marker.companyIndex);
              setInfoOpen(marker.companyIndex);
            }}
          >
            {infoOpen === marker.companyIndex && (
              <InfoWindow
                position={marker.position}
                onCloseClick={() => setInfoOpen(null)}
              >
                <div>
                  <h3>{marker.company.name}</h3>
                  <p>{marker.company.address}</p>
                  <p>Value Chain: {marker.company.valueChain}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default BelgiumMap;
