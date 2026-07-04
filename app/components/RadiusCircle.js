"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export default function RadiusCircle({ center, radiusMeters }) {
  const map = useMap();
  const circleRef = useRef(null);

  useEffect(() => {
    if (!map || !center) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        center,
        radius: radiusMeters,
        strokeColor: "#cc785c",
        strokeOpacity: 0.6,
        strokeWeight: 2,
        fillColor: "#cc785c",
        fillOpacity: 0.12,
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusMeters);
    }

    return () => {
      if (!center) {
        circleRef.current?.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center, radiusMeters]);

  useEffect(() => {
    return () => {
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
  }, [map]);

  return null;
}
