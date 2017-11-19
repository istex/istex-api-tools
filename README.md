# istex-api-tools

Dépôt regroupant des scripts permettant de réaliser différents traitements plus ou moins complexes en sortie de l'API (ex: reconstituer un état de collection en CSV)

## Normalisation

Il est necessaire de "normaliser" le ficheir de sortie ElasticSearch.
```
node normalizeJson.js sortieElastic.json temp/normalized.json 
```

## Script état de collection

Le script prend en entrée un fichier JSON qui correspond à la sortie d'une requête sur un serveur elasticsearch (exemple : temp/etat-collection-corpus-title-issn-eissn.json)

```
./generer-etat-de-collection-istex.njs mon-fichier.json

```

Voici un exemple d'utilisation du script :
```
./generer-etat-de-collection-istex.njs temp/normalized.json > output.csv
```

## Scripts permettant de connaître les recouvrements ISTEX avec d'autres dépôts

Le % d'openaccess dans ISTEX (en se basant sur le DOI des articles) :
https://github.com/istex/istex-api-tools/blob/master/check-istex-and-oadoi-overlaping.njs

Le % de HAL dans ISTEX (en se basant sur le DOI des articles) :
https://github.com/istex/istex-api-tools/blob/master/check-istex-and-hal-overlaping.njs

Le recouvrement des (E)ISSN d'ISTEX et ceux présents dans l'API de Crossref + comptage sur les [catégories ASJC](https://github.com/plreyes/Scopus) :
https://github.com/istex/istex-api-tools/blob/master/check-istex-and-crossref-issn-db.njs
