# istex-api-tools

Dépôt regroupant des scripts permettant de réaliser différents traitements plus ou moins complexes en sortie de l'API (ex: reconstituer un état de collection en CSV)

## Script état de collection

Le script prend en entrée un fichier JSON qui correspond à la sortie d'une requête sur un serveur elasticsearch (exemple : temp/etat-collection-corpus-title-issn-eissn.json)

```
./generer-etat-de-collection-istex.njs mon-fichier.json

```

Voici un exemple d'utilisation du script :
```
./generer-etat-de-collection-istex.njs temp/etat-collection-corpus-title-issn-doi-eissn.json > output.csv
```
