const labels={catalogue:"Au catalogue officiel",mention:"Mention de soubressade",historique:"Piste historique"};
const colors={catalogue:"#267347",mention:"#bd4525",historique:"#8a7769"};
const initialCenter=[43.71,7.265];
let vendors=[],map,markers,visibleVendors=[],activeMarker=null;
const markerById=new Map();
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const directions=v=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(v.address.replace(" (adresse historique à confirmer)",""));
const validPosition=v=>Number.isFinite(v.lat)&&Number.isFinite(v.lng)&&v.lat>=-90&&v.lat<=90&&v.lng>=-180&&v.lng<=180;
const selectedVendors=()=>{const q=document.getElementById("search").value.trim().toLocaleLowerCase("fr");const kind=document.getElementById("filter").value;return vendors.filter(v=>(kind==="all"||v.status===kind)&&[v.name,v.city,v.address,v.type].join(" ").toLocaleLowerCase("fr").includes(q));};
function fitVisible(){
  if(!map)return;
  const points=visibleVendors.filter(validPosition).map(v=>[v.lat,v.lng]);
  if(points.length>1)map.fitBounds(L.latLngBounds(points),{padding:[42,42],maxZoom:15,animate:true});
  else if(points.length===1)map.setView(points[0],15,{animate:true});
  else map.setView(initialCenter,12,{animate:true});
}
function openVendor(id){
  const marker=markerById.get(id);
  if(!map||!marker)return;
  map.setView(marker.getLatLng(),Math.max(map.getZoom(),15),{animate:true});
  marker.openPopup();
  document.getElementById("carte").scrollIntoView({behavior:"smooth",block:"start"});
}
function render(){
  visibleVendors=selectedVendors();
  document.getElementById("count").textContent=visibleVendors.length;
  document.getElementById("map-count").textContent=visibleVendors.length+" adresse"+(visibleVendors.length>1?"s":"")+" affichée"+(visibleVendors.length>1?"s":"");
  document.getElementById("results").innerHTML=visibleVendors.length?visibleVendors.map(v=>'<article class="vendor"><span class="tag '+escapeHtml(v.status)+'">'+escapeHtml(labels[v.status]||"Adresse")+'</span><div><span class="town">'+escapeHtml(v.city)+' · '+escapeHtml(v.type)+'</span><h3>'+escapeHtml(v.name)+'</h3></div><p>'+escapeHtml(v.address)+'</p><p class="evidence">'+escapeHtml(v.evidence)+'</p>'+(v.priceNote?'<p class="evidence">'+escapeHtml(v.priceNote)+'</p>':'')+'<div class="vendor-actions">'+(validPosition(v)?'<button type="button" class="locate-vendor" data-vendor-id="'+escapeHtml(v.id)+'">Voir sur la carte ↗</button>':'')+'<a href="'+directions(v)+'" target="_blank" rel="noopener noreferrer">Itinéraire ↗</a><a href="'+escapeHtml(v.source)+'" target="_blank" rel="noopener noreferrer">Voir la source ↗</a></div></article>').join(""):'<p>Aucune adresse ne correspond à cette recherche.</p>';
  if(!markers)return;
  markers.clearLayers();
  markerById.clear();
  visibleVendors.forEach(v=>{
    if(!validPosition(v))return;
    const color=colors[v.status]||colors.mention;
    const marker=L.circleMarker([v.lat,v.lng],{radius:11,color:"#fff",weight:3,fillColor:color,fillOpacity:1,opacity:1});
    marker.bindTooltip(escapeHtml(v.name),{direction:"top",offset:[0,-10]});
    marker.bindPopup('<div class="map-popup"><span class="map-popup-status">'+escapeHtml(labels[v.status]||"Adresse")+'</span><strong>'+escapeHtml(v.name)+'</strong><p>'+escapeHtml(v.address)+'</p><small>Position indicative : vérifiez l’adresse avant de partir.</small><div><a href="'+directions(v)+'" target="_blank" rel="noopener noreferrer">Itinéraire ↗</a> · <a href="'+escapeHtml(v.source)+'" target="_blank" rel="noopener noreferrer">Source ↗</a></div></div>');
    marker.on("popupopen",()=>{activeMarker=marker;marker.setStyle({radius:15,weight:4});});
    marker.on("popupclose",()=>{if(activeMarker===marker)activeMarker=null;marker.setStyle({radius:11,weight:3});});
    marker.addTo(markers);
    markerById.set(v.id,marker);
  });
  fitVisible();
  if(map)document.getElementById("map-empty").hidden=visibleVendors.some(validPosition);
}
async function start(){
  try{
    const response=await fetch("./data/vendors.json");
    if(!response.ok)throw Error("Données indisponibles");
    vendors=await response.json();
    vendors.sort((a,b)=>["catalogue","mention","historique"].indexOf(a.status)-["catalogue","mention","historique"].indexOf(b.status));
    if(window.L){
      map=L.map("map",{scrollWheelZoom:false,zoomControl:true}).setView(initialCenter,12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:18}).addTo(map);
      markers=L.featureGroup().addTo(map);
    }else{
      document.getElementById("map-empty").textContent="Carte indisponible. Consultez les adresses et leurs liens d’itinéraire ci-dessus.";
      document.getElementById("map-empty").hidden=false;
      document.getElementById("map-controls").hidden=true;
    }
    render();
  }catch(err){
    document.getElementById("results").textContent="Impossible de charger les adresses. Réessayez plus tard.";
    document.getElementById("map-count").textContent="Adresses indisponibles";
    document.getElementById("map-empty").textContent="Impossible de charger la carte des adresses.";
    document.getElementById("map-empty").hidden=false;
    console.error(err);
  }
}
document.getElementById("search").addEventListener("input",render);
document.getElementById("filter").addEventListener("change",render);
document.getElementById("results").addEventListener("click",event=>{
  const button=event.target.closest(".locate-vendor");
  if(button)openVendor(button.dataset.vendorId);
});
document.getElementById("map-reset").addEventListener("click",fitVisible);
start();
