let map;
let markerObj = {
  all: [],
  help: [],
};
let currentStatus = 'all';

// setup map
(async () => {
  // eslint-disable-next-line no-undef
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWVuZ3BlaWwiLCJhIjoiY2xhenZ5dHVwMWR4dzNxbng4Z3l3c3dqaiJ9.OnrG25iHMFoWdaj-_-rKGQ';

  // get geolocation
  if (navigator.geolocation) {
    await navigator.geolocation.getCurrentPosition((position) => {
      // eslint-disable-next-line no-undef
      map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: [position.coords.longitude, position.coords.latitude], // starting position [lng, lat]
        zoom: 16,
      });
      setUserCurrentLocation();
      addPolygon();
      addMarker();
    });
  } else {
    // if geolocation is not available, set default location to be the center of the map
    // mountain view caltrain
    // eslint-disable-next-line no-undef
    map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
      center: [-122.07609124594812, 37.39474832613709], // starting position [lng, lat]
      zoom: 16,
    });
    setUserCurrentLocation();
    addPolygon();
    addMarker();
  }
})();

const setUserCurrentLocation = () => {
  // user current location
  // eslint-disable-next-line no-undef
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  });

  map.addControl(geolocate, 'bottom-right');
};

const addMarker = async () => {
  // eslint-disable-next-line no-undef
  const token = getCookie('token');
  // eslint-disable-next-line no-undef
  const url = `${API_URL}/map`;
  // eslint-disable-next-line no-undef
  const currentUser = getCookie('currentUser');
  // eslint-disable-next-line no-undef
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      data.markers.forEach((marker) => {
        const {username, longitude, latitude, status} = marker;
        // make a marker for each feature and add to the map
        // eslint-disable-next-line no-undef
        const popup = new mapboxgl.Popup({offset: 25}).setText(
          status === 'help'
            ? `${username} needs ${status}`
            : `${username}'s status is ${status}`,
        );
        // add marker to map
        // eslint-disable-next-line no-undef
        const oneMarker = new mapboxgl.Marker({
          color: status === 'help' ? '#FF002E' : '#262424',
        })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map);
        // addEventListener when the marker doesn't belong to currentUser
        if (username != currentUser) {
          // add click event
          oneMarker.getElement().addEventListener('click', () => {
            createChatroom(username);
          });
        }
        // classify marker
        if (status === 'help') markerObj['help'].push(oneMarker);
        markerObj['all'].push(oneMarker);
      });
    })
    .catch((err) => {
      alert(err.response.data.messages);
    });
};

const addPolygon = () => {
  map.on('load', () => {
    // eslint-disable-next-line no-undef
    sfHazardZoneData.features.forEach((data) => {
      const {properties, geometry} = data;
      // Add a data source containing GeoJSON data.
      map.addSource(properties.id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            // These coordinates outline Maine.
            coordinates: geometry.coordinates[0],
          },
        },
      });
      // Add a new layer to visualize the polygon.
      map.addLayer({
        id: properties.id,
        type: 'fill',
        source: properties.id, // reference the data source
        layout: {},
        paint: {
          'fill-color': '#0080ff', // blue color fill
          'fill-opacity': 0.5,
        },
      });
      // Add a black outline around the polygon.
      map.addLayer({
        id: `${properties.id}-outline`,
        type: 'line',
        source: properties.id,
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 3,
        },
      });
    });
  });
};

// eslint-disable-next-line no-unused-vars
const reportLocation = async () => {
  // eslint-disable-next-line no-undef
  const token = getCookie('token');
  // eslint-disable-next-line no-undef
  const username = getCookie('currentUser');
  // eslint-disable-next-line no-undef
  const status = getCookie('status');
  // eslint-disable-next-line no-undef
  const url = `${API_URL}/map`;
  const body = {
    username,
    // eslint-disable-next-line no-undef
    longitude: userLongitude,
    // eslint-disable-next-line no-undef
    latitude: userLatitude,
    status: status ? status : 'ok',
  };
  // eslint-disable-next-line no-undef
  await axios
    // eslint-disable-next-line no-undef
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then(() => {
      alert('report success');
      window.location.reload();
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

// eslint-disable-next-line no-unused-vars
const filterMarker = () => {
  const ele = document.getElementById('filter');
  if (currentStatus === 'all') {
    // remove previous marker
    markerObj['all'].forEach((marker) => {
      marker.remove();
    });

    // add markers
    markerObj['help'].forEach((marker) => {
      marker.addTo(map);
    });

    currentStatus = 'help';
    ele.style.background = '#FF002E';
    ele.innerText = 'Help';
  } else {
    markerObj['help'].forEach((marker) => {
      marker.remove();
    });

    // add markers
    markerObj['all'].forEach((marker) => {
      marker.addTo(map);
    });

    currentStatus = 'all';
    ele.style.background = '#262424';
    ele.innerText = 'All';
  }
};

const createChatroom = async (receiver) => {
  // eslint-disable-next-line no-undef
  const url = `${API_URL}/messages/private/chatrooms`;
  // eslint-disable-next-line no-undef
  const currentUsername = getCookie('currentUser');
  // eslint-disable-next-line no-undef
  const token = getCookie('token');
  const body = {
    sender_name: currentUsername,
    receiver_name: receiver,
  };

  // eslint-disable-next-line no-undef
  await axios
    // eslint-disable-next-line no-undef
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      const receiver = data.members.filter(
        (member) => member !== currentUsername,
      )[0];
      window.location.replace(
        `/privatemessage/${data.id}?receiver_name=${receiver}`,
      );
    })
    .catch((err) => {
      //alert(err.response.data.message);
      if (err.response.status === 409) getChatroom(receiver);
    });
};

const getChatroom = async (receiver) => {
  // eslint-disable-next-line no-undef
  const token = getCookie('token');
  // eslint-disable-next-line no-undef
  const username = getCookie('currentUser');
  // eslint-disable-next-line no-undef
  const url = `${API_URL}/messages/private/chatrooms?username=${username}`;
  // eslint-disable-next-line no-undef
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      const chatroom = data.chatrooms.find((e) => e.members.includes(receiver));
      window.location.replace(
        `/privatemessage/${chatroom._id}?receiver_name=${receiver}`,
      );
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

(async () => {
  // eslint-disable-next-line no-undef
  const locationPreference = getCookie('locationPreference');
  if (locationPreference == 'Not Allowed') {
    // eslint-disable-next-line no-undef
    await askUserForLocationPreferences(
      'Allow location sharing to share your info on map with nearby citizen?',
    );
  }
})();
