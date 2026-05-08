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
  latitude?: number;
  longitude?: number;

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

function CurrentLocationButton({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const customControl = L.Control.extend({
      options: {
        position: "topright",
      },

      onAdd: function () {
        const button = L.DomUtil.create(
          "button",
          "leaflet-bar leaflet-control"
        );

        button.innerHTML = "📍";
        button.title = "Use current location";

        button.style.backgroundColor = "white";
        button.style.width = "34px";
        button.style.height = "34px";
        button.style.cursor = "pointer";
        button.style.fontSize = "18px";

        L.DomEvent.disableClickPropagation(button);

        L.DomEvent.on(button, "click", () => {
          if (!navigator.geolocation) {
            alert("Geolocation is not supported");
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              map.setView([lat, lng], 15);

              onChange(lat, lng);
            },
            () => {
              alert("Unable to fetch location");
            }
          );
        });

        return button;
      },
    });

    const control = new customControl();

    map.addControl(control);

    return () => {
      map.removeControl(control);
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

 if (latitude == null || longitude == null) {
  return null;
}

return <Marker position={[latitude, longitude]} />;
}


export default function MapPicker({
  latitude,
  longitude,
  onChange,
}: Props) {

const defaultCenter: [number, number] = [
  latitude ?? 20.5937,
  longitude ?? 78.9629,
];
  return (
    <MapContainer
        center={defaultCenter}
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

      <CurrentLocationButton onChange={onChange} />

      <LocationMarker
        latitude={latitude}
        longitude={longitude}
        onChange={onChange}
      />
    </MapContainer>
  );
}