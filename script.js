function initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        const map = new google.maps.Map(document.getElementById("map"), {
          zoom: 12,
          center: userLocation,
        });
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Tu ubicación",
        });
      });
    } else {
      alert("Geolocalización no soportada por tu navegador.");
    }
  }
  