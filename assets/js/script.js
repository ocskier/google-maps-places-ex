let map;
let service;
let infowindow;

function initMap() {
  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude: lat, longitude: lon } }) => {
      const here = new google.maps.LatLng(lat, lon);
      map = new google.maps.Map(document.getElementById('map'), {
        center: here,
        zoom: 12,
      });
      let infowindow = new google.maps.InfoWindow({});
      const request = {
        location: here,
        radius: '5000',
        type: ['bar'],
      };
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          for (let i = 0; i < results.length; i++) {
            console.log(results[i]);
            createMarker(results[i]);
          }
          map.setCenter(results[0].geometry.location);
        }
      });
    },
    () => {
      console.log("Couldn't get position!");
    }
  );
}

function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP,
    title: place.name,
  });
  marker.addListener('mouseover', function () {
    toggleBounce(marker);
    infowindow && infowindow.close();
    const request = {
      placeId: place.place_id,
      fields: ['opening_hours'],
    };
    async function callback(placeDetail, status) {
      let hours = [];
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        hours = placeDetail.opening_hours?.periods;
      }
      infowindow = new google.maps.InfoWindow({
        content: `
      <div style="display: flex;">
      ${
        place?.photos
          ? `<img class="place-thumbnail" src=${place.photos[0].getUrl()} alt=${
              place.name
            } style="margin-right: 0.4rem;"/>`
          : ''
      }
        <div>
          <p>${place.name}</p>
          ${
            hours
              ? `<p>Open: ${hours[0].open.hours}:${
                  hours[0].open.minutes < 10
                    ? '0' + hours[0].open.minutes
                    : hours[0].open.minutes
                }</p>
                <p>Close: ${
                  hours[0].close.hours === 0 ? '12' : hours[0].close.hours
                }:${
                  hours[0].close.minutes < 10
                    ? '0' + hours[0].close.minutes
                    : hours[0].close.minutes
                }</p>`
              : ''
          }
          <p>${place.vicinity}</p>
        </div>
      </div>`,
      });
      infowindow.open({
        anchor: marker,
        map,
        shouldFocus: false,
      });
    }
    service.getDetails(request, callback);
  });
  marker.addListener('mouseout', function () {
    toggleBounce(marker);
  });
}

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
