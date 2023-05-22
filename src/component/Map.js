//call a GeoServer WMS service and display ther result on a map using leaflet library

import React, {Component,useState, useEffect} from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import axios from 'axios';
import xml2js from 'xml2js';
import 'leaflet/dist/leaflet.css';

const geoserverUrl = 'http://localhost:8080/geoserver';
const layerName = 'topp:states';

const parseXmlResponse = (xml) => {
    return new Promise((resolve, reject) => {
      const parser = new xml2js.Parser();
      parser.parseString(xml, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

const findLayerByName = (capabilities, name) => {
    for (const layer of capabilities.Capability.Layer.Layer) {
      if (layer.Name[0] === name) {
        return layer;
      }
    }
    return null;
};

const Map = () => {
    const [map, setMap] = useState(null);
  
    useEffect(() => {
      if (!map) {
        // Create a new Leaflet map instance
        const newMap = L.map('map').setView([39.5, -98.35], 4);
  
        // Add the OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(newMap);
  
        // Call the GetCapabilities endpoint of the GeoServer WMS service
        axios.get(`${geoserverUrl}/wms`, {
          params: {
            service: 'WMS',
            version: '1.3.0',
            request: 'GetCapabilities',
          },
        })
        .then(response => {
          // Parse the XML response into an object using xml2js
          return parseXmlResponse(response.data);
        })
        .then(capabilities => {
          // Find the layer you want to add to the map
          const layer = findLayerByName(capabilities, layerName);
  
          if (!layer) {
            throw new Error(`Layer ${layerName} not found in GetCapabilities response`);
          }
  
          // Add the layer to the map as a WMS overlay
          L.tileLayer.wms(`${geoserverUrl}/wms`, {
            layers: layerName,
            format: 'image/png',
            transparent: true,
          }).addTo(newMap);
        })
        .catch(error => {
          console.error(error);
        });
  
        setMap(newMap);
      }
  
      return () => {
        // Clean up the map instance when the component unmounts
        map.remove();
      };
    }, [map]);
  
    return (
      <div id="map" style={{ height: '100vh' }} />
    );
  };

export default Map;
