# Soubressade — annuaire des vendeurs

MVP statique pour les Alpes-Maritimes. HTML, CSS, JavaScript et Leaflet. Compatible GitHub Pages.

## Fonctionnalités
- Recherche de commerces et filtres par niveau de preuve
- Carte indicative et liens d'itinéraire vers les adresses
- Fiches sourcées, sans affirmation de disponibilité en temps réel
- Proposition d'adresses via les issues GitHub
- Affichage mobile, sitemap et robots.txt

## Ajouter un vendeur
Modifier `data/vendors.json`. Les statuts sont : `catalogue` (catalogue officiel du commerçant), `mention` (mention explicite du produit dans un avis ou un annuaire), `historique` (témoignage ancien). Aucun de ces statuts ne garantit du stock.

Les positions cartographiques sont **indicatives** et nécessitent une géolocalisation précise avant extension nationale. Une piste historique ne doit pas être présentée comme un point de vente actuel confirmé.

## Lancer en local
```bash
python -m http.server 8000
```
Puis ouvrir http://localhost:8000.

## Mise en ligne
Après fusion de la PR dans `main`, dans GitHub : **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**. Adresse prévue : https://trexdbg.github.io/soubressade/

## Sources initiales (16/10/2026)
- https://maisonghibaudopottier.com/charcuterie-traiteur/
- https://www.pagesjaunes.fr/annuaire/nice-06/boucherie-charcuterie
- https://qcunbon.fr/nice/alimentation/boucherie/endroit-acheter-merguez-nice/

Annuaire indépendant non affilié aux vendeurs.