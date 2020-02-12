import * as style from './_scss/style'

import { mapUVs } from './geometry';
import { decodeTerrainFromTile, generateTerrainGeometry } from './terrain';
import { fetchTerrainTile, makeSatelliteTexture } from './mapboxTiles';
import { MeshPhongMaterial, Mesh, DoubleSide, Camera } from 'three';
import { initThreeCanvasScene } from './threeSetup';
import mapboxgl, { CustomLayerInterface, LngLat } from "mapbox-gl";
import { slippyToCoords, coordsToSlippy, ISlippyCoords } from './util';

import * as THREE from 'three'
import { MapboxThreeLayer } from './MapboxThreeLayer';

export const mapboxToken = 'pk.eyJ1IjoiamVyemFrbSIsImEiOiJjangxaHF4MGcwN3ZqNGJubzl2Zzdva3N5In0.DRchXs3ESLUuoH9Kh_N-ow'

const location: ISlippyCoords = {
  zoom: 10,
  x: 906,
  y: 404
}

// runThreeExample()
runMapboxExample()

async function runThreeExample() {

  const tileImg = await fetchTerrainTile(location.zoom, location.x, location.y)

  const terrain:any = decodeTerrainFromTile(tileImg)

  //geometry width is +1 for better seaming
  const bufferGeometry = generateTerrainGeometry(terrain, tileImg.width+1)
  const geometry = mapUVs(bufferGeometry)

  const texture=  makeSatelliteTexture(location.zoom, location.x, location.y, true)

  const material = new MeshPhongMaterial({
    map: texture,
    // color: '#ffffff',
    // wireframe: true
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);

  const scene = initThreeCanvasScene()

  scene.add(mesh)
}

export async function createMesh(location: ISlippyCoords) {
  const tileImg = await fetchTerrainTile(location.zoom, location.x, location.y)

  const terrain:any = decodeTerrainFromTile(tileImg)

  //geometry width is +1 for better seaming
  const bufferGeometry = generateTerrainGeometry(terrain, tileImg.width+1)
  const geometry = mapUVs(bufferGeometry)

  const texture=  makeSatelliteTexture(location.zoom, location.x, location.y, true)

  const material = new MeshPhongMaterial({
    map: texture,
    // color: '#ffffff',
    // wireframe: true,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);

  return mesh
}

async function runMapboxExample() {
  // based on https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/

  const coords = slippyToCoords(location.x, location.y, location.zoom)
  const latLng = new LngLat(coords[0], coords[1])

  mapboxgl.accessToken = 'pk.eyJ1IjoiamVyemFrbSIsImEiOiJjangxaHF4MGcwN3ZqNGJubzl2Zzdva3N5In0.DRchXs3ESLUuoH9Kh_N-ow';

  const container = document.createElement('div')
  container.style.width = '100vw'
  container.style.height = '100vh'
  document.body.appendChild(container)

  const mesh = await createMesh(location)


  const map = new mapboxgl.Map({
    container: container,
    style: 'mapbox://styles/mapbox/light-v10'
  });
  map.setZoom(8);
  map.setCenter(latLng);

  const location2: ISlippyCoords = {
    zoom: 10,
    x: 905,
    y: 404
  }

  map.on('style.load', async function() {
    const testLayer = new MapboxThreeLayer(map, mesh, latLng)
    map.addLayer(testLayer, 'waterway-label')
    const mesh2 = await createMesh(location2)
    testLayer.addTile(mesh2, location2, 256)
  let toggled = true
    window.addEventListener('click', async ()=> {
      if(toggled){
        // map.removeLayer('3d-model')
        toggled= false
      } else {
        // map.addLayer(customLayer, 'waterway-label');
        toggled = true
      }
    })
  });
}