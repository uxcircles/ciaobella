/* Ciao Bella map: MapLibre + OpenFreeMap vector tiles (OpenStreetMap data), coloured like the restaurant:
   cream paper, tablecloth blue, the awning's royal blue and gold. Loaded on demand by main.js after
   maplibre-gl.js. Positions and walking routes come from the #map-data JSON on the page. */
(function () {
  var C = {
    land: '#F7F1E6',        // cream
    building: '#EFE5D3',
    buildingLine: '#E2D4BC',
    park: '#DCE6D2',
    water: '#CFDDEB',       // tablecloth blue
    road: '#FFFCF6',
    roadCase: '#E4D8C4',
    major: '#FFFCF6',
    majorCase: '#CDBB9C',
    path: '#D8CAB0',
    rail: '#CBBEA6',
    label: '#4A423B',
    labelSoft: '#8C8070',
    halo: '#F7F1E6',
    awning: '#1F3C8C',
    tomato: '#C8321F',
    gold: '#E6C36A'
  };

  var name = ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']];
  var width = function (a, b, c) { return ['interpolate', ['exponential', 1.6], ['zoom'], 14, a, 16, b, 18, c]; };
  var major = ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary'], true, false];
  var minor = ['match', ['get', 'class'], ['tertiary', 'minor', 'service', 'street', 'residential', 'living_street', 'pedestrian'], true, false];

  function style(routes) {
    return {
      version: 8,
      glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      sources: {
        omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
        routes: { type: 'geojson', data: routes }
      },
      layers: [
        { id: 'land', type: 'background', paint: { 'background-color': C.land } },
        { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': C.park } },
        {
          id: 'green', type: 'fill', source: 'omt', 'source-layer': 'landuse',
          filter: ['match', ['get', 'class'], ['park', 'grass', 'cemetery', 'pitch', 'playground', 'garden'], true, false],
          paint: { 'fill-color': C.park }
        },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.water } },
        {
          id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14,
          paint: { 'fill-color': C.building, 'fill-outline-color': C.buildingLine }
        },
        {
          id: 'path', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 15,
          filter: ['match', ['get', 'class'], ['path', 'track'], true, false],
          paint: { 'line-color': C.path, 'line-width': 1.2, 'line-dasharray': [2, 1.5] }
        },
        {
          id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation',
          filter: ['match', ['get', 'class'], ['rail', 'transit'], true, false],
          paint: { 'line-color': C.rail, 'line-width': 1.2, 'line-dasharray': [3, 2] }
        },
        {
          id: 'road-case', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: minor,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': C.roadCase, 'line-width': width(2.5, 7, 22) }
        },
        {
          id: 'major-case', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: major,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': C.majorCase, 'line-width': width(4, 11, 32) }
        },
        {
          id: 'road', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: minor,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': C.road, 'line-width': width(1.5, 5, 18) }
        },
        {
          id: 'major', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: major,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': C.major, 'line-width': width(2.5, 8.5, 28) }
        },
        // Lamb's Conduit Street itself, in the awning's blue
        {
          id: 'home-street', type: 'line', source: 'omt', 'source-layer': 'transportation',
          filter: ['==', ['get', 'name'], 'Lamb\'s Conduit Street'],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': C.awning, 'line-opacity': 0.14, 'line-width': width(3, 9, 26) }
        },
        { id: 'route-case', type: 'line', source: 'routes', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.road, 'line-width': 6 } },
        {
          id: 'route', type: 'line', source: 'routes', layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': ['get', 'color'], 'line-width': 3, 'line-dasharray': [0.6, 2] }
        },
        {
          id: 'park-label', type: 'symbol', source: 'omt', 'source-layer': 'poi', minzoom: 15,
          filter: ['match', ['get', 'class'], ['park'], true, false],
          layout: { 'text-field': name, 'text-font': ['Noto Sans Italic'], 'text-size': 11, 'text-max-width': 7 },
          paint: { 'text-color': '#5F7A57', 'text-halo-color': C.halo, 'text-halo-width': 1.4 }
        },
        {
          id: 'road-label', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 15,
          layout: {
            'symbol-placement': 'line', 'text-field': ['upcase', name], 'text-font': ['Noto Sans Regular'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 15, 9, 18, 12], 'text-letter-spacing': 0.12
          },
          paint: {
            'text-color': ['case', ['==', ['get', 'name'], 'Lamb\'s Conduit Street'], C.awning, C.labelSoft],
            'text-halo-color': C.halo, 'text-halo-width': 1.5
          }
        }
      ]
    };
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    node.className = className;
    if (html) node.innerHTML = html;
    return node;
  }

  window.ciaoBellaMap = function (container, data) {
    var maplibregl = window.maplibregl;
    var home = [data.home.lng, data.home.lat];
    var routes = {
      type: 'FeatureCollection',
      features: data.routes.map(function (r) {
        return { type: 'Feature', properties: { color: C[r.color] || C.awning }, geometry: { type: 'LineString', coordinates: r.path } };
      })
    };

    var narrow = container.clientWidth < 520;
    var map = new maplibregl.Map({
      container: container,
      style: style(routes),
      center: home,
      zoom: 16,
      maxZoom: 19,
      minZoom: 13,
      pitchWithRotate: false,
      dragRotate: false,
      cooperativeGestures: true, // the page scrolls normally; two fingers (or Ctrl/⌘ + wheel) move the map
      attributionControl: { compact: true },
      locale: data.locale || {}
    });
    map.touchZoomRotate.disableRotation();
    // phones pinch to zoom, so the +/- buttons would only cover the map
    if (!narrow) map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
    // keep the attribution folded into its (i) button until tapped
    map.once('load', function () {
      var attrib = container.querySelector('.maplibregl-ctrl-attrib');
      if (attrib) attrib.classList.remove('maplibregl-compact-show');
    });

    data.tubes.forEach(function (t) {
      // on phones Russell Square is too close to the pin for a side label, so its name goes underneath
      var below = narrow && t.labelBelow;
      new maplibregl.Marker({ element: el('div', 'map-tube' + (below ? ' label-below' : ''), '<span class="roundel"></span><span class="tube-name">' + t.name + '<small>' + t.walk + '</small></span>'), anchor: below ? 'top-left' : 'left', offset: below ? [-12, -12] : [-12, 0] }) // roundel (24px) centred on the station
        .setLngLat([t.lng, t.lat]).addTo(map);
    });
    // The Lamb sits two doors along: below-left of the pin, or below-right on phones where Russell Square's name is
    new maplibregl.Marker({ element: el('div', 'map-pub' + (narrow ? ' pub-right' : ''), '<span class="pub-name">' + data.pub.name + '</span><span class="pub-dot"></span>'), anchor: narrow ? 'left' : 'right', offset: narrow ? [12, 30] : [-6, 30] })
      .setLngLat([data.pub.lng, data.pub.lat]).addTo(map);
    new maplibregl.Marker({ element: el('div', 'map-home', '<span class="pin">CB</span><span class="pin-label">Ciao Bella<small>' + data.home.note + '</small></span>'), anchor: 'left', offset: [-22, 0] })
      .setLngLat(home).addTo(map);

    // frame the restaurant and both stations; refit when the box changes size, until someone moves the map
    var bounds = new maplibregl.LngLatBounds(home, home);
    data.tubes.forEach(function (t) { bounds.extend([t.lng, t.lat]); });
    var touched = false;
    function fit() {
      if (touched) return;
      var w = container.clientWidth;
      var pad = w < 400 ? { top: 56, bottom: 56, left: 30, right: 140 }
              : w < 520 ? { top: 60, bottom: 60, left: 40, right: 120 }
              : { top: 60, bottom: 60, left: 70, right: 180 };
      map.fitBounds(bounds, { padding: pad, duration: 0 });
    }
    fit();
    map.once('load', fit);
    map.on('dragstart', function (e) { if (e.originalEvent) touched = true; });
    map.on('zoomstart', function (e) { if (e.originalEvent) touched = true; });
    if ('ResizeObserver' in window) new ResizeObserver(function () { map.resize(); fit(); }).observe(container);
    return map;
  };
})();
