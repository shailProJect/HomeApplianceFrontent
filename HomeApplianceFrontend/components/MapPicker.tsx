"use client";

import { useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "leaflet-control-geocoder/dist/Control.Geocoder.css";

import "leaflet-control-geocoder";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  latitude: number;
  longitude: number;

  onChange: (lat: number, lng: number) => void;
};

function SearchControl({ onChange }: Props) {
  const map = useMap();

 useEffect(() => {
  const geocoder = (L.Control as any)
    .geocoder({
      defaultMarkGeocode: false,
    })

    .on("markgeocode", function (e: any) {
      const latlng = e.geocode.center;

      map.setView(latlng, 15);

      onChange(latlng.lat, latlng.lng);
    })

    .addTo(map);

  return () => {
    map.removeControl(geocoder);
  };
}, [map, onChange]);

  return null;
}

function LocationMarker({
  latitude,
  longitude,
  onChange,
}: Props) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={[latitude, longitude]} />;
}

export default function MapPicker({
  latitude,
  longitude,
  onChange,
}: Props) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[350px] w-full rounded-xl z-0"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SearchControl
        latitude={latitude}
        longitude={longitude}
        onChange={onChange}
      />

      <LocationMarker
        latitude={latitude}
        longitude={longitude}
        onChange={onChange}
      />
    </MapContainer>
  );
}